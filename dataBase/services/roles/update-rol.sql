/*
    Procedimiento: ProcUpdateRol_serial
    Descripcion: Actualiza los datos de un rol activo, verificando que el nuevo nombre
        sea unico dentro del mismo establecimiento y que el rol exista y este activo.
    Parametros:
        - p_idrole       INT         - Identificador del rol a actualizar
        - p_nombre_rol   VARCHAR(50) - Nuevo nombre del rol
        - p_descripcion  TEXT        - Nueva descripcion del rol
    Salida:
        - VARCHAR(100) - Mensaje de resultado (exito o error)
*/
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
    v_idestablishment INT;
    v_row_count INT;
BEGIN
    -- Validar campos obligatorios
    IF p_idrole IS NULL OR p_nombre_rol IS NULL OR p_descripcion IS NULL THEN
        mensaje := 'Todos los campos son obligatorios';
        RETURN;
    END IF;
    
    -- Limpiar espacios en blanco
    v_trim_nombre := TRIM(p_nombre_rol);
    v_trim_desc := TRIM(p_descripcion);
    
    -- Validar longitud del nombre
    IF LENGTH(v_trim_nombre) < 3 OR LENGTH(v_trim_nombre) > 50 THEN
        mensaje := 'El nombre del rol debe tener al menos 3 caracteres y maximo 50';
        RETURN;
    END IF;
    
    -- Validar longitud de la descripcion
    IF LENGTH(v_trim_desc) < 10 THEN
        mensaje := 'La descripcion debe tener al menos 10 caracteres';
        RETURN;
    END IF;
    
    -- Bloque de transaccion
    BEGIN
        -- Verificar existencia, estado y obtener establecimiento con bloqueo
        SELECT Active, IdEstablishment INTO v_active, v_idestablishment
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
        
        -- Verificar nombre unico dentro del mismo establecimiento (excluyendo el rol actual)
        PERFORM 1 FROM Roles
        WHERE UPPER(Name) = UPPER(v_trim_nombre)
          AND IdEstablishment = v_idestablishment
          AND IdRole != p_idrole
          AND Active = TRUE;
        
        IF FOUND THEN
            mensaje := 'Ya existe un rol activo con ese nombre en el establecimiento';
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        -- Actualizar (no se modifica el IdEstablishment)
        UPDATE Roles SET
            Name = v_trim_nombre,
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