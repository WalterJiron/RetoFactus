/*
  Función: update_product
  Descripción: Actualiza un producto existente con validaciones.
  Parámetros:
    - p_idproduct: ID del producto a actualizar (debe existir y estar activo).
    - p_code_reference: Nuevo código de referencia (opcional, único si se proporciona).
    - p_nameproduct: Nuevo nombre (opcional, 2-80 caracteres).
    - p_description: Nueva descripción (opcional, no vacía).
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

    -- Validar descripción si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
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