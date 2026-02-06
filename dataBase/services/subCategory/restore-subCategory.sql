/*
  Función: restore_subcategory
  Descripción: Restaura una subcategoría eliminada lógicamente.
  Parámetros:
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