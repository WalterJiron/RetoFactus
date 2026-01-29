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