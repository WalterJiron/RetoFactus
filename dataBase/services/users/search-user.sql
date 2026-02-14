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
    v_establishment_id INT;
    v_login_attempts INTEGER DEFAULT 0;
    v_last_attempt TIMESTAMPTZ;
    v_account_locked BOOLEAN DEFAULT false;
BEGIN
    -- Validar parámetros
    IF p_email IS NULL OR p_password IS NULL THEN
        RETURN 'Error: Email y contraseña son obligatorios.';
    END IF;

    -- Buscar usuario por email incluyendo el establecimiento
    SELECT 
        IdUser, 
        Active, 
        PasswordUserHash,
        IdEstablishment
    INTO 
        v_user_id, 
        v_active, 
        v_stored_hash,
        v_establishment_id
    FROM Users 
    WHERE Email = LOWER(TRIM(p_email));

    IF NOT FOUND THEN
        -- No revelar que el usuario no existe
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    -- Verificar estado del usuario
    IF NOT v_active THEN
        RETURN 'Error: Usuario inactivo o eliminado.';
    END IF;

    -- Validar que el usuario esté asignado a un establecimiento
    IF v_establishment_id IS NULL THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.'; 
    END IF;

    -- Verificar contraseña
    IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    IF v_stored_hash != crypt(p_password, v_stored_hash) THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    -- Actualizar último acceso
    UPDATE Users SET 
        LastLogin = CURRENT_TIMESTAMP
    WHERE IdUser = v_user_id;

    RETURN 'Ok';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: No se pudo verificar las credenciales.';
END;
$$;