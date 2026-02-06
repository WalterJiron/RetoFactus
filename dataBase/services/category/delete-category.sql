/*
  Función: delete_category
  Descripción: Eliminación lógica de una categoría con validaciones de dependencias.
  Parámetros:
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