/*
  Funcion: create_paymentforms
  Descripcion: Inserta una nueva forma de pago aplicando validaciones de negocio.
  Parametros:
    - p_code: Codigo unico (2-10 caracteres, no vacio).
    - p_name: Nombre de la forma de pago (2-100 caracteres, no vacio).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION create_paymentforms(
    p_code VARCHAR(10),
    p_name VARCHAR(100)
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idpaymentform INTEGER;
BEGIN

    IF p_code IS NULL OR TRIM(p_code) = '' OR p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN 'Error: Código y nombre son obligatorios.';
    END IF;

    IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 100 caracteres.';
    END IF;

    IF TRIM(p_code) !~ '^[A-Za-z0-9_-]+$' THEN
        RETURN 'Error: El código solo puede contener letras, números, guiones y guiones bajos.';
    END IF;

    IF EXISTS (SELECT 1 FROM PaymentForms WHERE Code = TRIM(p_code) AND Active = true) THEN
        RETURN 'Error: Ya existe una forma de pago activa con ese código.';
    END IF;

    -- Transaccion
    BEGIN
        INSERT INTO PaymentForms (
            Code,
            Name
        ) VALUES (
            TRIM(p_code),
            LOWER(TRIM(p_name))
        ) RETURNING IdPaymentForm INTO v_idpaymentform;

        RETURN 'Forma de pago creada correctamente. ID: ' || v_idpaymentform;
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe una forma de pago con ese código (violación de unicidad).';
        WHEN OTHERS THEN
            RETURN 'Error al crear forma de pago: ' || SQLERRM;
    END;
END;
$$;