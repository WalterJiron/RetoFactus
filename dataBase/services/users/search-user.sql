/*
  Función: verify_user
  Descripción: Verifica credenciales de usuario (email y contraseña).
  Parámetros:
    - p_email: Email del usuario.
    - p_password: Contraseña en texto plano.
  Retorna:
    - VARCHAR(100): 'Ok' si las credenciales son válidas y el usuario está activo,
      mensaje de error en caso contrario.
*/

CREATE OR REPLACE FUNCTION verify_user(
    p_email VARCHAR(100),
    p_password TEXT
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_id BIGINT;
    v_active BOOLEAN;
    v_stored_hash TEXT;
    v_login_attempts INTEGER DEFAULT 0;
    v_last_attempt TIMESTAMPTZ;
    v_account_locked BOOLEAN DEFAULT false;
BEGIN
    -- Validar parámetros
    IF p_email IS NULL OR p_password IS NULL THEN
        RETURN 'Error: Email y contraseña son obligatorios.';
    END IF;

    -- Buscar usuario por email
    SELECT 
        IdUser, 
        Active, 
        PasswordUserHash,
        -- Aquí normalmente tendrías campos para intentos de login y bloqueo
        -- Por simplicidad, asumimos que no hay bloqueo por ahora
        0, -- login_attempts
        NULL, -- last_attempt
        false -- account_locked
    INTO 
        v_user_id, 
        v_active, 
        v_stored_hash,
        v_login_attempts,
        v_last_attempt,
        v_account_locked
    FROM Users 
    WHERE Email = LOWER(TRIM(p_email));

    IF NOT FOUND THEN
        -- No revelar que el usuario no existe por seguridad
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    -- Verificar estado del usuario
    IF NOT v_active THEN
        RETURN 'Error: Usuario inactivo o eliminado.';
    END IF;

    -- Verificar si la cuenta está bloqueada (implementación básica)
    -- En una implementación real, tendrías una tabla de intentos de login
    IF v_account_locked THEN
        -- Podrías verificar si ha pasado suficiente tiempo para desbloquear
        IF v_last_attempt IS NOT NULL AND 
           (EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - v_last_attempt)) / 60) < 30 THEN
            RETURN 'Error: Cuenta bloqueada por múltiples intentos fallidos. Intente más tarde.';
        END IF;
    END IF;

    -- Verificar contraseña
    IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    IF v_stored_hash != crypt(p_password, v_stored_hash) THEN
        -- Aquí incrementarías el contador de intentos fallidos
        -- Por ahora solo devolvemos error
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    -- Actualizar último login si las credenciales son correctas
    UPDATE Users
    SET 
        LastLogin = CURRENT_TIMESTAMP,
        DateUpdate = CURRENT_TIMESTAMP
    WHERE IdUser = v_user_id;

    RETURN 'Ok';
EXCEPTION
    WHEN OTHERS THEN
        -- No revelar detalles del error por seguridad
        RETURN 'Error: No se pudo verificar las credenciales.';
END;
$$;