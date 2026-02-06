/*
  Función: create_subcategory
  Descripción: Inserta una nueva subcategoría aplicando validaciones de negocio.
  Parámetros:
    - p_namesubcategory: Nombre de la subcategoría (2-60 caracteres, único en la categoría).
    - p_description: Descripción de la subcategoría (no vacía).
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

    --Validar que la descripción no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
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