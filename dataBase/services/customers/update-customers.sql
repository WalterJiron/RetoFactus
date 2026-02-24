/*
  Funcion: update_customers
  Descripcion: Actualiza un cliente existente con validaciones.
  Parametros:
    - p_idcustomer: ID del cliente (debe existir y estar activo).
    - p_identification: Nueva identificacion (opcional, unica).
    - p_names: Nuevos nombres (opcional, no vacio).
    - p_address: Nueva direccion (opcional, no vacio).
    - p_email: Nuevo email (opcional, unico, formato valido).
    - p_phone: Nuevo telefono (opcional, unico, formato valido).
    - p_tributeid: Nuevo TributeId (opcional).
    - p_identificationdocumentid: Nuevo IdentificationDocumentId (opcional).
    - p_municipalityid: Nuevo MunicipalityId (opcional).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION update_customers(
    p_idcustomer BIGINT,
    p_identification VARCHAR(50) DEFAULT NULL,
    p_names VARCHAR(100) DEFAULT NULL,
    p_address TEXT DEFAULT NULL,
    p_email VARCHAR(100) DEFAULT NULL,
    p_phone VARCHAR(50) DEFAULT NULL,
    p_tributeid INT DEFAULT NULL,
    p_identificationdocumentid INT DEFAULT NULL,
    p_municipalityid INT DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_identification VARCHAR(50);
    v_current_email VARCHAR(100);
    v_current_phone VARCHAR(50);
    v_active BOOLEAN;
BEGIN

    SELECT Identification, Email, Phone, Active INTO v_current_identification, v_current_email, v_current_phone, v_active
    FROM Customers WHERE IdCustomer = p_idcustomer;
    
    IF NOT FOUND THEN
        RETURN 'Error: Cliente no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar un cliente eliminado.';
    END IF;

    IF p_identification IS NOT NULL THEN
        IF TRIM(p_identification) = '' THEN
            RETURN 'Error: La identificacion no puede estar vacia.';
        END IF;
        
        IF LENGTH(TRIM(p_identification)) < 3 THEN
            RETURN 'Error: La identificacion debe tener al menos 3 caracteres.';
        END IF;

        -- Verificar unicidad excluyendo el actual
        IF TRIM(p_identification) != v_current_identification THEN
            IF EXISTS (SELECT 1 FROM Customers WHERE Identification = TRIM(p_identification) AND Active = true AND IdCustomer != p_idcustomer) THEN
                RETURN 'Error: Ya existe otro cliente activo con esa identificacion.';
            END IF;
        END IF;
    END IF;

    IF p_names IS NOT NULL THEN
        IF TRIM(p_names) = '' THEN
            RETURN 'Error: Los nombres no pueden estar vacios.';
        END IF;
        IF LENGTH(TRIM(p_names)) < 2 THEN
            RETURN 'Error: Los nombres deben tener al menos 2 caracteres.';
        END IF;
    END IF;

    IF p_address IS NOT NULL AND TRIM(p_address) = '' THEN
        RETURN 'Error: La direccion no puede estar vacia.';
    END IF;

    IF p_email IS NOT NULL THEN
        IF TRIM(p_email) = '' THEN
            RETURN 'Error: El email no puede estar vacio.';
        END IF;
        
        IF TRIM(p_email) !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RETURN 'Error: Formato de email invalido.';
        END IF;
        
        -- Verificar unicidad excluyendo el actual
        IF LOWER(TRIM(p_email)) != v_current_email THEN
            IF EXISTS (SELECT 1 FROM Customers WHERE Email = LOWER(TRIM(p_email)) AND Active = true AND IdCustomer != p_idcustomer) THEN
                RETURN 'Error: Ya existe otro cliente activo con ese email.';
            END IF;
        END IF;
    END IF;

    -- 6. Validar telefono si se proporciona
    IF p_phone IS NOT NULL THEN
        IF TRIM(p_phone) = '' THEN
            RETURN 'Error: El telefono no puede estar vacio.';
        END IF;
        
        IF TRIM(p_phone) !~ '^[0-9\s\-\+\(\)]+$' THEN
            RETURN 'Error: Formato de telefono invalido. Use solo digitos, espacios, +, -, ().';
        END IF;
        
        -- Verificar unicidad excluyendo el actual
        IF TRIM(p_phone) != v_current_phone THEN
            IF EXISTS (SELECT 1 FROM Customers WHERE Phone = TRIM(p_phone) AND Active = true AND IdCustomer != p_idcustomer) THEN
                RETURN 'Error: Ya existe otro cliente activo con ese telefono.';
            END IF;
        END IF;
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE Customers
        SET
            Identification = COALESCE(TRIM(p_identification), Identification),
            Names = COALESCE(TRIM(p_names), Names),
            Address = COALESCE(TRIM(p_address), Address),
            Email = COALESCE(LOWER(TRIM(p_email)), Email),
            Phone = COALESCE(TRIM(p_phone), Phone),
            TributeId = COALESCE(p_tributeid, TributeId),
            IdentificationDocumentId = COALESCE(p_identificationdocumentid, IdentificationDocumentId),
            MunicipalityId = COALESCE(p_municipalityid, MunicipalityId),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCustomer = p_idcustomer;

        RETURN 'Cliente actualizado correctamente.';
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: Violacion de unicidad (identificacion, email o telefono duplicados).';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar cliente: ' || SQLERRM;
    END;
END;
$$;