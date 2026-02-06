/*
  Función: restore_category
  Descripción: Restaura una categoría eliminada lógicamente.
  Parámetros:
    - p_idcategory: ID de la categoría a restaurar (debe existir y estar inactiva).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_category(p_idcategory INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_namecategory VARCHAR(60);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Category WHERE IdCategory = p_idcategory) THEN
        RETURN 'Error: Categoría no encontrada.';
    END IF;

    -- Obtener información de la categoría
    SELECT NameCategory, Active INTO v_namecategory, v_active
    FROM Category WHERE IdCategory = p_idcategory;

    -- Verificar que esté eliminada
    IF v_active THEN
        RETURN 'Error: La categoría ya está activa.';
    END IF;

    -- Validar que no exista otra categoría activa con el mismo nombre
    IF EXISTS (
        SELECT 1 
        FROM Category 
        WHERE NameCategory = v_namecategory 
            AND IdCategory != p_idcategory 
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otra categoría activa con el mismo nombre. No se puede restaurar.';
    END IF;

    -- Transacción de restauración
    BEGIN
        UPDATE Category
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCategory = p_idcategory;

        RETURN 'Categoría restaurada correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar categoría: ' || SQLERRM;
    END;
END;
$$;