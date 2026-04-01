/*
  Funcion: update_sale_status
  Descripcion: Cambia el estado (Status) de una venta activa.
               Solo permite transiciones validas entre estados:
                 - pending: completed
                 - pending: cancelled
                 - cancelled: pending   (reactivacion)
               Una venta 'completed' no puede cambiar de estado.
  Parametros:
    - p_idinternal : ID interno de la venta.
    - p_new_status : Nuevo estado deseado ('pending' | 'completed' | 'cancelled').
  Retorna:
    - VARCHAR(150): Mensaje de exito o error descriptivo.
*/
CREATE OR REPLACE FUNCTION update_sale_status(
    p_idinternal BIGINT,
    p_new_status VARCHAR(20)
)
RETURNS VARCHAR(150)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_status VARCHAR(20);
    v_active         BOOLEAN;
    v_reference      VARCHAR(20);
BEGIN
    -- Validar que el nuevo estado es permitido
    IF p_new_status NOT IN ('pending', 'completed', 'cancelled') THEN
        RETURN 'Error: Estado invalido. Los valores permitidos son: pending, completed, cancelled.';
    END IF;

    -- Obtener estado actual de la venta
    SELECT Status, Active, ReferenceCode
    INTO   v_current_status, v_active, v_reference
    FROM   Sale
    WHERE  IdInternal = p_idinternal;

    IF NOT FOUND THEN
        RETURN 'Error: Venta no encontrada.';
    END IF;

    IF NOT v_active THEN
        RETURN 'Error: No se puede cambiar el estado de una venta eliminada.';
    END IF;

    -- Validar que no se ponga el mismo estado
    IF v_current_status = p_new_status THEN
        RETURN 'Error: La venta ya se encuentra en estado ' || p_new_status || '.';
    END IF;

    -- Validar transiciones permitidas
    IF v_current_status = 'completed' THEN
        RETURN 'Error: Una venta completada no puede cambiar de estado.';
    END IF;

    IF v_current_status = 'cancelled' AND p_new_status = 'completed' THEN
        RETURN 'Error: Una venta cancelada no puede pasar directamente a completada. Debe volver a pending primero.';
    END IF;

    -- Si se cancela, devolver el stock a los productos
    IF p_new_status = 'cancelled' AND v_current_status = 'pending' THEN
        UPDATE Product p
        SET    Stock = Stock + sd.Quantity
        FROM   SaleDetails sd
        WHERE  sd.SaleId = p_idinternal
          AND  sd.Active = true
          AND  p.IdProduct = sd.ProductId;
    END IF;

    -- Si se reactiva (cancelled -> pending), descontar stock nuevamente
    IF p_new_status = 'pending' AND v_current_status = 'cancelled' THEN
        -- Verificar stock suficiente primero
        DECLARE
            v_stock_msg TEXT := '';
        BEGIN
            SELECT STRING_AGG(
                'Stock insuficiente para ' || p.NameProduct ||
                ' (disponible: ' || p.Stock || ', requerido: ' || sd.Quantity || ')',
                ' | '
            )
            INTO v_stock_msg
            FROM SaleDetails sd
            INNER JOIN Product p ON p.IdProduct = sd.ProductId
            WHERE sd.SaleId   = p_idinternal
              AND sd.Active   = true
              AND p.Stock     < sd.Quantity;

            IF v_stock_msg IS NOT NULL THEN
                RETURN 'Error: ' || v_stock_msg;
            END IF;
        END;

        UPDATE Product p
        SET    Stock = Stock - sd.Quantity
        FROM   SaleDetails sd
        WHERE  sd.SaleId   = p_idinternal
          AND  sd.Active   = true
          AND  p.IdProduct = sd.ProductId;
    END IF;

    -- Actualizar el estado
    UPDATE Sale
    SET    Status     = p_new_status,
           DateUpdate = CURRENT_TIMESTAMP
    WHERE  IdInternal = p_idinternal;

    RETURN 'Estado de la venta ' || v_reference || ' actualizado correctamente a ' || p_new_status || '.';

EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error al actualizar el estado: ' || SQLERRM;
END;
$$;