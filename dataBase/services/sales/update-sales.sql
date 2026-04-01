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