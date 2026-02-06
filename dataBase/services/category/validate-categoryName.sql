/*
  Función: validate_category_name_unique
  Descripción: Función auxiliar para validar unicidad del nombre de categoría.
  Parámetros:
    - p_namecategory: Nombre a validar.
    - p_exclude_id: ID de categoría a excluir (opcional).
  Retorna:
    - BOOLEAN: true si el nombre es único, false si no lo es.
*/
CREATE OR REPLACE FUNCTION validate_category_name_unique(
    p_namecategory VARCHAR(60),
    p_exclude_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
    v_count INTEGER;
BEGIN
    IF p_exclude_id IS NULL THEN
        SELECT COUNT(*) INTO v_count
        FROM Category
        WHERE NameCategory = TRIM(p_namecategory);
    ELSE
        SELECT COUNT(*) INTO v_count
        FROM Category
        WHERE NameCategory = TRIM(p_namecategory)
        AND IdCategory != p_exclude_id;
    END IF;
    
    RETURN v_count = 0;
END;
$$;