/*
  Funcion: delete_paymentforms
  Descripcion: Eliminación lógica de una forma de pago.
  Parametros:
    - p_idpaymentform: ID de la forma de pago (debe existir y estar activa).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_paymentforms(p_idpaymentform INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_code VARCHAR(10);
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    SELECT Code, Name, Active INTO v_code, v_name, v_active
    FROM PaymentForms WHERE IdPaymentForm = p_idpaymentform;
    
    IF NOT FOUND THEN
        RETURN 'Error: Forma de pago no encontrada.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: La forma de pago ya está eliminada.';
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE PaymentForms
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdPaymentForm = p_idpaymentform;

        RETURN 'Forma de pago "' || v_name || '" (Código: ' || v_code || ') eliminada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar forma de pago: ' || SQLERRM;
    END;
END;
$$;
