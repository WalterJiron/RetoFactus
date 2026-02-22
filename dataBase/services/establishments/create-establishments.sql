/*
  Funcion: create_establishments
  Descripcion: Inserta un nuevo establecimiento aplicando validaciones de negocio.
  Parametros:
    - p_name: Nombre del establecimiento (2-100 caracteres).
    - p_address: Direccion (no vacia).
    - p_phone_number: Telefono (formato valido).
    - p_email: Email (formato valido).
    - p_municipality_id: ID del municipio (entero positivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION create_establishments(
    p_name VARCHAR(100),
    p_address TEXT,
    p_phone_number VARCHAR(20),
    p_email VARCHAR(100),
    p_municipality_id INT
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idestablishment INTEGER;
BEGIN
    -- Validar campos obligatorios no nulos y no vacios
    IF p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN 'Error: El nombre del establecimiento es obligatorio.';
    END IF;

    IF p_address IS NULL OR TRIM(p_address) = '' THEN
        RETURN 'Error: La direccion del establecimiento es obligatoria.';
    END IF;

    IF p_phone_number IS NULL OR TRIM(p_phone_number) = '' THEN
        RETURN 'Error: El telefono del establecimiento es obligatorio.';
    END IF;

    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN 'Error: El email del establecimiento es obligatorio.';
    END IF;

    IF p_municipality_id IS NULL THEN
        RETURN 'Error: El ID del municipio es obligatorio.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 100 caracteres.';
    END IF;

    -- Validar formato de email
    IF TRIM(p_email) !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN 'Error: Formato de email invalido.';
    END IF;

    -- Validar formato de telefono (solo digitos, espacios, +, -, ()
    IF TRIM(p_phone_number) !~ '^[0-9\s\-\+\(\)]+$' THEN
        RETURN 'Error: Formato de telefono invalido. Use solo digitos, espacios, +, -, ().';
    END IF;

    -- Validar que el ID del municipio sea positivo
    IF p_municipality_id <= 0 THEN
        RETURN 'Error: El ID del municipio debe ser un numero positivo.';
    END IF;

    -- Transaccion de insercion
    BEGIN
        INSERT INTO Establishments (
            Name,
            Address,
            Phone_Number,
            Email,
            Municipality_Id,
            Active
        ) VALUES (
            TRIM(p_name),
            TRIM(p_address),
            TRIM(p_phone_number),
            LOWER(TRIM(p_email)),
            p_municipality_id,
            true
        ) RETURNING IdEstablishment INTO v_idestablishment;

        RETURN 'Establecimiento creado correctamente. ID: ' || v_idestablishment;
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al crear establecimiento: ' || SQLERRM;
    END;
END;
$$;