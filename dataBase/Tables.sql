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

CREATE TABLE PaymentForms (
    IdPaymentForm SERIAL PRIMARY KEY NOT NULL,
    Code VARCHAR(10) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Active BOOLEAN DEFAULT TRUE,
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ
);

CREATE TABLE PaymentMethods (
    IdPaymentMethod SERIAL PRIMARY KEY NOT NULL,
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
    Names VARCHAR(255) NOT NULL,
    Address TEXT,
    Email VARCHAR(255),
    Phone VARCHAR(50),
    LegalOrganizationId INT,  -- ID de API Factus (tipo de organización)
    TributeId INT,            -- ID de API Factus (régimen de tributación)
    IdentificationDocumentId INT, -- ID de API Factus (tipo de documento)
    MunicipalityId INT,       -- ID de API Factus (municipio)
    
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ,
    
    Active BOOLEAN DEFAULT TRUE
);

CREATE TABLE Tributes (
    IdTribute SERIAL PRIMARY KEY NOT NULL,
    Code VARCHAR(10) NOT NULL UNIQUE,
    Name VARCHAR(100) NOT NULL,
    Active BOOLEAN DEFAULT TRUE,
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ
);

CREATE SEQUENCE secuencia_venta START 1;

CREATE TABLE Sale (
    IdInternal BIGINT PRIMARY KEY DEFAULT nextval('secuencia_venta'),
    ReferenceCode VARCHAR(20) UNIQUE DEFAULT 'VENTA-' || LPAD(nextval('secuencia_venta')::TEXT, 7, '0'),  -- Código público
    EstablishmentId INT NOT NULL REFERENCES Establishments(IdEstablishment) ON DELETE RESTRICT ON UPDATE CASCADE,
    CustomerId BIGINT NOT NULL REFERENCES Customers(IdCustomer) ON DELETE RESTRICT ON UPDATE CASCADE,
    PaymentFormId INT NOT NULL REFERENCES PaymentForms(IdPaymentForm) ON DELETE RESTRICT ON UPDATE CASCADE,
    PaymentMethodId INT NOT NULL REFERENCES PaymentMethods(IdPaymentMethod) ON DELETE RESTRICT ON UPDATE CASCADE,
   
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
    TributeId INT REFERENCES Tributes(IdTribute) ON DELETE RESTRICT ON UPDATE CASCADE,  -- Tipo de impuesto (opcional)
    IsExcluded BOOLEAN DEFAULT FALSE,  -- Indica si está excluido de impuestos
    UnitMeasureId INT NOT NULL,  -- ID de unidad de medida (API Factus)
    
    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    DateUpdate TIMESTAMPTZ,
    DateDelete TIMESTAMPTZ
);


CREATE TABLE Receipt(
    IdReceipt BIGSERIAL PRIMARY KEY NOT NULL,
    IdSale BIGINT NOT NULL REFERENCES Sale(IdInternal) ON DELETE RESTRICT ON UPDATE CASCADE,
    NameReceipt VARCHAR(50)  NOT NULL,
    public_url TEXT NOT NULL,
    NaneSale VARCHAR(50) NOT NULL,

    DateCreate TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_establishments_municipality ON Establishments(Municipality_Id);

-- Índices para Roles
CREATE INDEX idx_roles_idestablishment ON Roles(IdEstablishment);

-- Índices para Users
CREATE INDEX idx_users_roleuser ON Users(RoleUser);
CREATE INDEX idx_users_idestablishment ON Users(IdEstablishment);
CREATE INDEX idx_users_email ON Users(Email);

-- Índices para SubCategory
CREATE INDEX idx_subcategory_categorysub ON SubCategory(CategorySub);

-- Índices para Product
CREATE INDEX idx_product_idsubcategory ON Product(IdSubCategory);
CREATE INDEX idx_product_code_reference ON Product(code_reference);

-- Índices para DetailProduct
CREATE INDEX idx_detailproduct_idproduct ON DetailProduct(IdProduct);

-- Índices para ProductEstablishments
CREATE INDEX idx_productestablishments_idproduct ON ProductEstablishments(IdProduct);

-- Índices para Customers
CREATE INDEX idx_customers_identification ON Customers(Identification);
CREATE INDEX idx_customers_tributeid ON Customers(TributeId);
CREATE INDEX idx_customers_municipalityid ON Customers(MunicipalityId);

-- Índices para Sale
CREATE INDEX idx_sale_establishmentid ON Sale(EstablishmentId);
CREATE INDEX idx_sale_customerid ON Sale(CustomerId);
CREATE INDEX idx_sale_paymentformid ON Sale(PaymentFormId);
CREATE INDEX idx_sale_paymentmethodid ON Sale(PaymentMethodId);
CREATE INDEX idx_sale_referencecode ON Sale(ReferenceCode);
CREATE INDEX idx_sale_status ON Sale(Status);

-- Índices para SaleDetails
CREATE INDEX idx_saledetails_saleid ON SaleDetails(SaleId);
CREATE INDEX idx_saledetails_productid ON SaleDetails(ProductId);
CREATE INDEX idx_saledetails_tributeid ON SaleDetails(TributeId);