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
    p_municipalityid INT DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idcustomer BIGINT;
BEGIN
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
            MunicipalityId 
        ) VALUES (
            TRIM(p_identification),
            TRIM(p_names),
            LOWER(TRIM(p_address)),
            LOWER(TRIM(p_email)),
            TRIM(p_phone),
            p_tributeid,
            p_identificationdocumentid,
            p_municipalityid 
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




-- ====================================================
-- FUNCIONES ADICIONALES DE UTILIDAD
-- ====================================================

/*
  Funcion: get_customer_by_identification
  Descripcion: Obtiene un cliente activo por su identificacion.
  Parametros:
    - p_identification: Identificacion del cliente.
  Retorna:
    - TABLE: datos del cliente.
*/
CREATE OR REPLACE FUNCTION get_customer_by_identification(p_identification VARCHAR(50))
RETURNS TABLE (
    idcustomer BIGINT,
    identification VARCHAR(50),
    names VARCHAR(100),
    address TEXT,
    email VARCHAR(100),
    phone VARCHAR(50),
    tributeid INT,
    identificationdocumentid INT,
    municipalityid INT,
    datecreate TIMESTAMPTZ
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.IdCustomer,
        c.Identification,
        c.Names,
        c.Address,
        c.Email,
        c.Phone,
        c.TributeId,
        c.IdentificationDocumentId,
        c.MunicipalityId,
        c.DateCreate
    FROM Customers c
    WHERE c.Identification = TRIM(p_identification) AND c.Active = true;
END;
$$;

/*
  Funcion: list_customers
  Descripcion: Lista todos los clientes con opcion de incluir inactivos.
  Parametros:
    - p_include_inactive: Si se incluyen inactivos (por defecto false).
  Retorna:
    - TABLE: lista de clientes.
*/
CREATE OR REPLACE FUNCTION list_customers(p_include_inactive BOOLEAN DEFAULT false)
RETURNS TABLE (
    idcustomer BIGINT,
    identification VARCHAR(50),
    names VARCHAR(100),
    address TEXT,
    email VARCHAR(100),
    phone VARCHAR(50),
    tributeid INT,
    identificationdocumentid INT,
    municipalityid INT,
    active BOOLEAN,
    datecreate TIMESTAMPTZ,
    sales_count BIGINT
)
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.IdCustomer,
        c.Identification,
        c.Names,
        c.Address,
        c.Email,
        c.Phone,
        c.TributeId,
        c.IdentificationDocumentId,
        c.MunicipalityId,
        c.Active,
        c.DateCreate,
        COALESCE(s.sales_count, 0)::BIGINT
    FROM Customers c
    LEFT JOIN (
        SELECT CustomerId, COUNT(*) as sales_count
        FROM Sale
        WHERE Active = true
        GROUP BY CustomerId
    ) s ON c.IdCustomer = s.CustomerId
    WHERE (p_include_inactive OR c.Active = true)
    ORDER BY c.IdCustomer DESC;
END;
$$;
