-- Funcion auxiliar para calcular totales de una venta a partir de detalles en JSON
CREATE OR REPLACE FUNCTION calculate_sale_totals(p_details JSON)
RETURNS TABLE(subtotal DECIMAL, tax_total DECIMAL, total DECIMAL) AS $$
DECLARE
    v_subtotal DECIMAL := 0;
    v_tax_total DECIMAL := 0;
    v_item JSON;
BEGIN
    FOR v_item IN SELECT * FROM json_array_elements(p_details)
    LOOP
        DECLARE
            v_quantity DECIMAL := (v_item->>'quantity')::DECIMAL;
            v_unit_price DECIMAL := (v_item->>'unitPrice')::DECIMAL;
            v_discount_rate DECIMAL := COALESCE((v_item->>'discountRate')::DECIMAL, 0);
            v_tax_rate DECIMAL := (v_item->>'taxRate')::DECIMAL;
            v_is_excluded BOOLEAN := COALESCE((v_item->>'isExcluded')::BOOLEAN, false);
            v_item_subtotal DECIMAL;
        BEGIN
            v_item_subtotal := v_quantity * v_unit_price * (1 - v_discount_rate/100);
            v_subtotal := v_subtotal + v_item_subtotal;
            IF NOT v_is_excluded THEN
                v_tax_total := v_tax_total + (v_item_subtotal * v_tax_rate/100);
            END IF;
        END;
    END LOOP;
    RETURN QUERY SELECT v_subtotal, v_tax_total, v_subtotal + v_tax_total;
END;
$$ LANGUAGE plpgsql;

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

/*
  Funcion: update_sale
  Descripcion: Actualiza una venta existente en estado 'pending', reemplazando todos sus detalles.
               Recalcula totales y ajusta stock (revierte el anterior y aplica el nuevo).
  Parametros:
    - p_idinternal: ID de la venta a actualizar.
    - p_customerid: Nuevo ID de cliente (opcional).
    - p_paymentformid: Nuevo ID de forma de pago (opcional).
    - p_saledate: Nueva fecha de venta (opcional).
    - p_details: Nuevo JSON array con los detalles (opcional, si se omite no se modifican detalles).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION update_sale(
    p_idinternal BIGINT,
    p_customerid BIGINT DEFAULT NULL,
    p_paymentformid INT DEFAULT NULL,
    p_saledate TIMESTAMPTZ DEFAULT NULL,
    p_details JSON DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status VARCHAR(20);
    v_current_active BOOLEAN;
    v_establishmentid INT;
    v_customerid BIGINT;
    v_paymentformid INT;
    v_saledate TIMESTAMPTZ;
    v_subtotal DECIMAL(15,2);
    v_taxtotal DECIMAL(15,2);
    v_total DECIMAL(15,2);
    v_item JSON;
    v_product RECORD;
    v_stock_ok BOOLEAN := true;
    v_error_msg TEXT := '';
    v_customer_active BOOLEAN;
    v_paymentform_active BOOLEAN;
    v_old_detail RECORD;
BEGIN
    -- 1. Verificar existencia y estado de la venta
    SELECT Status, Active, EstablishmentId, CustomerId, PaymentFormId, SaleDate
    INTO v_current_status, v_current_active, v_establishmentid, v_customerid, v_paymentformid, v_saledate
    FROM Sale WHERE IdInternal = p_idinternal;
    IF NOT FOUND THEN
        RETURN 'Error: Venta no encontrada.';
    END IF;
    IF NOT v_current_active THEN
        RETURN 'Error: No se puede actualizar una venta eliminada.';
    END IF;
    IF v_current_status != 'pending' THEN
        RETURN 'Error: Solo se pueden actualizar ventas en estado pendiente.';
    END IF;

    -- 2. Validar nuevas referencias si se proporcionan
    IF p_customerid IS NOT NULL THEN
        SELECT Active INTO v_customer_active FROM Customers WHERE IdCustomer = p_customerid;
        IF NOT FOUND THEN RETURN 'Error: Cliente no encontrado.'; END IF;
        IF NOT v_customer_active THEN RETURN 'Error: Cliente inactivo.'; END IF;
        v_customerid := p_customerid;
    END IF;

    IF p_paymentformid IS NOT NULL THEN
        SELECT Active INTO v_paymentform_active FROM PaymentForms WHERE IdPaymentForm = p_paymentformid;
        IF NOT FOUND THEN RETURN 'Error: Forma de pago no encontrada.'; END IF;
        IF NOT v_paymentform_active THEN RETURN 'Error: Forma de pago inactiva.'; END IF;
        v_paymentformid := p_paymentformid;
    END IF;

    IF p_saledate IS NOT NULL THEN
        v_saledate := p_saledate;
    END IF;

    -- 3. Si se proporcionan nuevos detalles, validarlos y calcular totales
    IF p_details IS NOT NULL THEN
        IF json_array_length(p_details) = 0 THEN
            RETURN 'Error: La venta debe tener al menos un detalle.';
        END IF;

        -- Validar cada detalle y stock (considerando que vamos a revertir el stock anterior)
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

                -- Validar stock suficiente (considerando que vamos a revertir el anterior)
                -- Necesitamos conocer el stock actual, pero al final se hara un ajuste global.
                -- Aqui solo validamos que el stock actual sea suficiente para la nueva cantidad,
                -- asumiendo que luego se revertira el anterior. Pero podria haber casos donde el
                -- stock actual sea menor porque otros updates intermedios. Para simplificar,
                -- haremos la validacion final despues de revertir el stock anterior.
                -- Por ahora, solo validamos formato.
                IF v_quantity <= 0 THEN
                    v_error_msg := v_error_msg || 'Cantidad debe ser positiva para producto ' || v_product.NameProduct || '. ';
                    v_stock_ok := false;
                END IF;
                IF v_unitprice <= 0 THEN
                    v_error_msg := v_error_msg || 'Precio unitario debe ser positivo para producto ' || v_product.NameProduct || '. ';
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
                IF v_unitmeasureid <= 0 THEN
                    v_error_msg := v_error_msg || 'Unidad de medida invalida para producto ' || v_product.NameProduct || '. ';
                    v_stock_ok := false;
                END IF;
            END;
        END LOOP;

        IF NOT v_stock_ok THEN
            RETURN 'Error: ' || v_error_msg;
        END IF;

        -- Calcular nuevos totales
        SELECT * INTO v_subtotal, v_taxtotal, v_total FROM calculate_sale_totals(p_details);
    END IF;

    -- 4. Iniciar transaccion
    BEGIN
        -- Si hay nuevos detalles, primero revertir stock de los detalles antiguos
        IF p_details IS NOT NULL THEN
            -- Revertir stock de los detalles actuales
            FOR v_old_detail IN SELECT ProductId, Quantity FROM SaleDetails WHERE SaleId = p_idinternal AND Active = true
            LOOP
                UPDATE Product SET Stock = Stock + v_old_detail.Quantity
                WHERE IdProduct = v_old_detail.ProductId;
            END LOOP;

            -- Marcar detalles antiguos como inactivos (eliminacion logica)
            UPDATE SaleDetails SET Active = false, DateDelete = CURRENT_TIMESTAMP, DateUpdate = CURRENT_TIMESTAMP
            WHERE SaleId = p_idinternal;

            -- Insertar nuevos detalles y verificar stock nuevamente (despues de revertir)
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
                    v_current_stock INTEGER;
                BEGIN
                    -- Verificar stock actual (despues de revertir)
                    SELECT Stock INTO v_current_stock FROM Product WHERE IdProduct = v_productid;
                    IF v_current_stock < v_quantity THEN
                        -- Si no hay suficiente, hacer rollback implicito lanzando excepcion
                        RAISE EXCEPTION 'Stock insuficiente para producto ID % (disponible: %, requerido: %)', 
                            v_productid, v_current_stock, v_quantity;
                    END IF;

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
                        UnitMeasureId,
                        Active
                    ) VALUES (
                        p_idinternal,
                        v_productid,
                        v_quantity,
                        v_unitprice,
                        v_discountrate,
                        v_item_subtotal,
                        v_taxrate,
                        v_tributeid,
                        v_isexcluded,
                        v_unitmeasureid,
                        true
                    );

                    -- Descontar stock
                    UPDATE Product SET Stock = Stock - v_quantity
                    WHERE IdProduct = v_productid;
                END;
            END LOOP;
        END IF;

        -- Actualizar cabecera de venta
        UPDATE Sale
        SET
            CustomerId = v_customerid,
            PaymentFormId = v_paymentformid,
            SaleDate = v_saledate,
            Subtotal = COALESCE(v_subtotal, Subtotal),
            TaxTotal = COALESCE(v_taxtotal, TaxTotal),
            Total = COALESCE(v_total, Total),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdInternal = p_idinternal;

        RETURN 'Venta actualizada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar venta: ' || SQLERRM;
    END;
END;
$$;

/*
  Funcion: delete_sale
  Descripcion: Eliminacion logica de una venta en estado 'pending' que no tenga recibos asociados.
  Parametros:
    - p_idinternal: ID de la venta a eliminar.
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION delete_sale(p_idinternal BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_status VARCHAR(20);
    v_active BOOLEAN;
    v_receipt_count INTEGER;
    v_reference VARCHAR(20);
BEGIN
    -- Verificar existencia y estado
    SELECT Status, Active, ReferenceCode INTO v_status, v_active, v_reference
    FROM Sale WHERE IdInternal = p_idinternal;
    IF NOT FOUND THEN
        RETURN 'Error: Venta no encontrada.';
    END IF;
    IF NOT v_active THEN
        RETURN 'Error: La venta ya esta eliminada.';
    END IF;
    IF v_status != 'pending' THEN
        RETURN 'Error: Solo se pueden eliminar ventas en estado pendiente.';
    END IF;

    -- Verificar que no tenga recibos asociados
    SELECT COUNT(*) INTO v_receipt_count FROM Receipt WHERE IdSale = p_idinternal;
    IF v_receipt_count > 0 THEN
        RETURN 'Error: No se puede eliminar la venta porque tiene ' || v_receipt_count || ' recibo(s) asociado(s).';
    END IF;

    -- Transaccion de eliminacion logica
    BEGIN
        UPDATE Sale
        SET Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdInternal = p_idinternal;

        -- Opcionalmente, tambien marcar detalles como inactivos (aunque la FK con ON DELETE CASCADE no los borra fisicamente,
        -- pero podemos mantener consistencia logica)
        UPDATE SaleDetails
        SET Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE SaleId = p_idinternal;

        RETURN 'Venta ' || v_reference || ' eliminada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar venta: ' || SQLERRM;
    END;
END;
$$;

/*
  Funcion: restore_sale
  Descripcion: Restaura una venta eliminada logicamente, volviendo a activar sus detalles.
               Verifica que el stock sea suficiente para los detalles (si la venta estaba en 'pending').
  Parametros:
    - p_idinternal: ID de la venta a restaurar.
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION restore_sale(p_idinternal BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_status VARCHAR(20);
    v_active BOOLEAN;
    v_reference VARCHAR(20);
    v_detail RECORD;
    v_stock_ok BOOLEAN := true;
    v_error_msg TEXT := '';
    v_establishment_active BOOLEAN;
    v_customer_active BOOLEAN;
    v_paymentform_active BOOLEAN;
    v_establishmentid INT;
    v_customerid BIGINT;
    v_paymentformid INT;
BEGIN
    -- Verificar existencia y estado
    SELECT Status, Active, ReferenceCode, EstablishmentId, CustomerId, PaymentFormId
    INTO v_status, v_active, v_reference, v_establishmentid, v_customerid, v_paymentformid
    FROM Sale WHERE IdInternal = p_idinternal;
    IF NOT FOUND THEN
        RETURN 'Error: Venta no encontrada.';
    END IF;
    IF v_active THEN
        RETURN 'Error: La venta ya esta activa.';
    END IF;

    -- Validar que las referencias sigan activas
    SELECT Active INTO v_establishment_active FROM Establishments WHERE IdEstablishment = v_establishmentid;
    IF NOT FOUND OR NOT v_establishment_active THEN
        RETURN 'Error: El establecimiento asociado ya no existe o esta inactivo.';
    END IF;

    SELECT Active INTO v_customer_active FROM Customers WHERE IdCustomer = v_customerid;
    IF NOT FOUND OR NOT v_customer_active THEN
        RETURN 'Error: El cliente asociado ya no existe o esta inactivo.';
    END IF;

    SELECT Active INTO v_paymentform_active FROM PaymentForms WHERE IdPaymentForm = v_paymentformid;
    IF NOT FOUND OR NOT v_paymentform_active THEN
        RETURN 'Error: La forma de pago asociada ya no existe o esta inactiva.';
    END IF;

    -- Si la venta estaba en estado 'pending', verificar stock suficiente para los detalles
    IF v_status = 'pending' THEN
        FOR v_detail IN SELECT ProductId, Quantity FROM SaleDetails WHERE SaleId = p_idinternal AND Active = false
        LOOP
            DECLARE
                v_current_stock INTEGER;
                v_product_name VARCHAR(80);
            BEGIN
                SELECT Stock, NameProduct INTO v_current_stock, v_product_name
                FROM Product WHERE IdProduct = v_detail.ProductId AND Active = true;
                IF NOT FOUND THEN
                    v_error_msg := v_error_msg || 'Producto ID ' || v_detail.ProductId || ' no encontrado o inactivo. ';
                    v_stock_ok := false;
                ELSIF v_current_stock < v_detail.Quantity THEN
                    v_error_msg := v_error_msg || 'Stock insuficiente para producto ' || v_product_name ||
                                   ' (disponible: ' || v_current_stock || ', requerido: ' || v_detail.Quantity || '). ';
                    v_stock_ok := false;
                END IF;
            END;
        END LOOP;

        IF NOT v_stock_ok THEN
            RETURN 'Error: ' || v_error_msg;
        END IF;
    END IF;

    -- Transaccion de restauracion
    BEGIN
        -- Restaurar venta
        UPDATE Sale
        SET Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdInternal = p_idinternal;

        -- Restaurar detalles
        UPDATE SaleDetails
        SET Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE SaleId = p_idinternal;

        -- Si la venta estaba en 'pending', descontar stock nuevamente
        IF v_status = 'pending' THEN
            FOR v_detail IN SELECT ProductId, Quantity FROM SaleDetails WHERE SaleId = p_idinternal AND Active = true
            LOOP
                UPDATE Product SET Stock = Stock - v_detail.Quantity
                WHERE IdProduct = v_detail.ProductId;
            END LOOP;
        END IF;

        RETURN 'Venta ' || v_reference || ' restaurada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar venta: ' || SQLERRM;
    END;
END;
$$;

-- Comentarios para documentacion
COMMENT ON FUNCTION create_sale IS 'Crea una nueva venta con detalles, valida stock y actualiza inventario.';
COMMENT ON FUNCTION update_sale IS 'Actualiza una venta pendiente, reemplazando detalles y ajustando stock.';
COMMENT ON FUNCTION delete_sale IS 'Elimina logicamente una venta pendiente sin recibos.';
COMMENT ON FUNCTION restore_sale IS 'Restaura una venta eliminada, verificando stock si es necesario.';

-- Indices recomendados para mejorar consultas
CREATE INDEX IF NOT EXISTS idx_sale_customer ON Sale(CustomerId) WHERE Active = true;
CREATE INDEX IF NOT EXISTS idx_sale_establishment ON Sale(EstablishmentId) WHERE Active = true;
CREATE INDEX IF NOT EXISTS idx_sale_paymentform ON Sale(PaymentFormId) WHERE Active = true;
CREATE INDEX IF NOT EXISTS idx_sale_status ON Sale(Status) WHERE Active = true;
CREATE INDEX IF NOT EXISTS idx_saledetails_sale ON SaleDetails(SaleId) WHERE Active = true;
CREATE INDEX IF NOT EXISTS idx_saledetails_product ON SaleDetails(ProductId) WHERE Active = true;

-- Trigger para actualizar DateUpdate automaticamente en Sale
CREATE OR REPLACE FUNCTION update_sale_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.DateUpdate = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_sale_timestamp ON Sale;
CREATE TRIGGER trigger_update_sale_timestamp
BEFORE UPDATE ON Sale
FOR EACH ROW
EXECUTE FUNCTION update_sale_timestamp();

-- Trigger para actualizar DateUpdate automaticamente en SaleDetails
CREATE OR REPLACE FUNCTION update_saledetails_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.DateUpdate = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_saledetails_timestamp ON SaleDetails;
CREATE TRIGGER trigger_update_saledetails_timestamp
BEFORE UPDATE ON SaleDetails
FOR EACH ROW
EXECUTE FUNCTION update_saledetails_timestamp();