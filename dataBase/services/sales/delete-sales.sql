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