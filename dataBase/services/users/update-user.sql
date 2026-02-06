/*
  Función: update_users
  Descripción: Actualiza un usuario existente con validaciones.
  Parámetros:
    - p_iduser: ID del usuario (debe existir y estar activo).
    - p_nameuser: Nuevo nombre (opcional, 2-50 caracteres).
    - p_email: Nuevo email (opcional, formato válido, único).
    - p_password: Nueva contraseña (opcional, debe cumplir políticas de seguridad).
    - p_roleuser: Nuevo rol (opcional, debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE OR REPLACE FUNCTION update_users(
    p_iduser BIGINT,
    p_nameuser VARCHAR(50) DEFAULT NULL,
    p_email VARCHAR(100) DEFAULT NULL,
    p_password TEXT DEFAULT NULL,
    p_roleuser INTEGER DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_active BOOLEAN;
    v_role_active BOOLEAN;
    v_current_email VARCHAR(100);
    v_password_error_msg TEXT;
BEGIN
    -- Verificar existencia y estado del usuario
    SELECT Active, Email INTO v_user_active, v_current_email 
    FROM Users WHERE IdUser = p_iduser;
    
    IF NOT FOUND THEN
        RETURN 'Error: Usuario no encontrado.';
    END IF;
    IF NOT v_user_active THEN
        RETURN 'Error: No se puede actualizar un usuario eliminado.';
    END IF;

    -- Validar nombre si se proporciona
    IF p_nameuser IS NOT NULL THEN
        IF LENGTH(TRIM(p_nameuser)) < 2 OR LENGTH(TRIM(p_nameuser)) > 50 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 50 caracteres.';
        END IF;
    END IF;

    -- Validar email si se proporciona
    IF p_email IS NOT NULL THEN
        IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RETURN 'Error: Formato de email inválido.';
        END IF;
        
        -- Solo validar unicidad si el email es diferente al actual
        IF LOWER(TRIM(p_email)) != v_current_email THEN
            -- Verificar unicidad excluyendo al usuario actual
            IF EXISTS (
                SELECT 1 
                FROM Users 
                WHERE Email = LOWER(TRIM(p_email)) 
                    AND IdUser != p_iduser 
                    AND Active = true
            ) THEN
                RETURN 'Error: Ya existe otro usuario activo con ese email.';
            END IF;
        END IF;
    END IF;

    -- Validar contraseña si se proporciona
    IF p_password IS NOT NULL THEN
        IF NOT validate_password_strength(p_password) THEN
            v_password_error_msg := 
                'Error: La contraseña debe cumplir con lo siguiente: ' ||
                'mínimo 8 caracteres; ' ||
                'al menos una mayúscula; ' ||
                'al menos una minúscula; ' ||
                'al menos un número; ' ||
                'al menos un carácter especial (!@#$%^&* etc.); ' ||
                'sin espacios en blanco.';
            RETURN v_password_error_msg;
        END IF;
        
        -- Validar que la nueva contraseña no sea igual a las últimas 5 contraseñas
        -- (esto sería una tabla adicional de historial de contraseñas)
        -- Por ahora, solo validamos que no sea igual a la actual
        IF crypt(p_password, (SELECT PasswordUserHash FROM Users WHERE IdUser = p_iduser)) = 
           (SELECT PasswordUserHash FROM Users WHERE IdUser = p_iduser) THEN
            RETURN 'Error: La nueva contraseña no puede ser igual a la actual.';
        END IF;
    END IF;

    -- Validar rol si se proporciona
    IF p_roleuser IS NOT NULL THEN
        SELECT Active INTO v_role_active FROM Roles WHERE IdRole = p_roleuser;
        IF NOT FOUND THEN
            RETURN 'Error: El rol especificado no existe.';
        END IF;
        IF NOT v_role_active THEN
            RETURN 'Error: El rol especificado no está activo.';
        END IF;
    END IF;

    -- Transacción de actualización
    BEGIN
        UPDATE Users
        SET
            NameUser = COALESCE(TRIM(p_nameuser), NameUser),
            Email = COALESCE(LOWER(TRIM(p_email)), Email),
            PasswordUserHash = CASE 
                WHEN p_password IS NOT NULL THEN crypt(p_password, gen_salt('bf', 12))
                ELSE PasswordUserHash
            END,
            RoleUser = COALESCE(p_roleuser, RoleUser),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdUser = p_iduser;

        RETURN 'Usuario actualizado correctamente.';
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: El email ya está registrado por otro usuario.';
        WHEN foreign_key_violation THEN
            RETURN 'Error: El rol especificado no existe.';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar usuario: ' || SQLERRM;
    END;
END;
$$;