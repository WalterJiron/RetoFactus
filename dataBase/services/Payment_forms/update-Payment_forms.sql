/*
  Funcion: update_paymentforms
  Descripcion: Actualiza una forma de pago existente con validaciones.
  Parametros:
    - p_idpaymentform: ID de la forma de pago (debe existir y estar activa).
    - p_code: Nuevo código (opcional, 2-10 caracteres, unico).
    - p_name: Nuevo nombre (opcional, 2-100 caracteres).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_paymentforms(
    p_idpaymentform INTEGER,
    p_code VARCHAR(10) DEFAULT NULL,
    p_name VARCHAR(100) DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_code VARCHAR(10);
    v_current_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN

    SELECT Code, Name, Active INTO v_current_code, v_current_name, v_active
    FROM PaymentForms WHERE IdPaymentForm = p_idpaymentform;
    
    IF NOT FOUND THEN
        RETURN 'Error: Forma de pago no encontrada.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar una forma de pago eliminada.';
    END IF;

    IF p_code IS NOT NULL THEN
        IF TRIM(p_code) = '' THEN
            RETURN 'Error: El código no puede estar vacio.';
        END IF;
        IF LENGTH(TRIM(p_code)) < 2 OR LENGTH(TRIM(p_code)) > 10 THEN
            RETURN 'Error: El código debe tener entre 2 y 10 caracteres.';
        END IF;
        IF TRIM(p_code) !~ '^[A-Za-z0-9_-]+$' THEN
            RETURN 'Error: El código solo puede contener letras, números, guiones y guiones bajos.';
        END IF;
        
        IF TRIM(p_code) != v_current_code THEN
            IF EXISTS (SELECT 1 FROM PaymentForms WHERE Code = TRIM(p_code) AND Active = true AND IdPaymentForm != p_idpaymentform) THEN
                RETURN 'Error: Ya existe otra forma de pago activa con ese código.';
            END IF;
        END IF;
    END IF;

    IF p_name IS NOT NULL THEN
        IF TRIM(p_name) = '' THEN
            RETURN 'Error: El nombre no puede estar vacio.';
        END IF;
        IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 100 caracteres.';
        END IF;
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE PaymentForms
        SET
            Code = COALESCE(TRIM(p_code), Code),
            Name = COALESCE(TRIM(p_name), Name),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdPaymentForm = p_idpaymentform;

        RETURN 'Forma de pago actualizada correctamente.';
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe otra forma de pago con ese código.';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar forma de pago: ' || SQLERRM;
    END;
END;
$$;