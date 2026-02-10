/*
  Función: restore_detailproduct
  Descripción: Restaura un detalle de producto eliminado lógicamente.
  Parámetros:
    - p_iddetailproduct: ID del detalle a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION restore_detailproduct(p_iddetailproduct BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct INTEGER;
    v_product_active BOOLEAN;
    v_active_detail_count INTEGER;
    v_product_name VARCHAR(80);
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct) THEN
        RETURN 'Error: Detalle de producto no encontrado.';
    END IF;

    -- Verificar que esté eliminado
    IF EXISTS (SELECT 1 FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct AND Active = true) THEN
        RETURN 'Error: El detalle ya está activo.';
    END IF;

    -- Obtener información del producto asociado
    SELECT dp.IdProduct, p.NameProduct, p.Active
    INTO v_idproduct, v_product_name, v_product_active
    FROM DetailProduct dp
    INNER JOIN Product p ON dp.IdProduct = p.IdProduct
    WHERE dp.IdDetailProduct = p_iddetailproduct;

    -- Verificar que el producto esté activo
    IF NOT v_product_active THEN
        RETURN 'Error: El producto "' || v_product_name || '" está inactivo. Active primero el producto.';
    END IF;

    -- Para evitar tener múltiples detalles activos con diferentes precios
    DECLARE
        v_current_purchaseprice DECIMAL(10,3);
        v_current_saleprice DECIMAL(10,3);
        v_conflicting_detail BIGINT;
    BEGIN
        SELECT PurchasePrice, SalePrice 
        INTO v_current_purchaseprice, v_current_saleprice
        FROM DetailProduct 
        WHERE IdDetailProduct = p_iddetailproduct;

        -- Buscar si hay otro detalle activo con diferentes precios
        SELECT IdDetailProduct INTO v_conflicting_detail
        FROM DetailProduct
        WHERE IdProduct = v_idproduct 
          AND Active = true
          AND (PurchasePrice != v_current_purchaseprice OR SalePrice != v_current_saleprice)
        LIMIT 1;

        IF FOUND THEN
            -- Desactivar el detalle activo existente antes de restaurar este
            UPDATE DetailProduct
            SET 
                Active = false,
                DateUpdate = CURRENT_TIMESTAMP,
                DateDelete = CURRENT_TIMESTAMP
            WHERE IdDetailProduct = v_conflicting_detail;
        END IF;
    END;

    -- Transacción de restauración
    BEGIN
        UPDATE DetailProduct
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdDetailProduct = p_iddetailproduct;

        RETURN 'Detalle de producto restaurado correctamente para el producto ' || v_product_name || '.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar detalle de producto: ' || SQLERRM;
    END;
END;
$$;