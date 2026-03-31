CREATE TABLE Establishments (
    IdEstablishment SERIAL PRIMARY KEY NOT NULL,
    Name VARCHAR(100) NOT NULL,
    Address TEXT NOT NULL,
    Phone_Number VARCHAR(20) NOT NULL,
    Email VARCHAR(100) NOT NULL,
    Municipality_Id INT NOT NULL, 
    
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,
    
	Active BOOLEAN DEFAULT TRUE
);


CREATE TABLE Roles(
    IdRole SERIAL PRIMARY KEY NOT NULL,
    Name VARCHAR(50) NOT NULL,
    Description TEXT NOT NULL,
    IdEstablishment INT REFERENCES Establishments(IdEstablishment) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,
    
    Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Users(
    IdUser BIGSERIAL PRIMARY KEY NOT NULL,
    NameUser VARCHAR(50) NOT NULL,
    Email VARCHAR(100) NOT NULL UNIQUE,
    PasswordUserHash TEXT NOT NULL,
    RoleUser INT REFERENCES Roles(IdRole) ON DELETE RESTRICT ON UPDATE CASCADE,
    IdEstablishment INT REFERENCES Establishments(IdEstablishment) ON DELETE RESTRICT ON UPDATE CASCADE,

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
    code_reference TEXT NOT NULL UNIQUE,
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

CREATE TABLE ProductEstablishments (
    IdEstablishment INT REFERENCES Establishments(IdEstablishment) ON DELETE RESTRICT ON UPDATE CASCADE,
    IdProduct INT REFERENCES Product(IdProduct) ON DELETE RESTRICT ON UPDATE CASCADE NOT NULL,
    PRIMARY KEY (IdEstablishment, IdProduct),

    AassignmentDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    Active BOOLEAN DEFAULT TRUE 
);

--- API Factus
CREATE TABLE PaymentForms (
    IdPaymentForm SERIAL PRIMARY KEY NOT NULL,
    Code VARCHAR(10) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Active BOOLEAN DEFAULT TRUE,
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ
);


CREATE TABLE Customers (
    IdCustomer BIGSERIAL PRIMARY KEY NOT NULL,
    Identification VARCHAR(50) NOT NULL UNIQUE,
    Names VARCHAR(100) NOT NULL,
    Address TEXT NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Phone VARCHAR(50) UNIQUE NOT NULL,
    TributeId INT,            -- ID de API Factus (regimen de tributación)
    IdentificationDocumentId INT, -- ID de API Factus (tipo de documento)
    MunicipalityId INT,       -- ID de API Factus (municipio)
    IdEstablishment INT REFERENCES Establishments(IdEstablishment) ON DELETE RESTRICT ON UPDATE CASCADE,
    
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,
    
    Active BOOLEAN DEFAULT TRUE
);

CREATE SEQUENCE secuencia_venta START 1;

CREATE TABLE Sale (
    IdInternal BIGINT PRIMARY KEY DEFAULT nextval('secuencia_venta'),
    ReferenceCode VARCHAR(20) UNIQUE DEFAULT 'VENTA-' || LPAD(nextval('secuencia_venta')::TEXT, 7, '0'),  -- Codigo publico
    EstablishmentId INT NOT NULL REFERENCES Establishments(IdEstablishment) ON DELETE RESTRICT ON UPDATE CASCADE,
    CustomerId BIGINT NOT NULL REFERENCES Customers(IdCustomer) ON DELETE RESTRICT ON UPDATE CASCADE,
    PaymentFormId INT NOT NULL REFERENCES PaymentForms(IdPaymentForm) ON DELETE RESTRICT ON UPDATE CASCADE,
   
    SaleDate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    Subtotal DECIMAL(15,2) NOT NULL,
    TaxTotal DECIMAL(15,2) NOT NULL,
    Total DECIMAL(15,2) NOT NULL,
    Status VARCHAR(20) DEFAULT 'pending',  -- pending, completed, cancelled
    Active BOOLEAN DEFAULT TRUE,
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ
);

CREATE TABLE SaleDetails (
    IdDetail BIGSERIAL PRIMARY KEY NOT NULL,
    SaleId BIGINT NOT NULL REFERENCES Sale(IdInternal) ON DELETE CASCADE ON UPDATE CASCADE,
    ProductId BIGINT NOT NULL REFERENCES Product(IdProduct) ON DELETE RESTRICT ON UPDATE CASCADE,
    Quantity DECIMAL(15,3) NOT NULL,
    UnitPrice DECIMAL(15,2) NOT NULL,
    DiscountRate DECIMAL(5,2) DEFAULT 0,  -- Tasa de descuento aplicada al producto 
    Subtotal DECIMAL(15,2) NOT NULL,  -- (Quantity * UnitPrice) * (1 - DiscountRate/100)
    TaxRate DECIMAL(5,2) NOT NULL,  -- Porcentaje de impuesto aplicado
    TributeId INT,  -- Tipo de impuesto (opcional)
    IsExcluded BOOLEAN DEFAULT FALSE,  -- Indica si esta excluido de impuestos
    UnitMeasureId INT NOT NULL,  -- ID de unidad de medida (API Factus)
    
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,
    Active BOOLEAN DEFAULT TRUE NOT NULL
);


CREATE TABLE Receipt(
    IdReceipt BIGSERIAL PRIMARY KEY NOT NULL,
    IdSale BIGINT NOT NULL REFERENCES Sale(IdInternal) ON DELETE RESTRICT ON UPDATE CASCADE,
    NameReceipt VARCHAR(50)  NOT NULL,
    public_url TEXT NOT NULL,
    NaneSale VARCHAR(50) NOT NULL,

    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);










--------------------------------------------- CRUD Establishments --------------------------------------------- 
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


/*
  Funcion: delete_establishments
  Descripcion: Eliminacion logica de un establecimiento con validacion de dependencias activas.
  Parametros:
    - p_idestablishment: ID del establecimiento a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION delete_establishments(p_idestablishment INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia y obtener datos
    SELECT Name, Active INTO v_name, v_active
    FROM Establishments WHERE IdEstablishment = p_idestablishment;
    
    IF NOT FOUND THEN
        RETURN 'Error: Establecimiento no encontrado.';
    END IF;
    
    -- Verificar si ya esta eliminado
    IF NOT v_active THEN
        RETURN 'Error: El establecimiento ya esta eliminado.';
    END IF;

    -- Validar dependencias activas
    IF EXISTS (SELECT 1 FROM Roles WHERE IdEstablishment = p_idestablishment AND Active = true) THEN
        RETURN 'Error: No se puede eliminar el establecimiento porque tiene roles activos asociados.';
    END IF;

    IF EXISTS (SELECT 1 FROM Users WHERE IdEstablishment = p_idestablishment AND Active = true) THEN
        RETURN 'Error: No se puede eliminar el establecimiento porque tiene usuarios activos asociados.';
    END IF;

    -- Proteger establecimiento principal (asumiendo ID 1 como principal)
    IF p_idestablishment = 1 THEN
        RETURN 'Error: No se puede eliminar el establecimiento principal del sistema.';
    END IF;

    -- Transaccion de eliminacion logica
    BEGIN
        UPDATE Establishments
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdEstablishment = p_idestablishment;

        RETURN 'Establecimiento "' || v_name || '" eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar establecimiento: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: restore_establishments
  Descripcion: Restaura un establecimiento eliminado logicamente.
  Parametros:
    - p_idestablishment: ID del establecimiento a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION restore_establishments(p_idestablishment INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia y estado
    SELECT Name, Active INTO v_name, v_active
    FROM Establishments WHERE IdEstablishment = p_idestablishment;
    
    IF NOT FOUND THEN
        RETURN 'Error: Establecimiento no encontrado.';
    END IF;
    
    IF v_active THEN
        RETURN 'Error: El establecimiento ya esta activo.';
    END IF;

    -- Transaccion de restauracion
    BEGIN
        UPDATE Establishments
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdEstablishment = p_idestablishment;

        RETURN 'Establecimiento "' || v_name || '" restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar establecimiento: ' || SQLERRM;
    END;
END;
$$;





--------------------------------------------- CRUD Roles --------------------------------------------- 
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


/*
    Procedimiento: ProcDeleteRol
    Descripcion: Realiza un soft delete (desactivacion) de un rol, siempre que no tenga
        usuarios activos asociados. Verifica existencia y estado previo.
    Parametros:
        - p_idrole INT - Identificador del rol a desactivar
    Salida:
        - VARCHAR(100) - Mensaje de resultado (exito o error)
*/
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
    -- Validacion: codigo obligatorio y positivo
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;
    
    -- Bloque de transaccion
    BEGIN
        -- Verificar existencia con bloqueo FOR UPDATE
        SELECT Active, Name INTO STRICT v_active, v_rol_name
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;
        
        -- Verificar si ya esta eliminado
        IF v_active = FALSE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra eliminado', v_rol_name, p_idrole);
            RETURN;
        END IF;
        
        -- Verificar si hay usuarios activos asociados al rol
        SELECT COUNT(*) INTO v_user_count
        FROM Users 
        WHERE RoleUser = p_idrole
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
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        WHEN lock_not_available THEN
            mensaje := 'El rol está siendo modificado por otro usuario. Intente nuevamente en unos momentos';
            RETURN;
        WHEN OTHERS THEN
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al desactivar rol: ' || SQLERRM;
            END IF;
            RAISE;
    END;
    
END;
$$ LANGUAGE plpgsql;


/*
    Procedimiento: ProcRecoverRol
    Descripcion: Reactiva un rol previamente desactivado, siempre que no exista otro rol activo
        con el mismo nombre en el mismo establecimiento.
    Parametros:
        - p_idrole INT - Identificador del rol a recuperar
    Salida:
        - VARCHAR(100) - Mensaje de resultado (exito o error)
*/
CREATE OR REPLACE FUNCTION ProcRecoverRol(
    p_idrole INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_active BOOLEAN;
    v_namer VARCHAR(50);
    v_idestablishment INT;
    v_row_count INT;
    v_existe_activo BOOLEAN;
BEGIN
    -- Validacion: codigo obligatorio y positivo
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;

    BEGIN
        -- Verificar existencia, estado y obtener establecimiento con bloqueo
        SELECT Active, Name, IdEstablishment INTO STRICT v_active, v_namer, v_idestablishment
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;

        -- Validar si ya esta activo
        IF v_active = TRUE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra activo', v_namer, p_idrole);
            RETURN;
        END IF;

        -- Verificar que el nombre del rol no este siendo usado por otro rol activo en el mismo establecimiento
        SELECT EXISTS(
            SELECT 1 FROM Roles 
            WHERE Name = v_namer 
              AND IdEstablishment = v_idestablishment
              AND IdRole <> p_idrole
              AND Active = TRUE
              AND DateDelete IS NULL
        ) INTO v_existe_activo;

        IF v_existe_activo THEN
            mensaje := format('No se puede recuperar el rol %s, ya existe un rol activo con ese nombre en el mismo establecimiento', v_namer);
            RETURN;
        END IF;

        -- Recuperacion del rol (activacion)
        UPDATE Roles SET 
            Active = TRUE, 
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole
          AND Active = FALSE;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;

        IF v_row_count <> 1 THEN
            mensaje := format('Error inesperado al recuperar el rol %s (ID: %s). Filas afectadas: %s', 
                             v_namer, p_idrole, v_row_count);
            RAISE EXCEPTION '%', mensaje;
        END IF;

        mensaje := format('Rol %s recuperado correctamente', v_namer);

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        WHEN unique_violation THEN
            mensaje := format('Ya existe un rol activo con el nombre %s en el establecimiento. No se puede recuperar.', v_namer);
            RAISE;
        WHEN OTHERS THEN
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al recuperar rol: ' || SQLERRM;
            END IF;
            RAISE;
    END;

END;
$$ LANGUAGE plpgsql;





--------------------------------------------- CRUD Users ---------------------------------------------
CREATE EXTENSION IF NOT EXISTS pgcrypto;


/*
  Funcion: obtener_usuario_por_email
  Descripcion: Retorna el ID, establecimiento y nombre del rol de un usuario dado su email.
  Parametros:
    - p_email: Correo electronico del usuario.
  Retorna:
    - Tabla con columnas: id, Establishment, role_name.
*/
CREATE OR REPLACE FUNCTION obtener_usuario_por_email(p_email VARCHAR(100))
RETURNS TABLE (
    id BIGINT,
    Establishment INT,
    role_name VARCHAR(50)
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        U.IdUser,
        U.IdEstablishment,
        R.Name  
    FROM Users AS U
    LEFT JOIN Roles AS R ON U.RoleUser = R.IdRole
    WHERE U.Email = p_email;
END;
$$;


/*
  Funcion: validate_password_strength
  Descripcion: Valida que la contrasenia cumpla con los requisitos de seguridad.
  Parametros:
    - p_password: Contrasenia a validar en texto plano.
  Retorna:
    - BOOLEAN: true si cumple, false si no cumple.
*/
CREATE OR REPLACE FUNCTION validate_password_strength(p_password TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
    -- Verificar que la contrasenia no sea nula
    IF p_password IS NULL THEN
        RETURN false;
    END IF;

    -- Longitud minima de 8 caracteres
    IF LENGTH(p_password) < 8 THEN
        RETURN false;
    END IF;

    -- Debe contener al menos una letra mayuscula
    IF NOT (p_password ~ '[A-Z]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos una letra minuscula
    IF NOT (p_password ~ '[a-z]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos un numero
    IF NOT (p_password ~ '[0-9]') THEN
        RETURN false;
    END IF;

    -- Debe contener al menos un caracter especial
    IF NOT (p_password ~ '[!@#$%^&*()_+\-=\[\]{};'':"\\|,.<>/?]') THEN
        RETURN false;
    END IF;

    -- No debe contener espacios en blanco
    IF p_password ~ '\s' THEN
        RETURN false;
    END IF;

    -- Validacion adicional: no permitir secuencias simples
    IF p_password ~ '(0123456789|1234567890|abcdefghijklmnopqrstuvwxyz|qwertyuiop|asdfghjkl|zxcvbnm)' THEN
        RETURN false;
    END IF;

    RETURN true;
END;
$$;


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


/*
  Funcion: update_users
  Descripcion: Actualiza un usuario existente con validaciones.
  Parametros:
    - p_iduser: ID del usuario (debe existir y estar activo).
    - p_nameuser: Nuevo nombre (opcional, 2-50 caracteres).
    - p_email: Nuevo email (opcional, formato valido, unico).
    - p_password: Nueva contrasenia (opcional, debe cumplir politicas de seguridad).
    - p_roleuser: Nuevo rol (opcional, debe existir y estar activo).
    - p_idestablishment: Nuevo establecimiento (opcional, debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/

CREATE OR REPLACE FUNCTION update_users(
    p_iduser BIGINT,
    p_nameuser VARCHAR(50) DEFAULT NULL,
    p_email VARCHAR(100) DEFAULT NULL,
    p_password TEXT DEFAULT NULL,
    p_roleuser INTEGER DEFAULT NULL,
    p_idestablishment INTEGER DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_user_active BOOLEAN;
    v_role_active BOOLEAN;
    v_estab_active BOOLEAN;
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

    -- Validar contrasenia si se proporciona
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
        
        -- Validar que la nueva contrasenia no sea igual a la actual
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

    -- Validar establecimiento si se proporciona
    IF p_idestablishment IS NOT NULL THEN
        SELECT Active INTO v_estab_active FROM Establishments WHERE IdEstablishment = p_idestablishment;
        IF NOT FOUND THEN
            RETURN 'Error: El establecimiento especificado no existe.';
        END IF;
        IF NOT v_estab_active THEN
            RETURN 'Error: El establecimiento especificado no está activo.';
        END IF;
    END IF;

    -- Transaccion de actualizacion
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
            IdEstablishment = COALESCE(p_idestablishment, IdEstablishment),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdUser = p_iduser;

        RETURN 'Usuario actualizado correctamente.';
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: El email ya está registrado por otro usuario.';
        WHEN foreign_key_violation THEN
            RETURN 'Error: El rol o establecimiento especificado no existe.';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar usuario: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: delete_users
  Descripcion: Eliminacion logica de un usuario.
  Parametros:
    - p_iduser: ID del usuario a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
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

    -- Validacion de negocio: No permitir eliminar el ultimo usuario administrador
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

    -- Transaccion de eliminacion logica
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
  Funcion: restore_users
  Descripcion: Restaura un usuario eliminado logicamente.
  Parametros:
    - p_iduser: ID del usuario a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/

CREATE OR REPLACE FUNCTION restore_users(p_iduser BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_email VARCHAR(100);
    v_role_id INTEGER;
    v_establishment_id INTEGER;
    v_role_active BOOLEAN;
    v_estab_active BOOLEAN;
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
    SELECT Email, RoleUser, IdEstablishment INTO v_email, v_role_id, v_establishment_id
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

    -- Verificar que el rol del usuario aun exista y esté activo
    SELECT Active INTO v_role_active FROM Roles WHERE IdRole = v_role_id;
    IF NOT FOUND THEN
        RETURN 'Error: El rol asignado al usuario ya no existe.';
    END IF;
    IF NOT v_role_active THEN
        RETURN 'Error: El rol asignado al usuario está inactivo.';
    END IF;

    -- Verificar que el establecimiento del usuario aun exista y esté activo
    SELECT Active INTO v_estab_active FROM Establishments WHERE IdEstablishment = v_establishment_id;
    IF NOT FOUND THEN
        RETURN 'Error: El establecimiento asignado al usuario ya no existe.';
    END IF;
    IF NOT v_estab_active THEN
        RETURN 'Error: El establecimiento asignado al usuario está inactivo.';
    END IF;

    -- Transaccion de restauracion
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
  Funcion: verify_user
  Descripcion: Verifica credenciales de usuario (email y contraseña).
  Parametros:
    - p_email: Email del usuario.
    - p_password: Contraseña en texto plano.
  Retorna:
    - VARCHAR(100): 'Ok' si las credenciales son validas y el usuario esta activo,
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
    v_establishment_id INT;
    v_login_attempts INTEGER DEFAULT 0;
    v_last_attempt TIMESTAMPTZ;
    v_account_locked BOOLEAN DEFAULT false;
BEGIN
    -- Validar parametros
    IF p_email IS NULL OR p_password IS NULL THEN
        RETURN 'Error: Email y contraseña son obligatorios.';
    END IF;

    -- Buscar usuario por email incluyendo el establecimiento
    SELECT 
        IdUser, 
        Active, 
        PasswordUserHash,
        IdEstablishment
    INTO 
        v_user_id, 
        v_active, 
        v_stored_hash,
        v_establishment_id
    FROM Users 
    WHERE Email = LOWER(TRIM(p_email));

    IF NOT FOUND THEN
        -- No revelar que el usuario no existe
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    -- Verificar estado del usuario
    IF NOT v_active THEN
        RETURN 'Error: Usuario inactivo o eliminado.';
    END IF;

    -- Validar que el usuario este asignado a un establecimiento
    IF v_establishment_id IS NULL THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.'; 
    END IF;

    -- Verificar contraseña
    IF v_stored_hash IS NULL OR v_stored_hash = '' THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    IF v_stored_hash != crypt(p_password, v_stored_hash) THEN
        RETURN 'Error: Credenciales inválidas o usuario inactivo.';
    END IF;

    -- Actualizar ultimo acceso
    UPDATE Users SET 
        LastLogin = CURRENT_TIMESTAMP
    WHERE IdUser = v_user_id;

    RETURN 'Ok';
EXCEPTION
    WHEN OTHERS THEN
        RETURN 'Error: No se pudo verificar las credenciales.';
END;
$$;





--------------------------------------------- CRUD Category ---------------------------------------------
/*
  Funcion: validate_category_name_unique
  Descripcion: Funcion auxiliar para validar unicidad del nombre de categoría.
  Parametros:
    - p_namecategory: Nombre a validar.
    - p_exclude_id: ID de categoría a excluir (opcional).
  Retorna:
    - BOOLEAN: true si el nombre es unico, false si no lo es.
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
  Funcion: create_category
  Descripcion: Inserta una nueva categoría aplicando validaciones de negocio.
  Parametros:
    - p_namecategory: Nombre de la categoría (2-60 caracteres, unico).
    - p_description: Descripcion de la categoría (no vacía).
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
        RETURN 'Error: Nombre y descripcion son obligatorios.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_namecategory)) < 2 OR LENGTH(TRIM(p_namecategory)) > 60 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 60 caracteres.';
    END IF;

    -- Validar que la descripcion no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripcion no puede estar vacía.';
    END IF;

    -- Validar unicidad del nombre usando la funcion auxiliar
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
  Funcion: update_category
  Descripcion: Actualiza una categoría existente con validaciones.
  Parametros:
    - p_idcategory: ID de la categoría (debe existir y estar activa).
    - p_namecategory: Nuevo nombre (opcional, 2-60 caracteres, unico).
    - p_description: Nueva descripcion (opcional, no vacía).
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
            -- Verificar unicidad excluyendo la categoría actual usando la funcion auxiliar
            IF NOT validate_category_name_unique(p_namecategory, p_idcategory) THEN
                RETURN 'Error: Ya existe otra categoría activa con ese nombre.';
            END IF;
        END IF;
    END IF;

    -- Validar descripcion si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripcion no puede estar vacía.';
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
  Funcion: delete_category
  Descripcion: Eliminación lógica de una categoría con validaciones de dependencias.
  Parametros:
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
  Funcion: restore_category
  Descripcion: Restaura una categoría eliminada lógicamente.
  Parametros:
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
  Funcion: create_subcategory
  Descripcion: Inserta una nueva subcategoría aplicando validaciones de negocio.
  Parametros:
    - p_namesubcategory: Nombre de la subcategoría (2-60 caracteres, unico en la categoría).
    - p_description: Descripcion de la subcategoría (no vacía).
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

    --Validar que la descripcion no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripcion no puede estar vacía.';
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
  Funcion: update_subcategory
  Descripcion: Actualiza una subcategoría existente con validaciones.
  Parametros:
    - p_idsubcategory: ID de la subcategoría a actualizar (debe existir y estar activa).
    - p_namesubcategory: Nuevo nombre (opcional, 2-60 caracteres, unico en la categoría).
    - p_description: Nueva descripcion (opcional, no vacía).
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

    -- 3. Validar descripcion si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripcion no puede estar vacía.';
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
  Funcion: delete_subcategory
  Descripcion: Eliminación lógica de una subcategoría con validaciones de dependencias.
  Parametros:
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
  Funcion: restore_subcategory
  Descripcion: Restaura una subcategoría eliminada lógicamente.
  Parametros:
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
  Funcion: create_product
  Descripcion: Inserta un nuevo producto aplicando validaciones de negocio.
  Parametros:
    - p_code_reference: Código de referencia unico (opcional, unico si se proporciona).
    - p_nameproduct: Nombre del producto (2-80 caracteres).
    - p_description: Descripcion del producto (no vacía).
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

    -- Validar que la descripcion no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripcion no puede estar vacía.';
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
  Funcion: update_product
  Descripcion: Actualiza un producto existente con validaciones.
  Parametros:
    - p_idproduct: ID del producto a actualizar (debe existir y estar activo).
    - p_code_reference: Nuevo código de referencia (opcional, unico si se proporciona).
    - p_nameproduct: Nuevo nombre (opcional, 2-80 caracteres).
    - p_description: Nueva descripcion (opcional, no vacía).
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

    -- Validar descripcion si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripcion no puede estar vacía.';
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
  Funcion: delete_product
  Descripcion: Eliminación lógica de un producto con validaciones.
  Parametros:
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
        RETURN 'Error: No se puede eliminar el producto ' || v_product_name || 
               ' porque tiene ' || v_current_stock || ' unidades en stock.';
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

        RETURN 'Producto ' || v_product_name || ' eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: restore_product
  Descripcion: Restaura un producto eliminado lógicamente.
  Parametros:
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

        RETURN 'Producto ' || v_product_name || ' restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar producto: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: update_product_stock
  Descripcion: Actualiza el stock de un producto (incremento o decremento).
  Parametros:
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
    -- Validar parametros
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
  Funcion: create_detailproduct
  Descripcion: Inserta un nuevo detalle de producto aplicando validaciones de negocio.
               Solo un detalle activo por producto. Al crear uno nuevo, se desactivan los anteriores.
  Parametros:
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
  Funcion: update_detailproduct
  Descripcion: Actualiza un detalle de producto existente con validaciones.
  Parametros:
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
  Funcion: delete_detailproduct
  Descripcion: Eliminación lógica de un detalle de producto con validaciones.
  Parametros:
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

    -- Validación: No permitir eliminar si es el unico detalle activo del producto
    SELECT COUNT(*) INTO v_active_detail_count
    FROM DetailProduct
    WHERE IdProduct = v_idproduct AND Active = true;
    
    IF v_active_detail_count <= 1 THEN
        RETURN 'Error: No se puede eliminar el unico detalle activo del producto "' || 
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
  Funcion: restore_detailproduct
  Descripcion: Restaura un detalle de producto eliminado lógicamente.
  Parametros:
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





---------------------------------------------------- PAYMENT FROMS ----------------------------------------------------
/*
  Funcion: create_paymentforms
  Descripcion: Inserta una nueva forma de pago aplicando validaciones de negocio.
  Parametros:
    - p_code: Codigo unico (2-10 caracteres, no vacio).
    - p_name: Nombre de la forma de pago (2-100 caracteres, no vacio).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION create_paymentforms(
    p_code VARCHAR(10),
    p_name VARCHAR(100)
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idpaymentform INTEGER;
BEGIN

    IF p_code IS NULL OR TRIM(p_code) = '' OR p_name IS NULL OR TRIM(p_name) = '' THEN
        RETURN 'Error: Código y nombre son obligatorios.';
    END IF;

    IF LENGTH(TRIM(p_code)) < 2 OR LENGTH(TRIM(p_code)) > 10 THEN
        RETURN 'Error: El código debe tener entre 2 y 10 caracteres.';
    END IF;

    IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 100 caracteres.';
    END IF;

    IF TRIM(p_code) !~ '^[A-Za-z0-9_-]+$' THEN
        RETURN 'Error: El código solo puede contener letras, números, guiones y guiones bajos.';
    END IF;

    IF EXISTS (SELECT 1 FROM PaymentForms WHERE Code = TRIM(p_code) AND Active = true) THEN
        RETURN 'Error: Ya existe una forma de pago activa con ese código.';
    END IF;

    -- Transaccion
    BEGIN
        INSERT INTO PaymentForms (
            Code,
            Name
        ) VALUES (
            TRIM(p_code),
            LOWER(TRIM(p_name))
        ) RETURNING IdPaymentForm INTO v_idpaymentform;

        RETURN 'Forma de pago creada correctamente. ID: ' || v_idpaymentform;
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe una forma de pago con ese código (violación de unicidad).';
        WHEN OTHERS THEN
            RETURN 'Error al crear forma de pago: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: update_paymentforms
  Descripcion: Actualiza una forma de pago existente con validaciones.
  Parametros:
    - p_idpaymentform: ID de la forma de pago (debe existir y estar activa).
    - p_code: Nuevo código (opcional, 2-10 caracteres, unico).
    - p_name: Nuevo nombre (opcional, 2-100 caracteres).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_paymentforms(
    p_idpaymentform INTEGER,
    p_code VARCHAR(10) DEFAULT NULL,
    p_name VARCHAR(100) DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_code VARCHAR(10);
    v_current_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN

    SELECT Code, Name, Active INTO v_current_code, v_current_name, v_active
    FROM PaymentForms WHERE IdPaymentForm = p_idpaymentform;
    
    IF NOT FOUND THEN
        RETURN 'Error: Forma de pago no encontrada.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar una forma de pago eliminada.';
    END IF;

    IF p_code IS NOT NULL THEN
        IF TRIM(p_code) = '' THEN
            RETURN 'Error: El código no puede estar vacio.';
        END IF;
        IF LENGTH(TRIM(p_code)) < 2 OR LENGTH(TRIM(p_code)) > 10 THEN
            RETURN 'Error: El código debe tener entre 2 y 10 caracteres.';
        END IF;
        IF TRIM(p_code) !~ '^[A-Za-z0-9_-]+$' THEN
            RETURN 'Error: El código solo puede contener letras, números, guiones y guiones bajos.';
        END IF;
        
        IF TRIM(p_code) != v_current_code THEN
            IF EXISTS (SELECT 1 FROM PaymentForms WHERE Code = TRIM(p_code) AND Active = true AND IdPaymentForm != p_idpaymentform) THEN
                RETURN 'Error: Ya existe otra forma de pago activa con ese código.';
            END IF;
        END IF;
    END IF;

    IF p_name IS NOT NULL THEN
        IF TRIM(p_name) = '' THEN
            RETURN 'Error: El nombre no puede estar vacio.';
        END IF;
        IF LENGTH(TRIM(p_name)) < 2 OR LENGTH(TRIM(p_name)) > 100 THEN
            RETURN 'Error: El nombre debe tener entre 2 y 100 caracteres.';
        END IF;
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE PaymentForms
        SET
            Code = COALESCE(TRIM(p_code), Code),
            Name = COALESCE(TRIM(p_name), Name),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdPaymentForm = p_idpaymentform;

        RETURN 'Forma de pago actualizada correctamente.';
    EXCEPTION
        WHEN unique_violation THEN
            RETURN 'Error: Ya existe otra forma de pago con ese código.';
        WHEN OTHERS THEN
            RETURN 'Error al actualizar forma de pago: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: delete_paymentforms
  Descripcion: Eliminación lógica de una forma de pago.
  Parametros:
    - p_idpaymentform: ID de la forma de pago (debe existir y estar activa).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_paymentforms(p_idpaymentform INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_code VARCHAR(10);
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    SELECT Code, Name, Active INTO v_code, v_name, v_active
    FROM PaymentForms WHERE IdPaymentForm = p_idpaymentform;
    
    IF NOT FOUND THEN
        RETURN 'Error: Forma de pago no encontrada.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: La forma de pago ya está eliminada.';
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE PaymentForms
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdPaymentForm = p_idpaymentform;

        RETURN 'Forma de pago "' || v_name || '" (Código: ' || v_code || ') eliminada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar forma de pago: ' || SQLERRM;
    END;
END;
$$;


/*
  Funcion: restore_paymentforms
  Descripcion: Restaura una forma de pago eliminada lógicamente.
  Parametros:
    - p_idpaymentform: ID de la forma de pago (debe existir y estar inactiva).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_paymentforms(p_idpaymentform INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_code VARCHAR(10);
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    SELECT Code, Name, Active INTO v_code, v_name, v_active
    FROM PaymentForms WHERE IdPaymentForm = p_idpaymentform;
    
    IF NOT FOUND THEN
        RETURN 'Error: Forma de pago no encontrada.';
    END IF;
    
    IF v_active THEN
        RETURN 'Error: La forma de pago ya está activa.';
    END IF;

    IF EXISTS (SELECT 1 FROM PaymentForms WHERE Code = v_code AND Active = true AND IdPaymentForm != p_idpaymentform) THEN
        RETURN 'Error: Ya existe otra forma de pago activa con el mismo código. No se puede restaurar.';
    END IF;

    -- Transaccion 
    BEGIN
        UPDATE PaymentForms
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdPaymentForm = p_idpaymentform;

        RETURN 'Forma de pago "' || v_name || '" (Código: ' || v_code || ') restaurada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar forma de pago: ' || SQLERRM;
    END;
END;
$$;





---------------------------------------------------- CUSTOMERS ----------------------------------------------------
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
    - p_idestablishment: Nuevo ID de establecimiento (opcional, debe existir y estar activo).
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
    p_municipalityid INT DEFAULT NULL,
    p_idestablishment INT DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_identification VARCHAR(50);
    v_current_email VARCHAR(100);
    v_current_phone VARCHAR(50);
    v_active BOOLEAN;
    v_establishment_active BOOLEAN;
BEGIN
    SELECT Identification, Email, Phone, Active 
    INTO v_current_identification, v_current_email, v_current_phone, v_active
    FROM Customers WHERE IdCustomer = p_idcustomer;
    
    IF NOT FOUND THEN
        RETURN 'Error: Cliente no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar un cliente eliminado.';
    END IF;

    -- Validar identificacion
    IF p_identification IS NOT NULL THEN
        IF TRIM(p_identification) = '' THEN
            RETURN 'Error: La identificacion no puede estar vacia.';
        END IF;
        IF LENGTH(TRIM(p_identification)) < 3 THEN
            RETURN 'Error: La identificacion debe tener al menos 3 caracteres.';
        END IF;
        IF TRIM(p_identification) != v_current_identification THEN
            IF EXISTS (SELECT 1 FROM Customers WHERE Identification = TRIM(p_identification) AND Active = true AND IdCustomer != p_idcustomer) THEN
                RETURN 'Error: Ya existe otro cliente activo con esa identificacion.';
            END IF;
        END IF;
    END IF;

    -- Validar nombres
    IF p_names IS NOT NULL THEN
        IF TRIM(p_names) = '' THEN
            RETURN 'Error: Los nombres no pueden estar vacios.';
        END IF;
        IF LENGTH(TRIM(p_names)) < 2 THEN
            RETURN 'Error: Los nombres deben tener al menos 2 caracteres.';
        END IF;
    END IF;

    -- Validar direccion
    IF p_address IS NOT NULL AND TRIM(p_address) = '' THEN
        RETURN 'Error: La direccion no puede estar vacia.';
    END IF;

    -- Validar email
    IF p_email IS NOT NULL THEN
        IF TRIM(p_email) = '' THEN
            RETURN 'Error: El email no puede estar vacio.';
        END IF;
        IF TRIM(p_email) !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
            RETURN 'Error: Formato de email invalido.';
        END IF;
        IF LOWER(TRIM(p_email)) != v_current_email THEN
            IF EXISTS (SELECT 1 FROM Customers WHERE Email = LOWER(TRIM(p_email)) AND Active = true AND IdCustomer != p_idcustomer) THEN
                RETURN 'Error: Ya existe otro cliente activo con ese email.';
            END IF;
        END IF;
    END IF;

    -- Validar telefono
    IF p_phone IS NOT NULL THEN
        IF TRIM(p_phone) = '' THEN
            RETURN 'Error: El telefono no puede estar vacio.';
        END IF;
        IF TRIM(p_phone) !~ '^[0-9\s\-\+\(\)]+$' THEN
            RETURN 'Error: Formato de telefono invalido. Use solo digitos, espacios, +, -, ().';
        END IF;
        IF TRIM(p_phone) != v_current_phone THEN
            IF EXISTS (SELECT 1 FROM Customers WHERE Phone = TRIM(p_phone) AND Active = true AND IdCustomer != p_idcustomer) THEN
                RETURN 'Error: Ya existe otro cliente activo con ese telefono.';
            END IF;
        END IF;
    END IF;

    -- Validar establecimiento si se proporciona
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
            IdEstablishment = COALESCE(p_idestablishment, IdEstablishment),
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


/*
  Funcion: delete_customers
  Descripcion: Eliminacion logica de un cliente con validacion de dependencias.
  Parametros:
    - p_idcustomer: ID del cliente a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION delete_customers(p_idcustomer BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_names VARCHAR(100);
    v_active BOOLEAN;
    v_sales_count INTEGER;
BEGIN
    SELECT Names, Active INTO v_names, v_active
    FROM Customers WHERE IdCustomer = p_idcustomer;
    
    IF NOT FOUND THEN
        RETURN 'Error: Cliente no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: El cliente ya esta eliminado.';
    END IF;

    SELECT COUNT(*) INTO v_sales_count
    FROM Sale
    WHERE CustomerId = p_idcustomer AND Active = true AND Status != 'cancelled';
    
    IF v_sales_count > 0 THEN
        RETURN 'Error: No se puede eliminar el cliente porque tiene ' || v_sales_count || ' ventas activas asociadas.';
    END IF;

    BEGIN
        UPDATE Customers
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCustomer = p_idcustomer;

        RETURN 'Cliente (' || v_names || ') eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar cliente: ' || SQLERRM;
    END;
END;
$$;

/*
  Funcion: restore_customers
  Descripcion: Restaura un cliente eliminado logicamente.
  Parametros:
    - p_idcustomer: ID del cliente a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION restore_customers(p_idcustomer BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_identification VARCHAR(50);
    v_email VARCHAR(100);
    v_phone VARCHAR(50);
    v_names VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    SELECT Identification, Email, Phone, Names, Active 
    INTO v_identification, v_email, v_phone, v_names, v_active
    FROM Customers WHERE IdCustomer = p_idcustomer;
    
    IF NOT FOUND THEN
        RETURN 'Error: Cliente no encontrado.';
    END IF;
    
    IF v_active THEN
        RETURN 'Error: El cliente ya esta activo.';
    END IF;

    IF EXISTS (SELECT 1 FROM Customers WHERE Identification = v_identification AND Active = true AND IdCustomer != p_idcustomer) THEN
        RETURN 'Error: Ya existe otro cliente activo con la misma identificacion. No se puede restaurar.';
    END IF;
    IF EXISTS (SELECT 1 FROM Customers WHERE Email = v_email AND Active = true AND IdCustomer != p_idcustomer) THEN
        RETURN 'Error: Ya existe otro cliente activo con el mismo email. No se puede restaurar.';
    END IF;
    IF EXISTS (SELECT 1 FROM Customers WHERE Phone = v_phone AND Active = true AND IdCustomer != p_idcustomer) THEN
        RETURN 'Error: Ya existe otro cliente activo con el mismo telefono. No se puede restaurar.';
    END IF;

    BEGIN
        UPDATE Customers
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCustomer = p_idcustomer;

        RETURN 'Cliente (' || v_names || ') restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar cliente: ' || SQLERRM;
    END;
END;
$$;










--------------------------------------------- INDICES --------------------------------------------- 
CREATE INDEX idx_establishments_municipality ON Establishments(Municipality_Id);

-- Indices para Roles
CREATE INDEX idx_roles_idestablishment ON Roles(IdEstablishment);

-- Indices para Users
CREATE INDEX idx_users_roleuser ON Users(RoleUser);
CREATE INDEX idx_users_idestablishment ON Users(IdEstablishment);
CREATE INDEX idx_users_email ON Users(Email);

-- Indices para SubCategory
CREATE INDEX idx_subcategory_categorysub ON SubCategory(CategorySub);

-- Indices para Product
CREATE INDEX idx_product_idsubcategory ON Product(IdSubCategory);
CREATE INDEX idx_product_code_reference ON Product(code_reference);

-- Indices para DetailProduct
CREATE INDEX idx_detailproduct_idproduct ON DetailProduct(IdProduct);

-- Indices para ProductEstablishments
CREATE INDEX idx_productestablishments_idproduct ON ProductEstablishments(IdProduct);

-- Indices para Customers
CREATE INDEX idx_customers_identification ON Customers(Identification);
CREATE INDEX idx_customers_tributeid ON Customers(TributeId);
CREATE INDEX idx_customers_municipalityid ON Customers(MunicipalityId);
CREATE INDEX idx_customers_email_active ON Customers(Email) WHERE Active = true;
CREATE INDEX IF NOT EXISTS idx_customers_idestablishment ON Customers(IdEstablishment) WHERE Active = true;

-- Indices para Sale
CREATE INDEX idx_sale_establishmentid ON Sale(EstablishmentId);
CREATE INDEX idx_sale_customerid ON Sale(CustomerId);
CREATE INDEX idx_sale_referencecode ON Sale(ReferenceCode);
CREATE INDEX idx_sale_status ON Sale(Status);

-- Indices para SaleDetails
CREATE INDEX idx_saledetails_saleid ON SaleDetails(SaleId);
CREATE INDEX idx_saledetails_productid ON SaleDetails(ProductId);
CREATE INDEX idx_saledetails_tributeid ON SaleDetails(TributeId);









--------------------------------------------- INSERTS --------------------------------------------- 
SELECT create_establishments(
    'Establecimiento General',
    'Direccion Principal, Centro Administrativo',
    '+505 8888-8888',
    'general@gmail.com',
    1
) AS message;

SELECT ProcInsertRol(
    'Admin',
    'Rol con acceso total al sistema, gestion de usuarios, configuraciones y reportes.',
    1
);

SELECT ProcInsertRol(
    'Vendedor',
    'Rol encargado de gestionar ventas, clientes y consultas comerciales.',
    1
);

SELECT ProcInsertRol(
    'Gerente',
    'Rol con permisos para supervisar equipos, revisar reportes generales y gestionar metas.',
    1
);

SELECT ProcInsertRol(
    'Inventario',
    'Rol encargado de control de stock, movimientos de productos y ajustes de inventario.',
    1
);

SELECT ProcInsertRol(
    'Compras',
    'Rol responsable de gestionar órdenes de compra, proveedores y recepción de mercancía.',
    1
);

SELECT ProcInsertRol(
    'Finanzas',
    'Rol con acceso a facturación, conciliaciones bancarias y análisis financiero.',
    1
);

SELECT ProcInsertRol(
    'Soporte',
    'Rol dedicado a la atención de incidencias, gestión de tickets y asistencia a clientes.',
    1
);

SELECT ProcInsertRol(
    'Marketing',
    'Rol para la gestión de campañas, promociones y análisis de mercado.',
    1
);

SELECT ProcInsertRol(
    'Recursos Humanos',
    'Rol encargado de gestión de personal, nómina y reclutamiento.',
    1
);

SELECT ProcInsertRol(
    'Auditor',
    'Rol con permisos de solo lectura para revisión de registros y cumplimiento normativo.',
    1
);

SELECT create_users(
    'Administrador General',
    'admin@gmail.com',
    'Admin.2026',
    1,
    1
);

-- Asi esta en la API
INSERT INTO paymentforms(code, name)
VALUES('1','Pago de contado');


SELECT create_category('Electrónicos', 'Productos electrónicos como teléfonos, computadoras, tablets, accesorios y dispositivos tecnológicos.');
SELECT create_category('Ropa y Accesorios', 'Prendas de vestir para hombre, mujer y niños, incluyendo calzado, bolsos y complementos.');
SELECT create_category('Hogar y Jardín', 'Artículos para el hogar, muebles, decoración, herramientas de jardinería y exteriores.');
SELECT create_category('Deportes y Fitness', 'Equipamiento deportivo, ropa fitness, accesorios para entrenamiento y actividades al aire libre.');
SELECT create_category('Alimentos y Bebidas', 'Productos alimenticios, bebidas, snacks, ingredientes y suministros de cocina.');
SELECT create_category('Salud y Belleza', 'Productos de cuidado personal, cosmética, suplementos vitamínicos y artículos de higiene.');
SELECT create_category('Automotriz', 'Accesorios para vehículos, herramientas automotrices, lubricantes y repuestos.');
SELECT create_category('Juguetes y Juegos', 'Juguetes educativos, juegos de mesa, videojuegos y artículos de entretenimiento infantil.');
SELECT create_category('Libros y Papelería', 'Libros de diversas temáticas, material de oficina, cuadernos y artículos de escritura.');
SELECT create_category('Mascotas', 'Productos para mascotas, alimentos, accesorios, juguetes y artículos de cuidado animal.');

-- Subcategorías para Electrónicos (ID 1)
SELECT create_subcategory('Teléfonos Inteligentes', 'Smartphones de última generación con sistemas operativos iOS y Android.', 1);
SELECT create_subcategory('Computadoras Portátiles', 'Laptops, notebooks y equipos portátiles para trabajo y entretenimiento.', 1);
SELECT create_subcategory('Accesorios Electrónicos', 'Cargadores, cables, audífonos, fundas y otros complementos.', 1);
SELECT create_subcategory('Tablets', 'Dispositivos táctiles para lectura, productividad y entretenimiento.', 1);

-- Subcategorías para Ropa y Accesorios (ID 2)
SELECT create_subcategory('Ropa de Hombre', 'Camisas, pantalones, chaquetas y trajes para caballero.', 2);
SELECT create_subcategory('Ropa de Mujer', 'Vestidos, blusas, faldas y accesorios de moda femenina.', 2);
SELECT create_subcategory('Calzado', 'Zapatos formales, deportivos, casuales y sandalias.', 2);
SELECT create_subcategory('Bolsos y Carteras', 'Mochilas, carteras, bolsos de mano y maletines.', 2);

-- Subcategorías para Hogar y Jardín (ID 3)
SELECT create_subcategory('Muebles', 'Sofás, mesas, sillas, estanterías y armarios.', 3);
SELECT create_subcategory('Decoración', 'Cuadros, lámparas, alfombras, cortinas y objetos decorativos.', 3);
SELECT create_subcategory('Herramientas de Jardín', 'Podadoras, rastrillos, mangueras y fertilizantes.', 3);
SELECT create_subcategory('Electrodomésticos', 'Refrigeradores, lavadoras, microondas y aspiradoras.', 3);

-- Subcategorías para Deportes y Fitness (ID 4)
SELECT create_subcategory('Equipamiento de Gimnasio', 'Mancuernas, bandas elásticas, colchonetas y máquinas de ejercicio.', 4);
SELECT create_subcategory('Ropa Deportiva', 'Shorts, camisetas técnicas, leggings y calzado deportivo.', 4);
SELECT create_subcategory('Deportes al Aire Libre', 'Carpa, bicicletas, equipo de camping y senderismo.', 4);

-- Subcategorías para Alimentos y Bebidas (ID 5)
SELECT create_subcategory('Bebidas', 'Refrescos, jugos, aguas saborizadas y bebidas energéticas.', 5);
SELECT create_subcategory('Snacks', 'Papas fritas, galletas, frutos secos y barras de cereal.', 5);
SELECT create_subcategory('Conservas y Enlatados', 'Vegetales, frutas, salsas y productos en conserva.', 5);

-- Subcategorías para Salud y Belleza (ID 6)
SELECT create_subcategory('Cuidado Facial', 'Limpiadores, cremas hidratantes, protectores solares y mascarillas.', 6);
SELECT create_subcategory('Maquillaje', 'Bases, labiales, sombras, delineadores y brochas.', 6);




-- Producto 1: Teléfono inteligente de gama alta
SELECT create_product(
    'SM-G998B',
    'Samsung Galaxy S21 Ultra',
    'Smartphone con pantalla Dynamic AMOLED 6.8", cámara cuádruple de 108MP, 12GB RAM, 256GB almacenamiento.',
    1,  -- Subcategoría: Teléfonos Inteligentes
    25,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Samsung Galaxy S21 Ultra' AND Active = true),
    5,
    750.000,
    899.990
);

-- Producto 2: Laptop de alto rendimiento
SELECT create_product(
    'XPS-15-9510',
    'Dell XPS 15',
    'Laptop con procesador Intel Core i7-11800H, 16GB RAM, 512GB SSD, pantalla 15.6" 4K UHD+.',
    2,
    12,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Dell XPS 15' AND Active = true),
    3,
    1250.000,
    1599.990
);

-- Producto 3: Audífonos inalámbricos
SELECT create_product(
    'WH-1000XM4',
    'Sony WH-1000XM4',
    'Audífonos over-ear con cancelación de ruido líder, batería de 30 horas, compatibilidad con Alexa y Google Assistant.',
    3,
    40,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Sony WH-1000XM4' AND Active = true),
    10,
    250.000,
    349.990
);

-- Producto 4: Tablet para dibujo
SELECT create_product(
    'A2102',
    'iPad Air 5ta generación',
    'Tablet con chip M1, pantalla Liquid Retina 10.9", compatible con Apple Pencil 2da gen.',
    4,
    18,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'iPad Air 5ta generación' AND Active = true),
    4,
    550.000,
    699.990
);

-- Producto 5: Camisa de vestir para hombre
SELECT create_product(
    'CSH-001',
    'Camisa Oxford de manga larga',
    'Camisa clásica de algodón, corte slim, disponible en colores blanco y azul.',
    5,
    50,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Camisa Oxford de manga larga' AND Active = true),
    15,
    25.000,
    45.990
);

-- Producto 6: Vestido de noche para mujer
SELECT create_product(
    'VEST-202',
    'Vestido largo con lentejuelas',
    'Vestido elegante para ocasiones especiales, escote en V, cierre oculto.',
    6,
    8,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Vestido largo con lentejuelas' AND Active = true),
    2,
    80.000,
    149.990
);

-- Producto 7: Zapatos deportivos
SELECT create_product(
    'RUN-23',
    'Zapatillas Running UltraBoost',
    'Calzado deportivo con tecnología Boost, amortiguación superior, suela de goma antideslizante.',
    7,
    30,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Zapatillas Running UltraBoost' AND Active = true),
    8,
    95.000,
    179.990
);

-- Producto 8: Mochila ejecutiva
SELECT create_product(
    'MBK-450',
    'Mochila para laptop 15.6"',
    'Mochila acolchada con compartimento para laptop, varios bolsillos organizadores, material impermeable.',
    8,
    22,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Mochila para laptop 15.6"' AND Active = true),
    6,
    40.000,
    79.990
);

-- Producto 9: Sofá de tres plazas
SELECT create_product(
    NULL,
    'Sofá Seccional Moderno',
    'Sofá tapizado en tela antimanchas, estructura de madera, incluye cojines decorativos.',
    9,
    7,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Sofá Seccional Moderno' AND Active = true),
    1,
    320.000,
    549.990
);

-- Producto 10: Lámpara de pie LED
SELECT create_product(
    'LAMP-360',
    'Lámpara de pie regulable',
    'Lámpara con brazo articulado, luz LED ajustable en intensidad y temperatura de color.',
    10,
    15,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Lámpara de pie regulable' AND Active = true),
    3,
    45.000,
    89.990
);

-- Producto 11: Cortadora de césped eléctrica
SELECT create_product(
    'MOW-1000W',
    'Cortadora de césped eléctrica 1500W',
    'Cortadora de pasto con motor de 1500W, ancho de corte 40cm, bolsa recolectora incluida.',
    11,
    6,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Cortadora de césped eléctrica 1500W' AND Active = true),
    1,
    180.000,
    299.990
);

-- Producto 12: Licuadora de alta potencia
SELECT create_product(
    NULL,
    'Licuadora Profesional 3HP',
    'Licuadora con motor de 3HP, jarra de vidrio, cuchillas de acero inoxidable, funciones preprogramadas.',
    12,
    14,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Licuadora Profesional 3HP' AND Active = true),
    4,
    85.000,
    149.990
);

-- Producto 13: Mancuernas ajustables
SELECT create_product(
    'DB-552',
    'Set de mancuernas ajustables 20kg',
    'Par de mancuernas con discos de 2.5kg, rango de 5kg a 20kg, incluye base organizadora.',
    13,
    10,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Set de mancuernas ajustables 20kg' AND Active = true),
    3,
    120.000,
    199.990
);

-- Producto 14: Bicicleta de montaña
SELECT create_product(
    'MTB-29',
    'Bicicleta R29 Doble Suspensión',
    'Bicicleta de montaña con cuadro de aluminio, suspensión delantera y trasera, cambios Shimano 21 velocidades.',
    15,
    5,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Bicicleta R29 Doble Suspensión' AND Active = true),
    1,
    380.000,
    599.990
);

-- Producto 15: Agua mineral natural
SELECT create_product(
    'WATER-500',
    'Agua mineral sin gas 500ml',
    'Agua pura de manantial en presentación de 500ml, pack de 12 unidades.',
    16,
    200,
    2
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Agua mineral sin gas 500ml' AND Active = true),
    40,
    4.500,
    8.990
);

-- Producto 16: Galletas de chocolate
SELECT create_product(
    NULL,
    'Galletas con chispas de chocolate',
    'Galletas crujientes con trozos de chocolate belga, presentación 150g.',
    17,
    120,
    3
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Galletas con chispas de chocolate' AND Active = true),
    25,
    1.800,
    3.490
);

-- Producto 17: Crema hidratante facial
SELECT create_product(
    'CRM-50',
    'Crema hidratante antiarrugas',
    'Crema con ácido hialurónico y vitamina C, textura ligera, para todo tipo de piel.',
    19,
    35,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Crema hidratante antiarrugas' AND Active = true),
    10,
    22.000,
    45.990
);

-- Producto 18: Paleta de sombras de ojos
SELECT create_product(
    'EYE-12',
    'Paleta de sombras 12 tonos',
    'Paleta con colores neutros y vibrantes, acabados mate y shimmer, larga duración.',
    20,
    28,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Paleta de sombras 12 tonos' AND Active = true),
    6,
    15.000,
    29.990
);

-- Producto 19: Atún en conserva
SELECT create_product(
    'TUNA-170',
    'Atún claro en agua 170g',
    'Atún de pesca sostenible, enlatado al natural, bajo en sodio.',
    18,
    150,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Atún claro en agua 170g' AND Active = true),
    30,
    2.200,
    3.990
);

-- Producto 20: Cargador inalámbrico rápido
SELECT create_product(
    'CHG-15W',
    'Cargador inalámbrico Qi 15W',
    'Base de carga rápida compatible con iPhone y Android, incluye cable USB-C.',
    3,
    42,
    1
);
SELECT create_detailproduct(
    (SELECT IdProduct::INTEGER FROM Product WHERE NameProduct = 'Cargador inalámbrico Qi 15W' AND Active = true),
    12,
    18.000,
    34.990
);

INSERT INTO ProductEstablishments (IdEstablishment, IdProduct)
SELECT 1, IdProduct
FROM Product
WHERE NameProduct IN (
    'Samsung Galaxy S21 Ultra',
    'Dell XPS 15',
    'Sony WH-1000XM4',
    'iPad Air 5ta generación',
    'Camisa Oxford de manga larga',
    'Vestido largo con lentejuelas',
    'Zapatillas Running UltraBoost',
    'Mochila para laptop 15.6"',
    'Sofá Seccional Moderno',
    'Lámpara de pie regulable',
    'Cortadora de césped eléctrica 1500W',
    'Licuadora Profesional 3HP',
    'Set de mancuernas ajustables 20kg',
    'Bicicleta R29 Doble Suspensión',
    'Agua mineral sin gas 500ml',
    'Galletas con chispas de chocolate',
    'Crema hidratante antiarrugas',
    'Paleta de sombras 12 tonos',
    'Atún claro en agua 170g',
    'Cargador inalámbrico Qi 15W'
)
AND Active = true;