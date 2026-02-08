/*
  Función: delete_product
  Descripción: Eliminación lógica de un producto con validaciones.
  Parámetros:
    - p_idproduct: ID del producto a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_product(p_idproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_product_name VARCHAR(80);
    v_current_stock INTEGER;
    v_has_active_details BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Product WHERE IdProduct = p_idproduct) THEN
        RETURN 'Error: Producto no encontrado.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM Product WHERE IdProduct = p_idproduct AND Active = false) THEN
        RETURN 'Error: El producto ya está eliminado.';
    END IF;

    -- 3. Obtener información del producto
    SELECT NameProduct, Stock INTO v_product_name, v_current_stock
    FROM Product WHERE IdProduct = p_idproduct;

    -- No eliminar productos con stock > 0 (política de negocio)
    IF v_current_stock > 0 THEN
        RETURN 'Error: No se puede eliminar el producto "' || v_product_name || 
               '" porque tiene ' || v_current_stock || ' unidades en stock.';
    END IF;

    -- Transacción de eliminación lógica
    BEGIN
        -- Primero, eliminar lógicamente los detalles (si existen)
        UPDATE DetailProduct SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct
        AND Active = true;

        -- Luego, eliminar el producto
        UPDATE Product
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        RETURN 'Producto "' || v_product_name || '" eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar producto: ' || SQLERRM;
    END;
END;
$$;