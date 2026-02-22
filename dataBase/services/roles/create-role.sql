/*
    Procedimiento: ProcInsertRol
    Descripcion: Inserta un nuevo rol en la tabla Roles, validando que el nombre sea unico
        dentro del mismo establecimiento y que el establecimiento exista y este activo.
    Parametros:
        - p_nombre_rol      VARCHAR(50)   - Nombre del rol
        - p_descripcion     TEXT           - Descripcion del rol
        - p_idestablishment INT            - Identificador del establecimiento al que pertenece
    Salida:
        - VARCHAR(100)   - Mensaje de resultado (exito o error)
*/
CREATE OR REPLACE FUNCTION ProcInsertRol(
    p_nombre_rol VARCHAR(50),
    p_descripcion TEXT,
    p_idestablishment INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_trim_nombre VARCHAR(50);
    v_trim_desc TEXT;
    v_estab_activo BOOLEAN;
    v_row_count INT;
BEGIN
    -- Inicializar mensaje
    mensaje := '';
    
    -- Validar campos obligatorios
    IF p_nombre_rol IS NULL OR p_descripcion IS NULL OR p_idestablishment IS NULL THEN
        mensaje := 'Todos los campos son obligatorios';
        RETURN;
    END IF;
    
    -- Validar que el id del establecimiento sea positivo
    IF p_idestablishment <= 0 THEN
        mensaje := 'El identificador del establecimiento debe ser un numero valido';
        RETURN;
    END IF;
    
    -- Limpiar espacios en blanco
    v_trim_nombre := TRIM(p_nombre_rol);
    v_trim_desc := TRIM(p_descripcion);
    
    -- Validar longitud del nombre
    IF LENGTH(v_trim_nombre) < 2 OR LENGTH(v_trim_nombre) > 50 THEN
        mensaje := 'El nombre del rol debe tener al menos 2 caracteres y no exceder 50';
        RETURN;
    END IF;
    
    -- Validar longitud de la descripcion
    IF LENGTH(v_trim_desc) < 5 THEN
        mensaje := 'La descripcion debe tener al menos 5 caracteres';
        RETURN;
    END IF;
    
    -- Iniciar transaccion
    BEGIN
        -- Bloquear y verificar que el establecimiento exista y este activo
        SELECT Active INTO v_estab_activo
        FROM Establishments
        WHERE IdEstablishment = p_idestablishment
        FOR UPDATE;
        
        IF NOT FOUND OR v_estab_activo = FALSE THEN
            mensaje := 'El establecimiento indicado no existe o no esta activo';
            RETURN;
        END IF;
        
        -- Verificar unicidad del nombre dentro del mismo establecimiento
        PERFORM 1 FROM Roles 
        WHERE UPPER(Name) = UPPER(v_trim_nombre)
          AND IdEstablishment = p_idestablishment
          AND Active = TRUE
        LIMIT 1
        FOR UPDATE;
        
        IF FOUND THEN
            mensaje := 'Ya existe un rol activo con ese nombre en el establecimiento';
            RAISE EXCEPTION 'Validacion fallida: %', mensaje;
        END IF;
        
        -- Insertar el nuevo rol
        INSERT INTO Roles (Name, Description, IdEstablishment)  
        VALUES (v_trim_nombre, v_trim_desc, p_idestablishment);
        
        -- Verificar insercion
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        IF v_row_count <> 1 THEN
            mensaje := 'Error al insertar el rol';
            RAISE EXCEPTION 'Insercion fallida';
        END IF;
        
        mensaje := 'Rol registrado correctamente';
        
    EXCEPTION
        WHEN unique_violation THEN
            mensaje := 'Ya existe un rol activo con ese nombre en el establecimiento';
        
        WHEN check_violation THEN
            mensaje := 'Violacion de restriccion de datos';

        WHEN OTHERS THEN
            IF mensaje = '' OR mensaje IS NULL THEN
                mensaje := 'Error al registrar rol: ' || SQLERRM;
            END IF;
    END;
    
END;
$$ LANGUAGE plpgsql;