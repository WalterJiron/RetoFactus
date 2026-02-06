/*
  Función: create_category
  Descripción: Inserta una nueva categoría aplicando validaciones de negocio.
  Parámetros:
    - p_namecategory: Nombre de la categoría (2-60 caracteres, único).
    - p_description: Descripción de la categoría (no vacía).
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
    -- Validaciones
    -- Campos obligatorios no nulos
    IF p_namecategory IS NULL OR p_description IS NULL THEN
        RETURN 'Error: Nombre y descripción son obligatorios.';
    END IF;

    -- Validar longitud del nombre
    IF LENGTH(TRIM(p_namecategory)) < 2 OR LENGTH(TRIM(p_namecategory)) > 60 THEN
        RETURN 'Error: El nombre debe tener entre 2 y 60 caracteres.';
    END IF;

    -- Validar que la descripción no esté vacía
    IF TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
    END IF;

    -- Validar unicidad del nombre usando la función auxiliar
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