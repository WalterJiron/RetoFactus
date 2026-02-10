CREATE TABLE Roles(
	IdRole SERIAL PRIMARY KEY NOT NULL,
	Namer VARCHAR(50) NOT NULL,
	Description TEXT NOT NULL,

	DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	DateUpdate TIMESTAMPTZ,
	DateDelete TIMESTAMPTZ,

	Active BOOLEAN DEFAULT TRUE
);

create table Users(
	IdUser BIGSERIAL PRIMARY KEY NOT NULL,
	NameUser VARCHAR(50) NOT NULL,
	Email VARCHAR(100) NOT NULL UNIQUE,
	PasswordUserHash TEXT NOT NULL,
	RoleUser INT REFERENCES Roles(IdRole) ON DELETE RESTRICT ON UPDATE CASCADE,
	
	LastLogin TIMESTAMPTZ,
	DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
	DateUpdate TIMESTAMPTZ,
	DateDelete TIMESTAMPTZ,

	Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Category(
    IdCategory SERIAL PRIMARY KEY NOT NULL,
    NameCategory VARCHAR(60) NOT NULL,
    Description TEXT NOT NULL,

    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,

    Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE SubCategory(
    IdSubCategory SERIAL PRIMARY KEY NOT NULL,
    NameSubCategory VARCHAR(60) NOT NULL,
    Description TEXT NOT NULL,
    CategorySub INT REFERENCES Category(IdCategory) ON DELETE RESTRICT ON UPDATE CASCADE,

    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,

    Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Product(
    IdProduct BIGSERIAL PRIMARY KEY NOT NULL,
    code_reference TEXT,-----
    NameProduct VARCHAR(80) NOT NULL,
    Description TEXT NOT NULL,
    IdSubCategory INT REFERENCES SubCategory(IdSubCategory) ON DELETE RESTRICT ON UPDATE CASCADE NOT NULL,
    Stock INT CHECK(Stock >= 0) NOT NULL,
    MeasurementUnit INT NOT NULL,

    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,

    Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE DetailProduct(
    IdDetailProduct BIGSERIAL PRIMARY KEY NOT NULL,
    IdProduct INT REFERENCES Product(IdProduct) ON DELETE RESTRICT ON UPDATE CASCADE NOT NULL,
    MinStock INT CHECK(MinStock >= 0) NOT NULL,
    PurchasePrice DECIMAL(10,3) NOT NULL,
    SalePrice DECIMAL(10,3) NOT NULL,

    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,

    Active BOOLEAN DEFAULT TRUE
);



















---------------------------------------------------- CRUD ROLES ---------------------------------------------------- 

CREATE OR REPLACE FUNCTION ProcInsertRol(
    p_nombre_rol VARCHAR(50),
    p_descripcion TEXT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_trim_nombre VARCHAR(50);
    v_trim_desc TEXT;
BEGIN
    -- Inicializar mensaje
    mensaje := '';
    
    IF p_nombre_rol IS NULL OR p_descripcion IS NULL THEN
        mensaje := 'Todos los campos son obligatorios';
        RETURN;
    END IF;
    
    v_trim_nombre := TRIM(p_nombre_rol);
    v_trim_desc := TRIM(p_descripcion);
    
    IF LENGTH(v_trim_nombre) < 2 OR LENGTH(v_trim_nombre) > 50 THEN
        mensaje := 'El nombre del rol debe tener al menos 2 caracteres y no exceder 50';
        RETURN;
    END IF;
    
    IF LENGTH(v_trim_desc) < 5 THEN
        mensaje := 'La descripcion debe tener al menos 5 caracteres';
        RETURN;
    END IF;
    
    -- Iniciar transacción
    BEGIN
        PERFORM 1 FROM Roles 
        WHERE UPPER(Namer) = UPPER(v_trim_nombre)
          AND Active = TRUE
        LIMIT 1
        FOR UPDATE;
        
        IF FOUND THEN
            mensaje := 'Ya existe un rol activo con ese nombre';
            RAISE EXCEPTION 'Validación fallida: %', mensaje;
        END IF;
        
        INSERT INTO Roles (Namer, Description)  
        VALUES (v_trim_nombre, v_trim_desc);
        
        IF NOT FOUND THEN
            mensaje := 'Error al insertar el rol';
            RAISE EXCEPTION 'Inserción fallida';
        END IF;
        
        mensaje := 'Rol registrado correctamente';
        
    EXCEPTION
        WHEN unique_violation THEN
            mensaje := 'Ya existe un rol activo con ese nombre';
        
        WHEN check_violation THEN
            mensaje := 'Violación de restricción de datos';

        WHEN OTHERS THEN
            IF mensaje = '' OR mensaje IS NULL THEN
                mensaje := 'Error al registrar rol: ' || SQLERRM;
            END IF;
    END;
    
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION ProcDeleteRol(
    p_idrole INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_active BOOLEAN;
    v_row_count INT;
    v_rol_name VARCHAR(50);
    v_user_count INT;
BEGIN
    -- Validación 1: Código obligatorio
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;
    
    -- Bloque de transacción
    BEGIN
        -- Verificar existencia con bloqueo FOR UPDATE
        -- Esto previene lecturas sucias durante la transacción
        SELECT Active, Namer INTO STRICT v_active, v_rol_name
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;  -- Removido NOWAIT para mejor compatibilidad
        
        -- NOTA: STRICT hace que si no encuentra el registro, lance una excepción
        
        -- Verificar si ya está eliminado (Active = FALSE)
        IF v_active = FALSE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra eliminado', v_rol_name, p_idrole);
            RETURN;
        END IF;
        
        -- Verificar si hay usuarios activos asociados al rol
        -- Contar usuarios activos para dar mensaje más informativo
        SELECT COUNT(*) INTO v_user_count
        FROM Users 
        WHERE RoleUser = p_idrole  -- CORREGIDO: cambiado IdRole por RoleUser
          AND Active = TRUE;
        
        IF v_user_count > 0 THEN
            mensaje := format('No se puede eliminar el rol %s, existen %s usuario(s) activo(s) con este rol', 
                             v_rol_name, v_user_count);
            RETURN;
        END IF;
        
        -- Realizar soft delete
        UPDATE Roles SET 
            Active = FALSE, 
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole
          AND Active = TRUE;
        
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        
        IF v_row_count <> 1 THEN
            mensaje := format('Error inesperado al eliminar el rol %s (ID: %s). Filas afectadas: %s', 
                             v_rol_name, p_idrole, v_row_count);
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        mensaje := format('Rol %s desactivado correctamente', v_rol_name);
        
    EXCEPTION
        -- Excepción específica cuando no se encuentra el registro
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        -- Excepción cuando el registro está bloqueado por otra transacción
        WHEN lock_not_available THEN  -- CORREGIDO: snake_case para consistencia
            mensaje := 'El rol está siendo modificado por otro usuario. Intente nuevamente en unos momentos';
            RETURN;
        WHEN OTHERS THEN
            -- Asegurar que siempre haya un mensaje de retorno
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al desactivar rol: ' || SQLERRM;
            END IF;
            -- Re-lanzar la excepción original para rollback automático
            RAISE;
    END; 
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION ProcRecoverRol(
    p_idrole INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_active BOOLEAN;
    v_namer VARCHAR(50);
    v_row_count INT;
    v_existe_activo BOOLEAN;
BEGIN
    -- Validación 1: Código obligatorio
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;

    BEGIN
        -- Verificar existencia y estado con bloqueo FOR UPDATE
        SELECT Active, Namer INTO STRICT v_active, v_namer
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;  -- Bloquea la fila para esta transacción

        -- Validar si ya está activo
        IF v_active = TRUE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra activo', v_namer, p_idrole);
            RETURN;
        END IF;

        -- Verificar que el nombre del rol no esté siendo usado por otro rol activo
        SELECT EXISTS(
            SELECT 1 FROM Roles 
            WHERE Namer = v_namer 
              AND IdRole <> p_idrole
              AND Active = TRUE
              AND DateDelete IS NULL  -- Aseguramos que no esté eliminado
        ) INTO v_existe_activo;

        IF v_existe_activo THEN
            mensaje := format('No se puede recuperar el rol %s, ya existe un rol activo con ese nombre', v_namer);
            RETURN;
        END IF;

        -- Recuperación del rol (activación) - CORREGIDO: p_idrole en lugar de p_idrol
        UPDATE Roles SET 
            Active = TRUE, 
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole  -- CORRECCIÓN AQUÍ
          AND Active = FALSE;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;

        -- Validar que se actualizó exactamente 1 registro
        IF v_row_count <> 1 THEN
            mensaje := format('Error inesperado al recuperar el rol %s (ID: %s). Filas afectadas: %s', 
                             v_namer, p_idrole, v_row_count);
            RAISE EXCEPTION '%', mensaje;
        END IF;

        mensaje := format('Rol %s recuperado correctamente', v_namer);

    EXCEPTION
        -- Cuando no se encuentra el registro
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        
        -- Cuando hay violación de unicidad del nombre (si tienes restricción única)
        WHEN unique_violation THEN
            mensaje := format('Ya existe un rol activo con el nombre %s. No se puede recuperar.', v_namer);
            RAISE;
        
        -- Cualquier otro error
        WHEN OTHERS THEN
            -- Si el mensaje aún no está establecido, usa el error de PostgreSQL
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al recuperar rol: ' || SQLERRM;
            END IF;
            -- Re-lanzamos para asegurar rollback
            RAISE;
    END;
END;
$$ LANGUAGE plpgsql;


CREATE OR REPLACE FUNCTION ProcUpdateRol_serial(
    p_idrole INT,
    p_nombre_rol VARCHAR(50),
    p_descripcion TEXT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_trim_nombre VARCHAR(50);
    v_trim_desc TEXT;
    v_active BOOLEAN;
    v_row_count INT;
BEGIN
    -- Campos obligatorios
    IF p_idrole IS NULL OR p_nombre_rol IS NULL OR p_descripcion IS NULL THEN
        mensaje := 'Todos los campos son obligatorios';
        RETURN;
    END IF;
    
    -- Trimear valores
    v_trim_nombre := TRIM(p_nombre_rol);
    v_trim_desc := TRIM(p_descripcion);
    
    -- Longitud del nombre
    IF LENGTH(v_trim_nombre) < 3 OR LENGTH(v_trim_nombre) > 50 THEN
        mensaje := 'El nombre del rol debe tener al menos 3 caracteres y maximo 50';
        RETURN;
    END IF;
    
    -- Longitud de la descripción
    IF LENGTH(v_trim_desc) < 10 THEN
        mensaje := 'La descripcion debe tener al menos 10 caracteres';
        RETURN;
    END IF;
    
    -- Bloque de transacción
    BEGIN
        -- Verificar existencia y estado con bloqueo
        SELECT Active INTO v_active
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;
        
        IF NOT FOUND THEN
            mensaje := 'El rol no existe en la base de datos';
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        IF v_active = FALSE THEN
            mensaje := 'El rol se encuentra inactivo';
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        -- Verificar nombre único excluyendo el actual (case-insensitive)
        PERFORM 1 FROM Roles
        WHERE UPPER(Namer) = UPPER(v_trim_nombre)
          AND IdRole != p_idrole
          AND Active = TRUE;
        
        IF FOUND THEN
            mensaje := 'Ya existe un rol activo con ese nombre';
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        -- Actualizar
        UPDATE Roles SET
            Namer = v_trim_nombre,
            Description = v_trim_desc,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole
          AND Active = TRUE;
        
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        
        IF v_row_count <> 1 THEN
            mensaje := 'Error inesperado al actualizar el rol';
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        mensaje := 'Rol actualizado correctamente';
        
    EXCEPTION WHEN OTHERS THEN
        IF mensaje = '' OR mensaje IS NULL THEN
            mensaje := 'Error al actualizar rol: ' || SQLERRM;
        END IF;
    END;  
END;
$$ LANGUAGE plpgsql;





---------------------------------------------------- CRUD USERS ----------------------------------------------------
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


/*
  Función: create_users
  Descripción: Inserta un nuevo usuario aplicando validaciones de negocio.
  Parámetros:
    - p_nameuser: Nombre del usuario (2-50 caracteres).
    - p_email: Email único (formato válido, único).
    - p_password: Contraseña en texto plano (debe cumplir políticas de seguridad).
    - p_roleuser: ID del rol (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION create_users(
    p_nameuser VARCHAR(50),
    p_email VARCHAR(100),
    p_password TEXT,
    p_roleuser INTEGER
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_iduser BIGINT;
    v_role_active BOOLEAN;
    v_password_error_msg TEXT;
BEGIN
    -- Campos obligatorios no nulos
    IF p_nameuser IS NULL OR p_email IS NULL OR p_password IS NULL OR p_roleuser IS NULL THEN
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

    -- Validar fortaleza de contraseña usando función especializada
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

    -- Verificar unicidad de email (solo usuarios activos)
    IF EXISTS (SELECT 1 FROM Users WHERE Email = LOWER(TRIM(p_email)) AND Active = true) THEN
        RETURN 'Error: Ya existe un usuario activo con ese email.';
    END IF;

    -- Transacción de inserción
    BEGIN
        INSERT INTO Users (
            NameUser,
            Email,
            PasswordUserHash,
            RoleUser,
            Active
        ) VALUES (
            TRIM(p_nameuser),
            LOWER(TRIM(p_email)),
            crypt(p_password, gen_salt('bf', 12)), -- Hashing con bcrypt, factor de costo 12
            p_roleuser,
            true
        ) RETURNING IdUser INTO v_iduser;

        RETURN 'Usuario creado correctamente. ID: ' || v_iduser;
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: El email ya está registrado en el sistema.';
        WHEN foreign_key_violation THEN
            RETURN 'Error: El rol especificado no existe.';
        WHEN OTHERS THEN
            RETURN 'Error al crear usuario: ' || SQLERRM;
    END;
END;
$$;


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


/*
  Función: delete_users
  Descripción: Eliminación lógica de un usuario.
  Parámetros:
    - p_iduser: ID del usuario a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE OR REPLACE FUNCTION delete_users(p_iduser BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id INTEGER;
    v_admin_count INTEGER;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser) THEN
        RETURN 'Error: Usuario no encontrado.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser AND Active = false) THEN
        RETURN 'Error: El usuario ya está eliminado.';
    END IF;

    -- Validación de negocio: No permitir eliminar el último usuario administrador
    -- Asumiendo que el rol con IdRole = 1 es el administrador
    SELECT RoleUser INTO v_role_id FROM Users WHERE IdUser = p_iduser;
    
    IF v_role_id = 1 THEN -- Si es administrador
        SELECT COUNT(*) INTO v_admin_count 
        FROM Users 
        WHERE RoleUser = 1 AND Active = true AND IdUser != p_iduser;
        
        IF v_admin_count = 0 THEN
            RETURN 'Error: No se puede eliminar el último usuario administrador.';
        END IF;
    END IF;

    -- Transacción de eliminación lógica
    BEGIN
        UPDATE Users
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdUser = p_iduser;

        RETURN 'Usuario eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar usuario: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: restore_users
  Descripción: Restaura un usuario eliminado lógicamente.
  Parámetros:
    - p_iduser: ID del usuario a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE OR REPLACE FUNCTION restore_users(p_iduser BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_email VARCHAR(100);
    v_role_id INTEGER;
    v_role_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser) THEN
        RETURN 'Error: Usuario no encontrado.';
    END IF;

    -- Verificar que esté eliminado
    IF NOT EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser AND Active = false) THEN
        RETURN 'Error: El usuario ya está activo.';
    END IF;

    -- Obtener datos del usuario
    SELECT Email, RoleUser INTO v_email, v_role_id 
    FROM Users WHERE IdUser = p_iduser;

    -- Validar que no exista otro usuario activo con el mismo email
    IF EXISTS (
        SELECT 1 
        FROM Users 
        WHERE Email = v_email 
            AND IdUser != p_iduser 
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otro usuario activo con el mismo email. No se puede restaurar.';
    END IF;

    -- Verificar que el rol del usuario aún exista y esté activo
    SELECT Active INTO v_role_active FROM Roles WHERE IdRole = v_role_id;
    IF NOT FOUND THEN
        RETURN 'Error: El rol asignado al usuario ya no existe.';
    END IF;
    IF NOT v_role_active THEN
        RETURN 'Error: El rol asignado al usuario está inactivo.';
    END IF;

    -- Transacción de restauración
    BEGIN
        UPDATE Users
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdUser = p_iduser;

        RETURN 'Usuario restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar usuario: ' || SQLERRM;
    END;
END;
$$;


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
        PasswordUserHash
    INTO 
        v_user_id, 
        v_active, 
        v_stored_hash
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

    -- Verificar contraseña
    IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    IF v_stored_hash != crypt(p_password, v_stored_hash) THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    UPDATE Users SET 
        LastLogin = CURRENT_TIMESTAMP
    WHERE IdUser = v_user_id;

    RETURN 'Ok';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: No se pudo verificar las credenciales.';
END;
$$;





---------------------------------------------------- CRUD CATEGORY ----------------------------------------------------
/*
  Función: validate_category_name_unique
  Descripción: Función auxiliar para validar unicidad del nombre de categoría.
  Parámetros:
    - p_namecategory: Nombre a validar.
    - p_exclude_id: ID de categoría a excluir (opcional).
  Retorna:
    - BOOLEAN: true si el nombre es único, false si no lo es.
*/
CREATE OR REPLACE FUNCTION validate_category_name_unique(
    p_namecategory VARCHAR(60),
    p_exclude_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_exclude_id IS NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM Category
        WHERE NameCategory = TRIM(p_namecategory);
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM Category
        WHERE NameCategory = TRIM(p_namecategory)
        AND IdCategory != p_exclude_id;
    END IF;
    
    RETURN v_count = 0;
END;
$$;


/*
  Función: create_category
  Descripción: Inserta una nueva categoría aplicando validaciones de negocio.
  Parámetros:
    - p_namecategory: Nombre de la categoría (2-60 caracteres, único).
    - p_description: Descripción de la categoría (no vacía).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE OR REPLACE FUNCTION create_category(
    p_namecategory VARCHAR(60),
    p_description TEXT
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idcategory INTEGER;
BEGIN
    -- Campos obligatorios no nulos
    IF p_namecategory IS NULL OR p_description IS NULL THEN
        RETURN 'Error: Nombre y descripción son obligatorios.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_namecategory)) < 2 OR LENGTH(TRIM(p_namecategory)) > 60 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 60 caracteres.';
    END IF;

    -- Validar que la descripción no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- Validar unicidad del nombre usando la función auxiliar
    IF NOT validate_category_name_unique(p_namecategory) THEN
        RETURN 'Error: Ya existe una categoría activa con ese nombre.';
    END IF;

    -- Validar unicidad del nombre (solo categorías activas)
    IF EXISTS (
        SELECT 1 
        FROM Category 
        WHERE NameCategory = TRIM(p_namecategory) 
        AND Active = true
    ) THEN
        RETURN 'Error: Ya existe una categoría activa con ese nombre.';
    END IF;

    -- Transacción de inserción
    BEGIN
        INSERT INTO Category (
            NameCategory,
            Description,
            Active
        ) VALUES (
            TRIM(p_namecategory),
            TRIM(p_description),
            true
        ) RETURNING IdCategory INTO v_idcategory;

        RETURN 'Categoría creada correctamente. ID: ' || v_idcategory;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al crear categoría: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: update_category
  Descripción: Actualiza una categoría existente con validaciones.
  Parámetros:
    - p_idcategory: ID de la categoría (debe existir y estar activa).
    - p_namecategory: Nuevo nombre (opcional, 2-60 caracteres, único).
    - p_description: Nueva descripción (opcional, no vacía).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_category(
    p_idcategory INTEGER,
    p_namecategory VARCHAR(60) DEFAULT NULL,
    p_description TEXT DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_name VARCHAR(60);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia y estado de la categoría
    SELECT NameCategory, Active INTO v_current_name, v_active
    FROM Category WHERE IdCategory = p_idcategory;
    
    IF NOT FOUND THEN
        RETURN 'Error: Categoría no encontrada.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar una categoría eliminada.';
    END IF;

    -- Validar nombre si se proporciona
    IF p_namecategory IS NOT NULL THEN
        IF LENGTH(TRIM(p_namecategory)) < 2 OR LENGTH(TRIM(p_namecategory)) > 60 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 60 caracteres.';
        END IF;
        
        -- Solo validar unicidad si el nombre es diferente al actual
        IF TRIM(p_namecategory) != v_current_name THEN
            -- Verificar unicidad excluyendo la categoría actual usando la función auxiliar
            IF NOT validate_category_name_unique(p_namecategory, p_idcategory) THEN
                RETURN 'Error: Ya existe otra categoría activa con ese nombre.';
            END IF;
        END IF;
    END IF;

    -- Validar descripción si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- Transacción de actualización
    BEGIN
        UPDATE Category SET
            NameCategory = COALESCE(TRIM(p_namecategory), NameCategory),
            Description = COALESCE(TRIM(p_description), Description),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCategory = p_idcategory;

        -- Verificar si se actualizó algún registro
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo actualizar la categoría.';
        END IF;

        RETURN 'Categoría actualizada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar categoría: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: delete_category
  Descripción: Eliminación lógica de una categoría con validaciones de dependencias.
  Parámetros:
    - p_idcategory: ID de la categoría a eliminar (debe existir y estar activa).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_category(p_idcategory INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_subcategory_count INTEGER;
    v_product_count INTEGER;
    v_category_name VARCHAR(60);
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Category WHERE IdCategory = p_idcategory) THEN
        RETURN 'Error: Categoría no encontrada.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM Category WHERE IdCategory = p_idcategory AND Active = false) THEN
        RETURN 'Error: La categoría ya está eliminada.';
    END IF;

    -- Obtener nombre de la categoría para mensajes de error
    SELECT NameCategory INTO v_category_name 
    FROM Category WHERE IdCategory = p_idcategory;

    -- Validar que no existan subcategorías activas dependientes
    SELECT COUNT(*) INTO v_subcategory_count
    FROM SubCategory 
    WHERE CategorySub = p_idcategory 
    AND Active = true;

    IF v_subcategory_count > 0 THEN
        RETURN 'Error: No se puede eliminar la categoría "' || v_category_name || 
               '" porque tiene ' || v_subcategory_count || 
               ' subcategoría(s) activa(s) asociada(s).';
    END IF;

    -- Validación adicional: productos dependientes indirectamente
    -- Verificar si hay productos activos en subcategorías inactivas de esta categoría
    SELECT COUNT(DISTINCT p.IdProduct) INTO v_product_count
    FROM Product p
    INNER JOIN SubCategory sc ON p.IdSubCategory = sc.IdSubCategory
    WHERE sc.CategorySub = p_idcategory 
    AND p.Active = true;

    IF v_product_count > 0 THEN
        RETURN 'Error: No se puede eliminar la categoría "' || v_category_name || 
               '" porque tiene ' || v_product_count || 
               ' producto(s) activo(s) en sus subcategorías.';
    END IF;

    -- Transacción de eliminación lógica
    BEGIN
        -- Primero, eliminar lógicamente las subcategorías (si existen inactivas)
        UPDATE SubCategory
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE CategorySub = p_idcategory 
        AND Active = true;

        -- Luego, eliminar la categoría principal
        UPDATE Category
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCategory = p_idcategory;

        -- Verificar si se realizó la eliminación
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo eliminar la categoría.';
        END IF;

        RETURN 'Categoría "' || v_category_name || '" eliminada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar categoría: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: restore_category
  Descripción: Restaura una categoría eliminada lógicamente.
  Parámetros:
    - p_idcategory: ID de la categoría a restaurar (debe existir y estar inactiva).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_category(p_idcategory INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_namecategory VARCHAR(60);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Category WHERE IdCategory = p_idcategory) THEN
        RETURN 'Error: Categoría no encontrada.';
    END IF;

    -- Obtener información de la categoría
    SELECT NameCategory, Active INTO v_namecategory, v_active
    FROM Category WHERE IdCategory = p_idcategory;

    -- Verificar que esté eliminada
    IF v_active THEN
        RETURN 'Error: La categoría ya está activa.';
    END IF;

    -- Validar que no exista otra categoría activa con el mismo nombre
    IF EXISTS (
        SELECT 1 
        FROM Category 
        WHERE NameCategory = v_namecategory 
            AND IdCategory != p_idcategory 
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otra categoría activa con el mismo nombre. No se puede restaurar.';
    END IF;

    -- Transacción de restauración
    BEGIN
        UPDATE Category
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCategory = p_idcategory;

        RETURN 'Categoría restaurada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar categoría: ' || SQLERRM;
    END;
END;
$$;





---------------------------------------------------- CRUD SUB CATEGORY ----------------------------------------------------
/*
  Función: create_subcategory
  Descripción: Inserta una nueva subcategoría aplicando validaciones de negocio.
  Parámetros:
    - p_namesubcategory: Nombre de la subcategoría (2-60 caracteres, único en la categoría).
    - p_description: Descripción de la subcategoría (no vacía).
    - p_categorysub: ID de la categoría padre (debe existir y estar activa).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE OR REPLACE FUNCTION create_subcategory(
    p_namesubcategory VARCHAR(60),
    p_description TEXT,
    p_categorysub INTEGER
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idsubcategory INTEGER;
    v_category_active BOOLEAN;
    v_category_exists BOOLEAN;
BEGIN
    -- Validaciones
    -- Campos obligatorios no nulos
    IF p_namesubcategory IS NULL OR p_description IS NULL OR p_categorysub IS NULL THEN
        RETURN 'Error: Todos los campos son obligatorios.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_namesubcategory)) < 2 OR LENGTH(TRIM(p_namesubcategory)) > 60 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 60 caracteres.';
    END IF;

    --Validar que la descripción no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- Verificar existencia y estado de la categoría padre
    SELECT EXISTS(SELECT 1 FROM Category WHERE IdCategory = p_categorysub), 
           COALESCE((SELECT Active FROM Category WHERE IdCategory = p_categorysub), false)
    INTO v_category_exists, v_category_active;
    
    IF NOT v_category_exists THEN
        RETURN 'Error: La categoría especificada no existe.';
    END IF;
    
    IF NOT v_category_active THEN
        RETURN 'Error: La categoría especificada está inactiva.';
    END IF;

    -- Validar unicidad del nombre dentro de la misma categoría (solo activas)
    IF EXISTS (
        SELECT 1 
        FROM SubCategory 
        WHERE NameSubCategory = TRIM(p_namesubcategory) 
        AND CategorySub = p_categorysub
    ) THEN
        RETURN 'Error: Ya existe una subcategoría con ese nombre en esta categoría.';
    END IF;

    -- Transacción de inserción
    BEGIN
        INSERT INTO SubCategory (
            NameSubCategory,
            Description,
            CategorySub,
            Active
        ) VALUES (
            TRIM(p_namesubcategory),
            TRIM(p_description),
            p_categorysub,
            true
        ) RETURNING IdSubCategory INTO v_idsubcategory;

        RETURN 'Subcategoría creada correctamente. ID: ' || v_idsubcategory;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN 'Error: La categoría especificada no existe.';
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe una subcategoría con ese nombre en la categoría.';
        WHEN OTHERS THEN
            RETURN 'Error al crear subcategoría: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: update_subcategory
  Descripción: Actualiza una subcategoría existente con validaciones.
  Parámetros:
    - p_idsubcategory: ID de la subcategoría a actualizar (debe existir y estar activa).
    - p_namesubcategory: Nuevo nombre (opcional, 2-60 caracteres, único en la categoría).
    - p_description: Nueva descripción (opcional, no vacía).
    - p_categorysub: Nueva categoría padre (opcional, debe existir y estar activa).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_subcategory(
    p_idsubcategory INTEGER,
    p_namesubcategory VARCHAR(60) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_categorysub INTEGER DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_name VARCHAR(60);
    v_current_category INTEGER;
    v_active BOOLEAN;
    v_category_active BOOLEAN;
    v_category_exists BOOLEAN;
BEGIN
    -- 1. Verificar existencia y estado de la subcategoría
    SELECT NameSubCategory, CategorySub, Active 
    INTO v_current_name, v_current_category, v_active
    FROM SubCategory WHERE IdSubCategory = p_idsubcategory;
    
    IF NOT FOUND THEN
        RETURN 'Error: Subcategoría no encontrada.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar una subcategoría eliminada.';
    END IF;

    -- 2. Validar nombre si se proporciona
    IF p_namesubcategory IS NOT NULL THEN
        IF LENGTH(TRIM(p_namesubcategory)) < 2 OR LENGTH(TRIM(p_namesubcategory)) > 60 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 60 caracteres.';
        END IF;
        
        -- Obtener la categoría a usar (nueva o actual)
        DECLARE
            v_target_category INTEGER;
        BEGIN
            v_target_category := COALESCE(p_categorysub, v_current_category);
            
            -- Solo validar unicidad si el nombre es diferente al actual o la categoría cambia
            IF TRIM(p_namesubcategory) != v_current_name OR v_target_category != v_current_category THEN
                -- Verificar unicidad excluyendo la subcategoría actual
                IF EXISTS (
                    SELECT 1 
                    FROM SubCategory 
                    WHERE NameSubCategory = TRIM(p_namesubcategory) 
                        AND CategorySub = v_target_category
                        AND IdSubCategory != p_idsubcategory
                        AND Active = true
                ) THEN
                    RETURN 'Error: Ya existe otra subcategoría activa con ese nombre en esta categoría.';
                END IF;
            END IF;
        END;
    END IF;

    -- 3. Validar descripción si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- 4. Validar categoría si se proporciona
    IF p_categorysub IS NOT NULL THEN
        -- Verificar existencia
        SELECT EXISTS(SELECT 1 FROM Category WHERE IdCategory = p_categorysub),
               COALESCE((SELECT Active FROM Category WHERE IdCategory = p_categorysub), false)
        INTO v_category_exists, v_category_active;
        
        IF NOT v_category_exists THEN
            RETURN 'Error: La nueva categoría especificada no existe.';
        END IF;
        
        IF NOT v_category_active THEN
            RETURN 'Error: La nueva categoría especificada está inactiva.';
        END IF;
        
        -- Si cambia la categoría, validar que no haya productos activos dependientes
        IF p_categorysub != v_current_category THEN
            IF EXISTS (
                SELECT 1 
                FROM Product 
                WHERE IdSubCategory = p_idsubcategory 
                AND Active = true
                LIMIT 1
            ) THEN
                RETURN 'Error: No se puede cambiar la categoría porque hay productos activos asociados.';
            END IF;
        END IF;
    END IF;

    -- Transacción de actualización
    BEGIN
        UPDATE SubCategory
        SET
            NameSubCategory = COALESCE(TRIM(p_namesubcategory), NameSubCategory),
            Description = COALESCE(TRIM(p_description), Description),
            CategorySub = COALESCE(p_categorysub, CategorySub),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdSubCategory = p_idsubcategory;

        -- Verificar si se actualizó algún registro
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo actualizar la subcategoría.';
        END IF;

        RETURN 'Subcategoría actualizada correctamente.';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN 'Error: La categoría especificada no existe.';
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe una subcategoría con ese nombre en la categoría.';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar subcategoría: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: delete_subcategory
  Descripción: Eliminación lógica de una subcategoría con validaciones de dependencias.
  Parámetros:
    - p_idsubcategory: ID de la subcategoría a eliminar (debe existir y estar activa).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_subcategory(p_idsubcategory INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_count INTEGER;
    v_subcategory_name VARCHAR(60);
    v_category_id INTEGER;
    v_category_name VARCHAR(60);
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM SubCategory WHERE IdSubCategory = p_idsubcategory) THEN
        RETURN 'Error: Subcategoría no encontrada.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM SubCategory WHERE IdSubCategory = p_idsubcategory AND Active = false) THEN
        RETURN 'Error: La subcategoría ya está eliminada.';
    END IF;

    -- Obtener información de la subcategoría y su categoría
    SELECT sc.NameSubCategory, sc.CategorySub, c.NameCategory
    INTO v_subcategory_name, v_category_id, v_category_name
    FROM SubCategory sc
    LEFT JOIN Category c ON sc.CategorySub = c.IdCategory
    WHERE sc.IdSubCategory = p_idsubcategory;


    -- Validar que no existan productos activos dependientes
    SELECT COUNT(*) INTO v_product_count
    FROM Product 
    WHERE IdSubCategory = p_idsubcategory 
    AND Active = true;

    IF v_product_count > 0 THEN
        RETURN 'Error: No se puede eliminar la subcategoría "' || v_subcategory_name || 
               '" porque tiene ' || v_product_count || 
               ' producto(s) activo(s) asociado(s).';
    END IF;

    -- Transacción de eliminación lógica
    BEGIN
        UPDATE SubCategory
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdSubCategory = p_idsubcategory;

        -- Verificar si se realizó la eliminación
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo eliminar la subcategoría.';
        END IF;

        RETURN 'Subcategoría "' || v_subcategory_name || '" eliminada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar subcategoría: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: restore_subcategory
  Descripción: Restaura una subcategoría eliminada lógicamente.
  Parámetros:
    - p_idsubcategory: ID de la subcategoría a restaurar (debe existir y estar inactiva).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_subcategory(p_idsubcategory INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_subcategory_name VARCHAR(60);
    v_category_id INTEGER;
    v_active BOOLEAN;
    v_category_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM SubCategory WHERE IdSubCategory = p_idsubcategory) THEN
        RETURN 'Error: Subcategoría no encontrada.';
    END IF;

    -- Obtener información de la subcategoría
    SELECT NameSubCategory, CategorySub, Active 
    INTO v_subcategory_name, v_category_id, v_active
    FROM SubCategory WHERE IdSubCategory = p_idsubcategory;

    -- Verificar que esté eliminada
    IF v_active THEN
        RETURN 'Error: La subcategoría ya está activa.';
    END IF;

    -- Verificar que la categoría padre exista y esté activa
    SELECT Active INTO v_category_active 
    FROM Category WHERE IdCategory = v_category_id;
    
    IF NOT FOUND THEN
        RETURN 'Error: La categoría padre ya no existe. No se puede restaurar.';
    END IF;
    
    IF NOT v_category_active THEN
        RETURN 'Error: La categoría padre está inactiva. Active primero la categoría.';
    END IF;

    -- Validar que no exista otra subcategoría activa con el mismo nombre en la misma categoría
    IF EXISTS (
        SELECT 1 
        FROM SubCategory 
        WHERE NameSubCategory = v_subcategory_name 
            AND CategorySub = v_category_id
            AND IdSubCategory != p_idsubcategory
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otra subcategoría activa con el mismo nombre en esta categoría. No se puede restaurar.';
    END IF;

    -- Transacción de restauración
    BEGIN
        UPDATE SubCategory
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdSubCategory = p_idsubcategory;

        RETURN 'Subcategoría "' || v_subcategory_name || '" restaurada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar subcategoría: ' || SQLERRM;
    END;
END;
$$;





---------------------------------------------------- CRUD PRODUCT  ----------------------------------------------------
/*
  Función: create_product
  Descripción: Inserta un nuevo producto aplicando validaciones de negocio.
  Parámetros:
    - p_code_reference: Código de referencia único (opcional, único si se proporciona).
    - p_nameproduct: Nombre del producto (2-80 caracteres).
    - p_description: Descripción del producto (no vacía).
    - p_idsubcategory: ID de la subcategoría (debe existir y estar activa).
    - p_stock: Stock inicial (>= 0).
    - p_measurementunit: Unidad de medida (entero positivo, representa tipo de unidad).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION create_product(
    p_code_reference TEXT,
    p_nameproduct VARCHAR(80),
    p_description TEXT,
    p_idsubcategory INTEGER,
    p_stock INTEGER,
    p_measurementunit INTEGER
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct BIGINT;
    v_subcategory_active BOOLEAN;
    v_category_active BOOLEAN;
    v_subcategory_exists BOOLEAN;
BEGIN
    -- Campos obligatorios no nulos (excepto code_reference)
    IF p_nameproduct IS NULL OR p_description IS NULL OR 
       p_idsubcategory IS NULL OR p_stock IS NULL OR 
       p_measurementunit IS NULL THEN
        RETURN 'Error: Todos los campos excepto código de referencia son obligatorios.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_nameproduct)) < 2 OR LENGTH(TRIM(p_nameproduct)) > 80 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 80 caracteres.';
    END IF;

    -- Validar que la descripción no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- Validar stock no negativo
    IF p_stock < 0 THEN
        RETURN 'Error: El stock no puede ser negativo.';
    END IF;

    -- Validar unidad de medida (asumiendo que debe ser mayor a 0)
    IF p_measurementunit <= 0 THEN
        RETURN 'Error: La unidad de medida debe ser un valor positivo.';
    END IF;

    -- Verificar existencia y estado de la subcategoría
    SELECT EXISTS(SELECT 1 FROM SubCategory WHERE IdSubCategory = p_idsubcategory),
           COALESCE((SELECT Active FROM SubCategory WHERE IdSubCategory = p_idsubcategory), false)
    INTO v_subcategory_exists, v_subcategory_active;
    
    IF NOT v_subcategory_exists THEN
        RETURN 'Error: La subcategoría especificada no existe.';
    END IF;
    
    IF NOT v_subcategory_active THEN
        RETURN 'Error: La subcategoría especificada está inactiva.';
    END IF;

    -- Verificar que la categoría padre esté activa
    SELECT c.Active INTO v_category_active
    FROM SubCategory sc
    INNER JOIN Category c ON sc.CategorySub = c.IdCategory
    WHERE sc.IdSubCategory = p_idsubcategory;
    
    IF NOT v_category_active THEN
        RETURN 'Error: La categoría de la subcategoría especificada está inactiva.';
    END IF;

    -- Validar unicidad del código de referencia (solo productos activos, NULL no cuenta como duplicado)
    IF p_code_reference IS NOT NULL AND p_code_reference != '' THEN
        IF EXISTS (
            SELECT 1 
            FROM Product 
            WHERE code_reference = TRIM(p_code_reference) 
        ) THEN
            RETURN 'Error: Ya existe un producto con ese código de referencia.';
        END IF;
    END IF;

    -- Validar unicidad del nombre en la misma subcategoría (solo activos)
    IF EXISTS (
        SELECT 1 
        FROM Product 
        WHERE NameProduct = TRIM(p_nameproduct) 
        AND IdSubCategory = p_idsubcategory
    ) THEN
        RETURN 'Error: Ya existe un producto con ese nombre en esta subcategoría.';
    END IF;

    -- Transacción de inserción
    BEGIN
        INSERT INTO Product (
            code_reference,
            NameProduct,
            Description,
            IdSubCategory,
            Stock,
            MeasurementUnit
        ) VALUES (
            CASE WHEN p_code_reference IS NOT NULL AND p_code_reference != '' 
                 THEN TRIM(p_code_reference) 
                 ELSE NULL END,
            TRIM(p_nameproduct),
            TRIM(p_description),
            p_idsubcategory,
            p_stock,
            p_measurementunit
        ) RETURNING IdProduct INTO v_idproduct;

        RETURN 'Producto creado correctamente. ID: ' || v_idproduct;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN 'Error: La subcategoría especificada no existe.';
        WHEN unique_violation THEN
            RETURN 'Error: Violación de unicidad (código de referencia o nombre duplicado).';
        WHEN OTHERS THEN
            RETURN 'Error al crear producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: update_product
  Descripción: Actualiza un producto existente con validaciones.
  Parámetros:
    - p_idproduct: ID del producto a actualizar (debe existir y estar activo).
    - p_code_reference: Nuevo código de referencia (opcional, único si se proporciona).
    - p_nameproduct: Nuevo nombre (opcional, 2-80 caracteres).
    - p_description: Nueva descripción (opcional, no vacía).
    - p_idsubcategory: Nueva subcategoría (opcional, debe existir y estar activa).
    - p_stock: Nuevo stock (opcional, >= 0).
    - p_measurementunit: Nueva unidad de medida (opcional, entero positivo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_product(
    p_idproduct BIGINT,
    p_code_reference TEXT DEFAULT NULL,
    p_nameproduct VARCHAR(80) DEFAULT NULL,
    p_description TEXT DEFAULT NULL,
    p_idsubcategory INTEGER DEFAULT NULL,
    p_stock INTEGER DEFAULT NULL,
    p_measurementunit INTEGER DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_name VARCHAR(80);
    v_current_code TEXT;
    v_current_subcategory INTEGER;
    v_active BOOLEAN;
    v_subcategory_active BOOLEAN;
    v_category_active BOOLEAN;
    v_subcategory_exists BOOLEAN;
BEGIN
    -- Verificar existencia y estado del producto
    SELECT NameProduct, code_reference, IdSubCategory, Active 
    INTO v_current_name, v_current_code, v_current_subcategory, v_active
    FROM Product WHERE IdProduct = p_idproduct;
    
    IF NOT FOUND THEN
        RETURN 'Error: Producto no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar un producto inactivo.';
    END IF;

    -- Validar nombre si se proporciona
    IF p_nameproduct IS NOT NULL THEN
        IF LENGTH(TRIM(p_nameproduct)) < 2 OR LENGTH(TRIM(p_nameproduct)) > 80 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 80 caracteres.';
        END IF;
        
        -- Obtener la subcategoría a usar (nueva o actual)
        DECLARE
            v_target_subcategory INTEGER;
        BEGIN
            v_target_subcategory := COALESCE(p_idsubcategory, v_current_subcategory);
            
            -- Solo validar unicidad si el nombre es diferente al actual o la subcategoría cambia
            IF TRIM(p_nameproduct) != v_current_name OR v_target_subcategory != v_current_subcategory THEN
                -- Verificar unicidad excluyendo el producto actual
                IF EXISTS (
                    SELECT 1 
                    FROM Product 
                    WHERE NameProduct = TRIM(p_nameproduct) 
                        AND IdSubCategory = v_target_subcategory
                        AND IdProduct != p_idproduct
                ) THEN
                    RETURN 'Error: Ya existe otro producto con ese nombre en esta subcategoría.';
                END IF;
            END IF;
        END;
    END IF;

    -- Validar descripción si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- Validar stock si se proporciona
    IF p_stock IS NOT NULL AND p_stock < 0 THEN
        RETURN 'Error: El stock no puede ser negativo.';
    END IF;

    -- Validar unidad de medida si se proporciona
    IF p_measurementunit IS NOT NULL AND p_measurementunit <= 0 THEN
        RETURN 'Error: La unidad de medida debe ser un valor positivo.';
    END IF;

    -- Validar subcategoría si se proporciona
    IF p_idsubcategory IS NOT NULL THEN
        -- Verificar existencia
        SELECT EXISTS(SELECT 1 FROM SubCategory WHERE IdSubCategory = p_idsubcategory),
               COALESCE((SELECT Active FROM SubCategory WHERE IdSubCategory = p_idsubcategory), false)
        INTO v_subcategory_exists, v_subcategory_active;
        
        IF NOT v_subcategory_exists THEN
            RETURN 'Error: La nueva subcategoría especificada no existe.';
        END IF;
        
        IF NOT v_subcategory_active THEN
            RETURN 'Error: La nueva subcategoría especificada está inactiva.';
        END IF;
        
        -- Verificar que la categoría padre esté activa
        SELECT c.Active INTO v_category_active
        FROM SubCategory sc
        INNER JOIN Category c ON sc.CategorySub = c.IdCategory
        WHERE sc.IdSubCategory = p_idsubcategory;
        
        IF NOT v_category_active THEN
            RETURN 'Error: La categoría de la nueva subcategoría está inactiva.';
        END IF;
    END IF;

    -- Validar código de referencia si se proporciona
    IF p_code_reference IS NOT NULL THEN
        -- Si se pasa una cadena vacía, tratarla como NULL
        DECLARE
            v_trimmed_code TEXT;
        BEGIN
            v_trimmed_code := TRIM(p_code_reference);
            IF v_trimmed_code = '' THEN
                v_trimmed_code := NULL;
            END IF;
            
            -- Solo validar si es diferente al actual
            IF v_trimmed_code IS DISTINCT FROM v_current_code THEN
                -- Validar unicidad (NULL no cuenta como duplicado)
                IF v_trimmed_code IS NOT NULL AND EXISTS (
                    SELECT 1 
                    FROM Product 
                    WHERE code_reference = v_trimmed_code 
                        AND IdProduct != p_idproduct
                ) THEN
                    RETURN 'Error: Ya existe otro producto con ese código de referencia.';
                END IF;
            END IF;
        END;
    END IF;

    -- Transacción de actualización
    BEGIN
        UPDATE Product SET
            code_reference = CASE 
                WHEN p_code_reference IS NOT NULL THEN 
                    CASE WHEN TRIM(p_code_reference) = '' THEN NULL 
                    ELSE TRIM(p_code_reference) END
                ELSE code_reference 
            END,
            NameProduct = COALESCE(TRIM(p_nameproduct), NameProduct),
            Description = COALESCE(TRIM(p_description), Description),
            IdSubCategory = COALESCE(p_idsubcategory, IdSubCategory),
            Stock = COALESCE(p_stock, Stock),
            MeasurementUnit = COALESCE(p_measurementunit, MeasurementUnit),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        -- Verificar si se actualizó algún registro
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo actualizar el producto.';
        END IF;

        RETURN 'Producto actualizado correctamente.';
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN 'Error: La subcategoría especificada no existe.';
        WHEN unique_violation THEN
            RETURN 'Error: Violación de unicidad (código de referencia o nombre duplicado).';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: delete_product
  Descripción: Eliminación lógica de un producto con validaciones.
  Parámetros:
    - p_idproduct: ID del producto a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_product(p_idproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_name VARCHAR(80);
    v_current_stock INTEGER;
    v_has_active_details BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Product WHERE IdProduct = p_idproduct) THEN
        RETURN 'Error: Producto no encontrado.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM Product WHERE IdProduct = p_idproduct AND Active = false) THEN
        RETURN 'Error: El producto ya está eliminado.';
    END IF;

    -- 3. Obtener información del producto
    SELECT NameProduct, Stock INTO v_product_name, v_current_stock
    FROM Product WHERE IdProduct = p_idproduct;

    -- No eliminar productos con stock > 0 (política de negocio)
    IF v_current_stock > 0 THEN
        RETURN 'Error: No se puede eliminar el producto "' || v_product_name || 
               '" porque tiene ' || v_current_stock || ' unidades en stock.';
    END IF;

    -- Transacción de eliminación lógica
    BEGIN
        -- Primero, eliminar lógicamente los detalles (si existen)
        UPDATE DetailProduct SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct
        AND Active = true;

        -- Luego, eliminar el producto
        UPDATE Product
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        RETURN 'Producto "' || v_product_name || '" eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: restore_product
  Descripción: Restaura un producto eliminado lógicamente.
  Parámetros:
    - p_idproduct: ID del producto a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_product(p_idproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_name VARCHAR(80);
    v_code_reference TEXT;
    v_idsubcategory INTEGER;
    v_active BOOLEAN;
    v_subcategory_active BOOLEAN;
    v_category_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Product WHERE IdProduct = p_idproduct) THEN
        RETURN 'Error: Producto no encontrado.';
    END IF;

    -- Obtener información del producto
    SELECT NameProduct, code_reference, IdSubCategory, Active 
    INTO v_product_name, v_code_reference, v_idsubcategory, v_active
    FROM Product WHERE IdProduct = p_idproduct;

    -- Verificar que esté eliminado
    IF v_active THEN
        RETURN 'Error: El producto ya está activo.';
    END IF;

    -- Verificar que la subcategoría exista y esté activa
    SELECT COALESCE((SELECT Active FROM SubCategory WHERE IdSubCategory = v_idsubcategory), false)
    INTO v_subcategory_active;
    
    IF NOT v_subcategory_active THEN
        RETURN 'Error: La subcategoría del producto está inactiva. Active primero la subcategoría.';
    END IF;

    -- Verificar que la categoría padre esté activa
    SELECT c.Active INTO v_category_active
    FROM SubCategory sc
    INNER JOIN Category c ON sc.CategorySub = c.IdCategory
    WHERE sc.IdSubCategory = v_idsubcategory;
    
    IF NOT v_category_active THEN
        RETURN 'Error: La categoría de la subcategoría está inactiva. Active primero la categoría.';
    END IF;

    -- Validar unicidad del código de referencia (si tiene)
    IF v_code_reference IS NOT NULL AND v_code_reference != '' THEN
        IF EXISTS (
            SELECT 1 
            FROM Product 
            WHERE code_reference = v_code_reference 
                AND IdProduct != p_idproduct
                AND Active = true
        ) THEN
            RETURN 'Error: Existe otro producto activo con el mismo código de referencia. No se puede restaurar.';
        END IF;
    END IF;

    -- Validar unicidad del nombre en la subcategoría
    IF EXISTS (
        SELECT 1 
        FROM Product 
        WHERE NameProduct = v_product_name 
            AND IdSubCategory = v_idsubcategory
            AND IdProduct != p_idproduct
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otro producto activo con el mismo nombre en esta subcategoría. No se puede restaurar.';
    END IF;

    -- Transacción de restauración
    BEGIN
        -- Primero, restaurar el producto
        UPDATE Product SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        -- Luego, restaurar los detalles asociados
        UPDATE DetailProduct SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct
        AND Active = false;

        RETURN 'Producto "' || v_product_name || '" restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: update_product_stock
  Descripción: Actualiza el stock de un producto (incremento o decremento).
  Parámetros:
    - p_idproduct: ID del producto.
    - p_quantity_change: Cambio en la cantidad (positivo para incrementar, negativo para disminuir).
    - p_operation: Tipo de operación ('INCREMENT' o 'DECREMENT').
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_product_stock(
    p_idproduct BIGINT,
    p_quantity_change INTEGER,
    p_operation VARCHAR(20) DEFAULT 'INCREMENT'
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_stock INTEGER;
    v_current_stock INTEGER;
    v_product_name VARCHAR(80);
BEGIN
    -- Validar parámetros
    IF p_quantity_change <= 0 THEN
        RETURN 'Error: El cambio en cantidad debe ser mayor a cero.';
    END IF;

    -- Obtener stock actual
    SELECT Stock, NameProduct INTO v_current_stock, v_product_name
    FROM Product 
    WHERE IdProduct = p_idproduct AND Active = true;

    IF NOT FOUND THEN
        RETURN 'Error: Producto no encontrado o inactivo.';
    END IF;

    -- Calcular nuevo stock según operación
    IF UPPER(p_operation) = 'INCREMENT' THEN
        v_new_stock := v_current_stock + p_quantity_change;
    ELSIF UPPER(p_operation) = 'DECREMENT' THEN
        v_new_stock := v_current_stock - p_quantity_change;
        
        -- Validar que no quede stock negativo
        IF v_new_stock < 0 THEN
            RETURN 'Error: No hay suficiente stock. Disponible: ' || v_current_stock || ' unidades.';
        END IF;
    ELSE
        RETURN 'Error: Operación no válida. Use "INCREMENT" o "DECREMENT".';
    END IF;

    -- Actualizar stock
    BEGIN
        UPDATE Product
        SET 
            Stock = v_new_stock,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        RETURN 'Stock actualizado correctamente. Nuevo stock: ' || v_new_stock || ' unidades.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar stock: ' || SQLERRM;
    END;
END;
$$;





---------------------------------------------------- PRODUCTS DETALS ----------------------------------------------------

/*
  Función: create_detailproduct
  Descripción: Inserta un nuevo detalle de producto aplicando validaciones de negocio.
               Solo un detalle activo por producto. Al crear uno nuevo, se desactivan los anteriores.
  Parámetros:
    - p_idproduct: ID del producto (debe existir y estar activo).
    - p_minstock: Stock mínimo (>= 0).
    - p_purchaseprice: Precio de compra (>= 0.001).
    - p_saleprice: Precio de venta (>= p_purchaseprice).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION create_detailproduct(
    p_idproduct INTEGER,
    p_minstock INTEGER,
    p_purchaseprice DECIMAL(10,3),
    p_saleprice DECIMAL(10,3)
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_iddetailproduct BIGINT;
    v_product_active BOOLEAN;
    v_product_name VARCHAR(80);
    v_existing_active_count INTEGER;
BEGIN
    -- Campos obligatorios no nulos
    IF p_idproduct IS NULL OR p_minstock IS NULL OR 
       p_purchaseprice IS NULL OR p_saleprice IS NULL THEN
        RETURN 'Error: Todos los campos son obligatorios.';
    END IF;

    -- Validar stock minimo no negativo
    IF p_minstock < 0 THEN
        RETURN 'Error: El stock mínimo no puede ser negativo.';
    END IF;

    -- Precio de compra debe ser positivo
    IF p_purchaseprice < 0 THEN
        RETURN 'Error: El precio de compra debe ser mayor o igual a cero.';
    END IF;
    
    -- Precio de venta debe ser positivo
    IF p_saleprice < 0 THEN
        RETURN 'Error: El precio de venta debe ser mayor o igual a cero.';
    END IF;
    
    -- Precio de venta debe ser mayor o igual al precio de compra (margen minimo 0)
    IF p_saleprice < p_purchaseprice THEN
        RETURN 'Error: El precio de venta no puede ser menor al precio de compra.';
    END IF;

    --  Verificar existencia y estado del producto
    SELECT Active, NameProduct INTO v_product_active, v_product_name
    FROM Product WHERE IdProduct = p_idproduct;
    
    IF NOT FOUND THEN
        RETURN 'Error: El producto especificado no existe.';
    END IF;
    
    IF NOT v_product_active THEN
        RETURN 'Error: El producto especificado está inactivo.';
    END IF;

    --  Verificar si ya existe un detalle activo para este producto
    SELECT COUNT(*) INTO v_existing_active_count
    FROM DetailProduct 
    WHERE IdProduct = p_idproduct AND Active = true;
    
    -- (por si hay inconsistencias en la base de datos)
    IF v_existing_active_count > 1 THEN
        -- Esto no debería pasar, pero si pasa, jajaj
        UPDATE DetailProduct SET
            Active = false, DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct AND Active = true;
    END IF;

    -- Transacción de inserción
    BEGIN
        -- Desactivar cualquier detalle activo existente para este producto
        UPDATE DetailProduct
        SET 
            Active = false,
            DateUpdate = CURRENT_TIMESTAMP,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct AND Active = true;

        -- Insertar nuevo detalle activo
        INSERT INTO DetailProduct (
            IdProduct,
            MinStock,
            PurchasePrice,
            SalePrice,
            Active
        ) VALUES (
            p_idproduct,
            p_minstock,
            p_purchaseprice,
            p_saleprice,
            true
        ) RETURNING IdDetailProduct INTO v_iddetailproduct;

        RETURN 'Detalle de producto creado correctamente para "' || v_product_name || 
               '". ID: ' || v_iddetailproduct;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN 'Error: El producto especificado no existe.';
        WHEN OTHERS THEN
            RETURN 'Error al crear detalle de producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: update_detailproduct
  Descripción: Actualiza un detalle de producto existente con validaciones.
  Parámetros:
    - p_iddetailproduct: ID del detalle a actualizar (debe existir y estar activo).
    - p_minstock: Nuevo stock mínimo (opcional, >= 0).
    - p_purchaseprice: Nuevo precio de compra (opcional, >= 0.001).
    - p_saleprice: Nuevo precio de venta (opcional, >= p_purchaseprice).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_detailproduct(
    p_iddetailproduct BIGINT,
    p_minstock INTEGER DEFAULT NULL,
    p_purchaseprice DECIMAL(10,3) DEFAULT NULL,
    p_saleprice DECIMAL(10,3) DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct INTEGER;
    v_current_purchaseprice DECIMAL(10,3);
    v_current_saleprice DECIMAL(10,3);
    v_active BOOLEAN;
    v_product_active BOOLEAN;
BEGIN
    -- Verificar existencia y estado del detalle
    SELECT IdProduct, PurchasePrice, SalePrice, Active 
    INTO v_idproduct, v_current_purchaseprice, v_current_saleprice, v_active
    FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct;
    
    IF NOT FOUND THEN
        RETURN 'Error: Detalle de producto no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar un detalle eliminado.';
    END IF;

    -- Verificar que el producto asociado esté activo
    SELECT Active INTO v_product_active
    FROM Product WHERE IdProduct = v_idproduct;
    
    IF NOT v_product_active THEN
        RETURN 'Error: El producto asociado está inactivo.';
    END IF;

    -- Validar stock mínimo si se proporciona
    IF p_minstock IS NOT NULL AND p_minstock < 0 THEN
        RETURN 'Error: El stock mínimo no puede ser negativo.';
    END IF;

    -- Validar precios si se proporcionan
    DECLARE
        v_new_purchaseprice DECIMAL(10,3);
        v_new_saleprice DECIMAL(10,3);
    BEGIN
        v_new_purchaseprice := COALESCE(p_purchaseprice, v_current_purchaseprice);
        v_new_saleprice := COALESCE(p_saleprice, v_current_saleprice);
        
        -- Validaciones de precios
        IF v_new_purchaseprice <= 0 THEN
            RETURN 'Error: El precio de compra debe ser mayor a cero.';
        END IF;
        
        IF v_new_saleprice < 0 THEN
            RETURN 'Error: El precio de venta debe ser mayor o igual a cero.';
        END IF;
        
        IF v_new_saleprice < v_new_purchaseprice THEN
            RETURN 'Error: El precio de venta no puede ser menor al precio de compra.';
        END IF;
    END;

    -- Transacción de actualización
    BEGIN
        UPDATE DetailProduct
        SET
            MinStock = COALESCE(p_minstock, MinStock),
            PurchasePrice = COALESCE(p_purchaseprice, PurchasePrice),
            SalePrice = COALESCE(p_saleprice, SalePrice),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdDetailProduct = p_iddetailproduct;

        -- Verificar si se actualizó algún registro
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo actualizar el detalle de producto.';
        END IF;

        RETURN 'Detalle de producto actualizado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar detalle de producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: delete_detailproduct
  Descripción: Eliminación lógica de un detalle de producto con validaciones.
  Parámetros:
    - p_iddetailproduct: ID del detalle a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_detailproduct(p_iddetailproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct INTEGER;
    v_product_name VARCHAR(80);
    v_active_detail_count INTEGER;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct) THEN
        RETURN 'Error: Detalle de producto no encontrado.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct AND Active = false) THEN
        RETURN 'Error: El detalle ya está eliminado.';
    END IF;

    -- Obtener información del producto asociado
    SELECT dp.IdProduct, p.NameProduct 
    INTO v_idproduct, v_product_name
    FROM DetailProduct dp
    INNER JOIN Product p ON dp.IdProduct = p.IdProduct
    WHERE dp.IdDetailProduct = p_iddetailproduct;

    -- Validación: No permitir eliminar si es el único detalle activo del producto
    SELECT COUNT(*) INTO v_active_detail_count
    FROM DetailProduct
    WHERE IdProduct = v_idproduct AND Active = true;
    
    IF v_active_detail_count <= 1 THEN
        RETURN 'Error: No se puede eliminar el único detalle activo del producto "' || 
               v_product_name || '". Cree un nuevo detalle primero.';
    END IF;
    
    -- Transacción de eliminación lógica
    BEGIN
        UPDATE DetailProduct
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdDetailProduct = p_iddetailproduct;

        RETURN 'Detalle de producto eliminado correctamente del producto "' || v_product_name || '".';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar detalle de producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Función: restore_detailproduct
  Descripción: Restaura un detalle de producto eliminado lógicamente.
  Parámetros:
    - p_iddetailproduct: ID del detalle a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_detailproduct(p_iddetailproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct INTEGER;
    v_product_active BOOLEAN;
    v_active_detail_count INTEGER;
    v_product_name VARCHAR(80);
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct) THEN
        RETURN 'Error: Detalle de producto no encontrado.';
    END IF;

    -- Verificar que esté eliminado
    IF EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct AND Active = true) THEN
        RETURN 'Error: El detalle ya está activo.';
    END IF;

    -- Obtener información del producto asociado
    SELECT dp.IdProduct, p.NameProduct, p.Active
    INTO v_idproduct, v_product_name, v_product_active
    FROM DetailProduct dp
    INNER JOIN Product p ON dp.IdProduct = p.IdProduct
    WHERE dp.IdDetailProduct = p_iddetailproduct;

    -- Verificar que el producto esté activo
    IF NOT v_product_active THEN
        RETURN 'Error: El producto "' || v_product_name || '" está inactivo. Active primero el producto.';
    END IF;

    -- Para evitar tener múltiples detalles activos con diferentes precios
    DECLARE
        v_current_purchaseprice DECIMAL(10,3);
        v_current_saleprice DECIMAL(10,3);
        v_conflicting_detail BIGINT;
    BEGIN
        SELECT PurchasePrice, SalePrice 
        INTO v_current_purchaseprice, v_current_saleprice
        FROM DetailProduct 
        WHERE IdDetailProduct = p_iddetailproduct;

        -- Buscar si hay otro detalle activo con diferentes precios
        SELECT IdDetailProduct INTO v_conflicting_detail
        FROM DetailProduct
        WHERE IdProduct = v_idproduct 
          AND Active = true
          AND (PurchasePrice != v_current_purchaseprice OR SalePrice != v_current_saleprice)
        LIMIT 1;

        IF FOUND THEN
            -- Desactivar el detalle activo existente antes de restaurar este
            UPDATE DetailProduct
            SET 
                Active = false,
                DateUpdate = CURRENT_TIMESTAMP,
                DateDelete = CURRENT_TIMESTAMP
            WHERE IdDetailProduct = v_conflicting_detail;
        END IF;
    END;

    -- Transacción de restauración
    BEGIN
        UPDATE DetailProduct
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdDetailProduct = p_iddetailproduct;

        RETURN 'Detalle de producto restaurado correctamente para el producto "' || v_product_name || '".';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar detalle de producto: ' || SQLERRM;
    END;
END;
$$;