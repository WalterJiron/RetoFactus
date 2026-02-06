/*
  Función: validate_password_strength
  Descripción: Valida que la contraseña cumpla con los requisitos de seguridad.
  Parámetros:
    - p_password: Contraseña a validar en texto plano.
  Retorna:
    - BOOLEAN: true si cumple, false si no cumple.
*/

CREATE OR REPLACE FUNCTION validate_password_strength(p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Verificar que la contraseña no sea nula
    IF p_password IS NULL THEN
        RETURN false;
    END IF;

    -- Longitud mínima de 8 caracteres
    IF LENGTH(p_password) < 8 THEN
        RETURN false;
    END IF;

    -- Debe contener al menos una letra mayúscula
    IF NOT (p_password ~ '[A-Z]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos una letra minúscula
    IF NOT (p_password ~ '[a-z]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos un número
    IF NOT (p_password ~ '[0-9]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos un carácter especial
    -- Caracteres especiales comunes: !@#$%^&*()_+\-=\[\]{};':"\\|,.<>/?
    IF NOT (p_password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>/?]') THEN
        RETURN false;
    END IF;

    -- No debe contener espacios en blanco
    IF p_password ~ '\s' THEN
        RETURN false;
    END IF;

    -- Validación adicional: no permitir secuencias simples (ej: 123456, abcdef)
    IF p_password ~ '(0123456789|1234567890|abcdefghijklmnopqrstuvwxyz|qwertyuiop|asdfghjkl|zxcvbnm)' THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;