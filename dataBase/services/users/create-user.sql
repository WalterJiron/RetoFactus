/*
  Funcion: create_users
  Descripcion: Inserta un nuevo usuario aplicando validaciones de negocio.
  Parametros:
    - p_nameuser: Nombre del usuario (2-50 caracteres).
    - p_email: Email unico (formato valido, unico).
    - p_password: Contrasenia en texto plano (debe cumplir politicas de seguridad).
    - p_roleuser: ID del rol (debe existir y estar activo).
    - p_idestablishment: ID del establecimiento (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION create_users(
    p_nameuser VARCHAR(50),
    p_email VARCHAR(100),
    p_password TEXT,
    p_roleuser INTEGER,
    p_idestablishment INTEGER
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_iduser BIGINT;
    v_role_active BOOLEAN;
    v_estab_active BOOLEAN;
    v_password_error_msg TEXT;
BEGIN
    -- Campos obligatorios no nulos
    IF p_nameuser IS NULL OR p_email IS NULL OR p_password IS NULL OR p_roleuser IS NULL OR p_idestablishment IS NULL THEN
        RETURN 'Error: Todos los campos son obligatorios.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_nameuser)) < 2 OR LENGTH(TRIM(p_nameuser)) > 50 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 50 caracteres.';
    END IF;

    -- Validar formato de email
    IF p_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN 'Error: Formato de email inválido.';
    END IF;

    -- Validar fortaleza de contrasenia usando funcion especializada
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

    -- Verificar existencia y estado del rol
    SELECT Active INTO v_role_active FROM Roles WHERE IdRole = p_roleuser;
    IF NOT FOUND THEN
        RETURN 'Error: El rol especificado no existe.';
    END IF;
    IF NOT v_role_active THEN
        RETURN 'Error: El rol especificado no está activo.';
    END IF;

    -- Verificar existencia y estado del establecimiento
    SELECT Active INTO v_estab_active FROM Establishments WHERE IdEstablishment = p_idestablishment;
    IF NOT FOUND THEN
        RETURN 'Error: El establecimiento especificado no existe.';
    END IF;
    IF NOT v_estab_active THEN
        RETURN 'Error: El establecimiento especificado no está activo.';
    END IF;

    -- Verificar unicidad de email (solo usuarios activos)
    IF EXISTS (SELECT 1 FROM Users WHERE Email = LOWER(TRIM(p_email)) AND Active = true) THEN
        RETURN 'Error: Ya existe un usuario activo con ese email.';
    END IF;

    -- Transaccion de insercion
    BEGIN
        INSERT INTO Users (
            NameUser,
            Email,
            PasswordUserHash,
            RoleUser,
            IdEstablishment,
            Active
        ) VALUES (
            TRIM(p_nameuser),
            LOWER(TRIM(p_email)),
            crypt(p_password, gen_salt('bf', 12)), -- Hashing con bcrypt, factor de costo 12
            p_roleuser,
            p_idestablishment,
            true
        ) RETURNING IdUser INTO v_iduser;

        RETURN 'Usuario creado correctamente. ID: ' || v_iduser;
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: El email ya está registrado en el sistema.';
        WHEN foreign_key_violation THEN
            RETURN 'Error: El rol o establecimiento especificado no existe.';
        WHEN OTHERS THEN
            RETURN 'Error al crear usuario: ' || SQLERRM;
    END;
END;
$$;