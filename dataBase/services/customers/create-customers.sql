/*
  Funcion: create_customers
  Descripcion: Inserta un nuevo cliente aplicando validaciones de negocio.
  Parametros:
    - p_identification: Identificacion unica (no nulo, longitud minima 3).
    - p_names: Nombres del cliente (no nulo, longitud minima 2).
    - p_address: Direccion (no nulo, no vacio).
    - p_email: Email unico y valido (no nulo).
    - p_phone: Telefono unico (no nulo, formato basico).
    - p_tributeid: ID de regimen tributario (opcional, por defecto 21).
    - p_identificationdocumentid: ID de tipo de documento (opcional, por defecto 3).
    - p_municipalityid: ID de municipio (opcional).
    - p_idestablishment: ID del establecimiento (opcional, debe existir y estar activo si se proporciona).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION create_customers(
    p_identification VARCHAR(50),
    p_names VARCHAR(100),
    p_address TEXT,
    p_email VARCHAR(100),
    p_phone VARCHAR(50),
    p_tributeid INT DEFAULT 21,
    p_identificationdocumentid INT DEFAULT 3,
    p_municipalityid INT DEFAULT NULL,
    p_idestablishment INT DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idcustomer BIGINT;
    v_establishment_active BOOLEAN;
BEGIN
    -- Validaciones
    IF p_identification IS NULL OR TRIM(p_identification) = '' THEN
        RETURN 'Error: La identificacion es obligatoria.';
    END IF;
    IF p_names IS NULL OR TRIM(p_names) = '' THEN
        RETURN 'Error: Los nombres son obligatorios.';
    END IF;
    IF p_address IS NULL OR TRIM(p_address) = '' THEN
        RETURN 'Error: La direccion es obligatoria.';
    END IF;
    IF p_email IS NULL OR TRIM(p_email) = '' THEN
        RETURN 'Error: El email es obligatorio.';
    END IF;
    IF p_phone IS NULL OR TRIM(p_phone) = '' THEN
        RETURN 'Error: El telefono es obligatorio.';
    END IF;

    IF LENGTH(TRIM(p_identification)) < 3 THEN
        RETURN 'Error: La identificacion debe tener al menos 3 caracteres.';
    END IF;
    IF LENGTH(TRIM(p_names)) < 2 THEN
        RETURN 'Error: Los nombres deben tener al menos 2 caracteres.';
    END IF;

    IF TRIM(p_email) !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
        RETURN 'Error: Formato de email invalido.';
    END IF;

    IF TRIM(p_phone) !~ '^[0-9\s\-\+\(\)]+$' THEN
        RETURN 'Error: Formato de telefono invalido. Use solo digitos, espacios, +, -, ().';
    END IF;

    IF EXISTS (SELECT 1 FROM Customers WHERE Identification = TRIM(p_identification) AND Active = true) THEN
        RETURN 'Error: Ya existe un cliente activo con esa identificacion.';
    END IF;
    IF EXISTS (SELECT 1 FROM Customers WHERE Email = LOWER(TRIM(p_email)) AND Active = true) THEN
        RETURN 'Error: Ya existe un cliente activo con ese email.';
    END IF;
    IF EXISTS (SELECT 1 FROM Customers WHERE Phone = TRIM(p_phone) AND Active = true) THEN
        RETURN 'Error: Ya existe un cliente activo con ese telefono.';
    END IF;

    IF p_idestablishment IS NOT NULL THEN
        SELECT Active INTO v_establishment_active
        FROM Establishments WHERE IdEstablishment = p_idestablishment;
        IF NOT FOUND THEN
            RETURN 'Error: El establecimiento especificado no existe.';
        END IF;
        IF NOT v_establishment_active THEN
            RETURN 'Error: El establecimiento especificado esta inactivo.';
        END IF;
    END IF;

    -- Transaccion
    BEGIN
        INSERT INTO Customers (
            Identification,
            Names,
            Address,
            Email,
            Phone,
            TributeId,
            IdentificationDocumentId,
            MunicipalityId,
            IdEstablishment,
            Active
        ) VALUES (
            TRIM(p_identification),
            TRIM(p_names),
            TRIM(p_address),
            LOWER(TRIM(p_email)),
            TRIM(p_phone),
            p_tributeid,
            p_identificationdocumentid,
            p_municipalityid,
            p_idestablishment,
            true
        ) RETURNING IdCustomer INTO v_idcustomer;

        RETURN 'Cliente creado correctamente. ID: ' || v_idcustomer;
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe un cliente con ese identificador, email o telefono.';
        WHEN OTHERS THEN
            RETURN 'Error al crear cliente: ' || SQLERRM;
    END;
END;
$$;