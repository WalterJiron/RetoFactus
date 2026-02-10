/*
  Función: create_detailproduct
  Descripción: Inserta un nuevo detalle de producto aplicando validaciones de negocio.
               Solo un detalle activo por producto. Al crear uno nuevo, se desactivan los anteriores.
  Parámetros:
    - p_idproduct: ID del producto (debe existir y estar activo).
    - p_minstock: Stock mínimo (>= 0).
    - p_purchaseprice: Precio de compra (>= 0.001).
    - p_saleprice: Precio de venta (>= p_purchaseprice).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION create_detailproduct(
    p_idproduct INTEGER,
    p_minstock INTEGER,
    p_purchaseprice DECIMAL(10,3),
    p_saleprice DECIMAL(10,3)
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_iddetailproduct BIGINT;
    v_product_active BOOLEAN;
    v_product_name VARCHAR(80);
    v_existing_active_count INTEGER;
BEGIN
    -- Campos obligatorios no nulos
    IF p_idproduct IS NULL OR p_minstock IS NULL OR 
       p_purchaseprice IS NULL OR p_saleprice IS NULL THEN
        RETURN 'Error: Todos los campos son obligatorios.';
    END IF;

    -- Validar stock minimo no negativo
    IF p_minstock < 0 THEN
        RETURN 'Error: El stock mínimo no puede ser negativo.';
    END IF;

    -- Precio de compra debe ser positivo
    IF p_purchaseprice < 0 THEN
        RETURN 'Error: El precio de compra debe ser mayor o igual a cero.';
    END IF;
    
    -- Precio de venta debe ser positivo
    IF p_saleprice < 0 THEN
        RETURN 'Error: El precio de venta debe ser mayor o igual a cero.';
    END IF;
    
    -- Precio de venta debe ser mayor o igual al precio de compra (margen minimo 0)
    IF p_saleprice < p_purchaseprice THEN
        RETURN 'Error: El precio de venta no puede ser menor al precio de compra.';
    END IF;

    --  Verificar existencia y estado del producto
    SELECT Active, NameProduct INTO v_product_active, v_product_name
    FROM Product WHERE IdProduct = p_idproduct;
    
    IF NOT FOUND THEN
        RETURN 'Error: El producto especificado no existe.';
    END IF;
    
    IF NOT v_product_active THEN
        RETURN 'Error: El producto especificado está inactivo.';
    END IF;

    --  Verificar si ya existe un detalle activo para este producto
    SELECT COUNT(*) INTO v_existing_active_count
    FROM DetailProduct 
    WHERE IdProduct = p_idproduct AND Active = true;
    
    -- (por si hay inconsistencias en la base de datos)
    IF v_existing_active_count > 1 THEN
        -- Esto no debería pasar, pero si pasa, jajaj
        UPDATE DetailProduct SET
            Active = false, DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct AND Active = true;
    END IF;

    -- Transacción de inserción
    BEGIN
        -- Desactivar cualquier detalle activo existente para este producto
        UPDATE DetailProduct
        SET 
            Active = false,
            DateUpdate = CURRENT_TIMESTAMP,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct AND Active = true;

        -- Insertar nuevo detalle activo
        INSERT INTO DetailProduct (
            IdProduct,
            MinStock,
            PurchasePrice,
            SalePrice,
            Active
        ) VALUES (
            p_idproduct,
            p_minstock,
            p_purchaseprice,
            p_saleprice,
            true
        ) RETURNING IdDetailProduct INTO v_iddetailproduct;

        RETURN 'Detalle de producto creado correctamente para ' || v_product_name || 
               '. ID: ' || v_iddetailproduct;
    EXCEPTION
        WHEN foreign_key_violation THEN
            RETURN 'Error: El producto especificado no existe.';
        WHEN OTHERS THEN
            RETURN 'Error al crear detalle de producto: ' || SQLERRM;
    END;
END;
$$;