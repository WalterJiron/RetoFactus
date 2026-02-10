/*
  Función: delete_detailproduct
  Descripción: Eliminación lógica de un detalle de producto con validaciones.
  Parámetros:
    - p_iddetailproduct: ID del detalle a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION delete_detailproduct(p_iddetailproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct INTEGER;
    v_product_name VARCHAR(80);
    v_active_detail_count INTEGER;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct) THEN
        RETURN 'Error: Detalle de producto no encontrado.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct AND Active = false) THEN
        RETURN 'Error: El detalle ya está eliminado.';
    END IF;

    -- Obtener información del producto asociado
    SELECT dp.IdProduct, p.NameProduct 
    INTO v_idproduct, v_product_name
    FROM DetailProduct dp
    INNER JOIN Product p ON dp.IdProduct = p.IdProduct
    WHERE dp.IdDetailProduct = p_iddetailproduct;

    -- Validación: No permitir eliminar si es el único detalle activo del producto
    SELECT COUNT(*) INTO v_active_detail_count
    FROM DetailProduct
    WHERE IdProduct = v_idproduct AND Active = true;
    
    IF v_active_detail_count <= 1 THEN
        RETURN 'Error: No se puede eliminar el único detalle activo del producto "' || 
               v_product_name || '". Cree un nuevo detalle primero.';
    END IF;
    
    -- Transacción de eliminación lógica
    BEGIN
        UPDATE DetailProduct
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdDetailProduct = p_iddetailproduct;

        RETURN 'Detalle de producto eliminado correctamente del producto ' || v_product_name || '.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar detalle de producto: ' || SQLERRM;
    END;
END;
$$;