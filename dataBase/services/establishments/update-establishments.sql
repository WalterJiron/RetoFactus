/*
  Funcion: update_establishments
  Descripcion: Actualiza un establecimiento existente con validaciones.
  Parametros:
    - p_idestablishment: ID del establecimiento (debe existir y estar activo).
    - p_name: Nuevo nombre (opcional, 2-100 caracteres, no vacio si se proporciona).
    - p_address: Nueva direccion (opcional, no vacia si se proporciona).
    - p_phone_number: Nuevo telefono (opcional, formato valido, no vacio si se proporciona).
    - p_email: Nuevo email (opcional, formato valido, no vacio si se proporciona).
    - p_municipality_id: Nuevo ID de municipio (opcional, positivo si se proporciona).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION update_establishments(
    p_idestablishment INTEGER,
    p_name VARCHAR(100) DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_phone_number VARCHAR(20) DEFAULT NULL,
    p_email VARCHAR(100) DEFAULT NULL,
    p_municipality_id INT DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia y estado del establecimiento
    SELECT Active INTO v_active
    FROM Establishments WHERE IdEstablishment = p_idestablishment;
    
    IF NOT FOUND THEN
        RETURN 'Error: Establecimiento no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar un establecimiento eliminado.';
    END IF;

    -- Validar nombre si se proporciona
    IF p_name IS NOT NULL THEN
        IF TRIM(p_name) = '' THEN
            RETURN 'Error: El nombre no puede estar vacio.';
        END IF;
        IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 100 caracteres.';
        END IF;
    END IF;

    -- Validar direccion si se proporciona
    IF p_address IS NOT NULL AND TRIM(p_address) = '' THEN
        RETURN 'Error: La direccion no puede estar vacia.';
    END IF;

    -- Validar telefono si se proporciona
    IF p_phone_number IS NOT NULL THEN
        IF TRIM(p_phone_number) = '' THEN
            RETURN 'Error: El telefono no puede estar vacio.';
        END IF;
        IF TRIM(p_phone_number) !~ '^[0-9\s\-\+\(\)]+$' THEN
            RETURN 'Error: Formato de telefono invalido. Use solo digitos, espacios, +, -, ().';
        END IF;
    END IF;

    -- Validar email si se proporciona
    IF p_email IS NOT NULL THEN
        IF TRIM(p_email) = '' THEN
            RETURN 'Error: El email no puede estar vacio.';
        END IF;
        IF TRIM(p_email) !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RETURN 'Error: Formato de email invalido.';
        END IF;
    END IF;

    -- Validar municipio si se proporciona
    IF p_municipality_id IS NOT NULL AND p_municipality_id <= 0 THEN
        RETURN 'Error: El ID del municipio debe ser un numero positivo.';
    END IF;

    -- Transaccion de actualizacion
    BEGIN
        UPDATE Establishments
        SET
            Name = COALESCE(TRIM(p_name), Name),
            Address = COALESCE(TRIM(p_address), Address),
            Phone_Number = COALESCE(TRIM(p_phone_number), Phone_Number),
            Email = CASE 
                WHEN p_email IS NOT NULL THEN LOWER(TRIM(p_email))
                ELSE Email
            END,
            Municipality_Id = COALESCE(p_municipality_id, Municipality_Id),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdEstablishment = p_idestablishment;

        RETURN 'Establecimiento actualizado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar establecimiento: ' || SQLERRM;
    END;
END;
$$;