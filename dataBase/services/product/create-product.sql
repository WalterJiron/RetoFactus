/*
  Función: create_product
  Descripción: Inserta un nuevo producto aplicando validaciones de negocio.
  Parámetros:
    - p_code_reference: Código de referencia único (opcional, único si se proporciona).
    - p_nameproduct: Nombre del producto (2-80 caracteres).
    - p_description: Descripción del producto (no vacía).
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

    -- Validar que la descripción no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
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