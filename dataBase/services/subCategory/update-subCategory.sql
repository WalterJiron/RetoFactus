/*
  Función: update_subcategory
  Descripción: Actualiza una subcategoría existente con validaciones.
  Parámetros:
    - p_idsubcategory: ID de la subcategoría a actualizar (debe existir y estar activa).
    - p_namesubcategory: Nuevo nombre (opcional, 2-60 caracteres, único en la categoría).
    - p_description: Nueva descripción (opcional, no vacía).
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

    -- 3. Validar descripción si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
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