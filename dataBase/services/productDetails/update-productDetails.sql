/*
  Función: update_detailproduct
  Descripción: Actualiza un detalle de producto existente con validaciones.
  Parámetros:
    - p_iddetailproduct: ID del detalle a actualizar (debe existir y estar activo).
    - p_minstock: Nuevo stock mínimo (opcional, >= 0).
    - p_purchaseprice: Nuevo precio de compra (opcional, >= 0.001).
    - p_saleprice: Nuevo precio de venta (opcional, >= p_purchaseprice).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_detailproduct(
    p_iddetailproduct BIGINT,
    p_minstock INTEGER DEFAULT NULL,
    p_purchaseprice DECIMAL(10,3) DEFAULT NULL,
    p_saleprice DECIMAL(10,3) DEFAULT NULL
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_idproduct INTEGER;
    v_current_purchaseprice DECIMAL(10,3);
    v_current_saleprice DECIMAL(10,3);
    v_active BOOLEAN;
    v_product_active BOOLEAN;
BEGIN
    -- Verificar existencia y estado del detalle
    SELECT IdProduct, PurchasePrice, SalePrice, Active 
    INTO v_idproduct, v_current_purchaseprice, v_current_saleprice, v_active
    FROM DetailProduct WHERE IdDetailProduct = p_iddetailproduct;
    
    IF NOT FOUND THEN
        RETURN 'Error: Detalle de producto no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: No se puede actualizar un detalle eliminado.';
    END IF;

    -- Verificar que el producto asociado esté activo
    SELECT Active INTO v_product_active
    FROM Product WHERE IdProduct = v_idproduct;
    
    IF NOT v_product_active THEN
        RETURN 'Error: El producto asociado está inactivo.';
    END IF;

    -- Validar stock mínimo si se proporciona
    IF p_minstock IS NOT NULL AND p_minstock < 0 THEN
        RETURN 'Error: El stock mínimo no puede ser negativo.';
    END IF;

    -- Validar precios si se proporcionan
    DECLARE
        v_new_purchaseprice DECIMAL(10,3);
        v_new_saleprice DECIMAL(10,3);
    BEGIN
        v_new_purchaseprice := COALESCE(p_purchaseprice, v_current_purchaseprice);
        v_new_saleprice := COALESCE(p_saleprice, v_current_saleprice);
        
        -- Validaciones de precios
        IF v_new_purchaseprice <= 0 THEN
            RETURN 'Error: El precio de compra debe ser mayor a cero.';
        END IF;
        
        IF v_new_saleprice < 0 THEN
            RETURN 'Error: El precio de venta debe ser mayor o igual a cero.';
        END IF;
        
        IF v_new_saleprice < v_new_purchaseprice THEN
            RETURN 'Error: El precio de venta no puede ser menor al precio de compra.';
        END IF;
    END;

    -- Transacción de actualización
    BEGIN
        UPDATE DetailProduct
        SET
            MinStock = COALESCE(p_minstock, MinStock),
            PurchasePrice = COALESCE(p_purchaseprice, PurchasePrice),
            SalePrice = COALESCE(p_saleprice, SalePrice),
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdDetailProduct = p_iddetailproduct;

        -- Verificar si se actualizó algún registro
        IF NOT FOUND THEN
            RETURN 'Error: No se pudo actualizar el detalle de producto.';
        END IF;

        RETURN 'Detalle de producto actualizado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar detalle de producto: ' || SQLERRM;
    END;
END;
$$;