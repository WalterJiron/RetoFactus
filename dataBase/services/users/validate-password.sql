/*
  Funcion: validate_password_strength
  Descripcion: Valida que la contrasenia cumpla con los requisitos de seguridad.
  Parametros:
    - p_password: Contrasenia a validar en texto plano.
  Retorna:
    - BOOLEAN: true si cumple, false si no cumple.
*/

CREATE OR REPLACE FUNCTION validate_password_strength(p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Verificar que la contrasenia no sea nula
    IF p_password IS NULL THEN
        RETURN false;
    END IF;

    -- Longitud minima de 8 caracteres
    IF LENGTH(p_password) < 8 THEN
        RETURN false;
    END IF;

    -- Debe contener al menos una letra mayuscula
    IF NOT (p_password ~ '[A-Z]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos una letra minuscula
    IF NOT (p_password ~ '[a-z]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos un numero
    IF NOT (p_password ~ '[0-9]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos un caracter especial
    IF NOT (p_password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>/?]') THEN
        RETURN false;
    END IF;

    -- No debe contener espacios en blanco
    IF p_password ~ '\s' THEN
        RETURN false;
    END IF;

    -- Validacion adicional: no permitir secuencias simples
    IF p_password ~ '(0123456789|1234567890|abcdefghijklmnopqrstuvwxyz|qwertyuiop|asdfghjkl|zxcvbnm)' THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;