/*
  Funcion: create_sale
  Descripcion: Crea una nueva venta con sus detalles, valida existencias y stock, y actualiza inventario.
  Parametros:
    - p_establishmentid: ID del establecimiento (obligatorio, activo).
    - p_customerid: ID del cliente (obligatorio, activo).
    - p_paymentformid: ID de la forma de pago (obligatorio, activo).
    - p_saledate: Fecha de venta (opcional, por defecto CURRENT_TIMESTAMP).
    - p_details: JSON array con los detalles de la venta (ver formato).
  Formato esperado de p_details:
    [
      {
        "productId": bigint,
        "quantity": decimal,
        "unitPrice": decimal,
        "discountRate": decimal (opcional, default 0),
        "taxRate": decimal,
        "tributeId": int (opcional),
        "isExcluded": boolean (opcional, default false),
        "unitMeasureId": int
      },
      ...
    ]
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION create_sale(
    p_establishmentid INT,
    p_customerid BIGINT,
    p_paymentformid INT,
    p_details JSON,
    p_saledate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idinternal BIGINT;
    v_referencecode VARCHAR(20);
    v_subtotal DECIMAL(15,2);
    v_taxtotal DECIMAL(15,2);
    v_total DECIMAL(15,2);
    v_item JSON;
    v_product RECORD;
    v_stock_ok BOOLEAN := true;
    v_error_msg TEXT := '';
    v_establishment_active BOOLEAN;
    v_customer_active BOOLEAN;
    v_paymentform_active BOOLEAN;
BEGIN
    -- 1. Validar parametros obligatorios
    IF p_establishmentid IS NULL OR p_customerid IS NULL OR p_paymentformid IS NULL OR p_details IS NULL THEN
        RETURN 'Error: Establecimiento, cliente, forma de pago y detalles son obligatorios.';
    END IF;

    IF json_array_length(p_details) = 0 THEN
        RETURN 'Error: La venta debe tener al menos un detalle.';
    END IF;

    -- 2. Validar existencia y estado de referencias
    SELECT Active INTO v_establishment_active FROM Establishments WHERE IdEstablishment = p_establishmentid;
    IF NOT FOUND THEN RETURN 'Error: Establecimiento no encontrado.'; END IF;
    IF NOT v_establishment_active THEN RETURN 'Error: Establecimiento inactivo.'; END IF;

    SELECT Active INTO v_customer_active FROM Customers WHERE IdCustomer = p_customerid;
    IF NOT FOUND THEN RETURN 'Error: Cliente no encontrado.'; END IF;
    IF NOT v_customer_active THEN RETURN 'Error: Cliente inactivo.'; END IF;

    SELECT Active INTO v_paymentform_active FROM PaymentForms WHERE IdPaymentForm = p_paymentformid;
    IF NOT FOUND THEN RETURN 'Error: Forma de pago no encontrada.'; END IF;
    IF NOT v_paymentform_active THEN RETURN 'Error: Forma de pago inactiva.'; END IF;

    -- 3. Validar cada detalle y verificar stock suficiente
    FOR v_item IN SELECT * FROM json_array_elements(p_details)
    LOOP
        DECLARE
            v_productid BIGINT := (v_item->>'productId')::BIGINT;
            v_quantity DECIMAL := (v_item->>'quantity')::DECIMAL;
            v_unitprice DECIMAL := (v_item->>'unitPrice')::DECIMAL;
            v_discountrate DECIMAL := COALESCE((v_item->>'discountRate')::DECIMAL, 0);
            v_taxrate DECIMAL := (v_item->>'taxRate')::DECIMAL;
            v_tributeid INT := (v_item->>'tributeId')::INT;
            v_isexcluded BOOLEAN := COALESCE((v_item->>'isExcluded')::BOOLEAN, false);
            v_unitmeasureid INT := (v_item->>'unitMeasureId')::INT;
        BEGIN
            -- Validar producto existente y activo
            SELECT IdProduct, NameProduct, Stock INTO v_product
            FROM Product WHERE IdProduct = v_productid AND Active = true;
            IF NOT FOUND THEN
                v_error_msg := v_error_msg || 'Producto ID ' || v_productid || ' no encontrado o inactivo. ';
                v_stock_ok := false;
                CONTINUE;
            END IF;

            -- Validar stock suficiente
            IF v_product.Stock < v_quantity THEN
                v_error_msg := v_error_msg || 'Stock insuficiente para producto ' || v_product.NameProduct || 
                               ' (disponible: ' || v_product.Stock || ', requerido: ' || v_quantity || '). ';
                v_stock_ok := false;
            END IF;

            -- Validar unidad de medida (podria existir tabla aparte, por ahora solo positivo)
            IF v_unitmeasureid <= 0 THEN
                v_error_msg := v_error_msg || 'Unidad de medida invalida para producto ' || v_product.NameProduct || '. ';
                v_stock_ok := false;
            END IF;

            -- Validar precios positivos
            IF v_unitprice <= 0 THEN
                v_error_msg := v_error_msg || 'Precio unitario debe ser positivo para producto ' || v_product.NameProduct || '. ';
                v_stock_ok := false;
            END IF;
            IF v_quantity <= 0 THEN
                v_error_msg := v_error_msg || 'Cantidad debe ser positiva para producto ' || v_product.NameProduct || '. ';
                v_stock_ok := false;
            END IF;
            IF v_discountrate < 0 OR v_discountrate > 100 THEN
                v_error_msg := v_error_msg || 'Tasa de descuento debe estar entre 0 y 100 para producto ' || v_product.NameProduct || '. ';
                v_stock_ok := false;
            END IF;
            IF v_taxrate < 0 THEN
                v_error_msg := v_error_msg || 'Tasa de impuesto no puede ser negativa para producto ' || v_product.NameProduct || '. ';
                v_stock_ok := false;
            END IF;
        END;
    END LOOP;

    IF NOT v_stock_ok THEN
        RETURN 'Error: ' || v_error_msg;
    END IF;

    -- 4. Calcular totales
    SELECT * INTO v_subtotal, v_taxtotal, v_total FROM calculate_sale_totals(p_details);

    -- 5. Generar IdInternal y ReferenceCode usando la secuencia
    v_idinternal := nextval('secuencia_venta');
    v_referencecode := 'VENTA-' || LPAD(v_idinternal::TEXT, 7, '0');

    -- 6. Iniciar transaccion
    BEGIN
        -- Insertar cabecera de venta
        INSERT INTO Sale (
            IdInternal,
            ReferenceCode,
            EstablishmentId,
            CustomerId,
            PaymentFormId,
            SaleDate,
            Subtotal,
            TaxTotal,
            Total,
            Status,
            Active
        ) VALUES (
            v_idinternal,
            v_referencecode,
            p_establishmentid,
            p_customerid,
            p_paymentformid,
            p_saledate,
            v_subtotal,
            v_taxtotal,
            v_total,
            'pending',
            true
        );

        -- Insertar detalles y actualizar stock
        FOR v_item IN SELECT * FROM json_array_elements(p_details)
        LOOP
            DECLARE
                v_productid BIGINT := (v_item->>'productId')::BIGINT;
                v_quantity DECIMAL := (v_item->>'quantity')::DECIMAL;
                v_unitprice DECIMAL := (v_item->>'unitPrice')::DECIMAL;
                v_discountrate DECIMAL := COALESCE((v_item->>'discountRate')::DECIMAL, 0);
                v_taxrate DECIMAL := (v_item->>'taxRate')::DECIMAL;
                v_tributeid INT := (v_item->>'tributeId')::INT;
                v_isexcluded BOOLEAN := COALESCE((v_item->>'isExcluded')::BOOLEAN, false);
                v_unitmeasureid INT := (v_item->>'unitMeasureId')::INT;
                v_item_subtotal DECIMAL;
            BEGIN
                v_item_subtotal := v_quantity * v_unitprice * (1 - v_discountrate/100);

                INSERT INTO SaleDetails (
                    SaleId,
                    ProductId,
                    Quantity,
                    UnitPrice,
                    DiscountRate,
                    Subtotal,
                    TaxRate,
                    TributeId,
                    IsExcluded,
                    UnitMeasureId
                ) VALUES (
                    v_idinternal,
                    v_productid,
                    v_quantity,
                    v_unitprice,
                    v_discountrate,
                    v_item_subtotal,
                    v_taxrate,
                    v_tributeid,
                    v_isexcluded,
                    v_unitmeasureid
                );

                -- Descontar stock
                UPDATE Product SET Stock = Stock - v_quantity
                WHERE IdProduct = v_productid;
            END;
        END LOOP;

        RETURN 'Venta creada correctamente. ID: ' || v_idinternal || ', Referencia: ' || v_referencecode;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al crear venta: ' || SQLERRM;
    END;
END;
$$;