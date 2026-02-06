/*
  Función: update_category
  Descripción: Actualiza una categoría existente con validaciones.
  Parámetros:
    - p_idcategory: ID de la categoría (debe existir y estar activa).
    - p_namecategory: Nuevo nombre (opcional, 2-60 caracteres, único).
    - p_description: Nueva descripción (opcional, no vacía).
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
            -- Verificar unicidad excluyendo la categoría actual usando la función auxiliar
            IF NOT validate_category_name_unique(p_namecategory, p_idcategory) THEN
                RETURN 'Error: Ya existe otra categoría activa con ese nombre.';
            END IF;
        END IF;
    END IF;

    -- Validar descripción si se proporciona
    IF p_description IS NOT NULL AND TRIM(p_description) = '' THEN
        RETURN 'Error: La descripción no puede estar vacía.';
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