/*
  Funcion: restore_paymentforms
  Descripcion: Restaura una forma de pago eliminada lógicamente.
  Parametros:
    - p_idpaymentform: ID de la forma de pago (debe existir y estar inactiva).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_paymentforms(p_idpaymentform INTEGER)
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
    
    IF v_active THEN
        RETURN 'Error: La forma de pago ya está activa.';
    END IF;

    IF EXISTS (SELECT 1 FROM PaymentForms WHERE Code = v_code AND Active = true AND IdPaymentForm != p_idpaymentform) THEN
        RETURN 'Error: Ya existe otra forma de pago activa con el mismo código. No se puede restaurar.';
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE PaymentForms
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdPaymentForm = p_idpaymentform;

        RETURN 'Forma de pago "' || v_name || '" (Código: ' || v_code || ') restaurada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar forma de pago: ' || SQLERRM;
    END;
END;
$$;