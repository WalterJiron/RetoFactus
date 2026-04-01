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