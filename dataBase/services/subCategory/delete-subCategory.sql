/*
  Función: delete_subcategory
  Descripción: Eliminación lógica de una subcategoría con validaciones de dependencias.
  Parámetros:
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