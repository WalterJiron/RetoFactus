/*
  Función: restore_product
  Descripción: Restaura un producto eliminado lógicamente.
  Parámetros:
    - p_idproduct: ID del producto a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_product(p_idproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_name VARCHAR(80);
    v_code_reference TEXT;
    v_idsubcategory INTEGER;
    v_active BOOLEAN;
    v_subcategory_active BOOLEAN;
    v_category_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Product WHERE IdProduct = p_idproduct) THEN
        RETURN 'Error: Producto no encontrado.';
    END IF;

    -- Obtener información del producto
    SELECT NameProduct, code_reference, IdSubCategory, Active 
    INTO v_product_name, v_code_reference, v_idsubcategory, v_active
    FROM Product WHERE IdProduct = p_idproduct;

    -- Verificar que esté eliminado
    IF v_active THEN
        RETURN 'Error: El producto ya está activo.';
    END IF;

    -- Verificar que la subcategoría exista y esté activa
    SELECT COALESCE((SELECT Active FROM SubCategory WHERE IdSubCategory = v_idsubcategory), false)
    INTO v_subcategory_active;
    
    IF NOT v_subcategory_active THEN
        RETURN 'Error: La subcategoría del producto está inactiva. Active primero la subcategoría.';
    END IF;

    -- Verificar que la categoría padre esté activa
    SELECT c.Active INTO v_category_active
    FROM SubCategory sc
    INNER JOIN Category c ON sc.CategorySub = c.IdCategory
    WHERE sc.IdSubCategory = v_idsubcategory;
    
    IF NOT v_category_active THEN
        RETURN 'Error: La categoría de la subcategoría está inactiva. Active primero la categoría.';
    END IF;

    -- Validar unicidad del código de referencia (si tiene)
    IF v_code_reference IS NOT NULL AND v_code_reference != '' THEN
        IF EXISTS (
            SELECT 1 
            FROM Product 
            WHERE code_reference = v_code_reference 
                AND IdProduct != p_idproduct
                AND Active = true
        ) THEN
            RETURN 'Error: Existe otro producto activo con el mismo código de referencia. No se puede restaurar.';
        END IF;
    END IF;

    -- Validar unicidad del nombre en la subcategoría
    IF EXISTS (
        SELECT 1 
        FROM Product 
        WHERE NameProduct = v_product_name 
            AND IdSubCategory = v_idsubcategory
            AND IdProduct != p_idproduct
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otro producto activo con el mismo nombre en esta subcategoría. No se puede restaurar.';
    END IF;

    -- Transacción de restauración
    BEGIN
        -- Primero, restaurar el producto
        UPDATE Product SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        -- Luego, restaurar los detalles asociados
        UPDATE DetailProduct SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct
        AND Active = false;

        RETURN 'Producto ' || v_product_name || ' restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar producto: ' || SQLERRM;
    END;
END;
$$;