/*
  Función: update_product_stock
  Descripción: Actualiza el stock de un producto (incremento o decremento).
  Parámetros:
    - p_idproduct: ID del producto.
    - p_quantity_change: Cambio en la cantidad (positivo para incrementar, negativo para disminuir).
    - p_operation: Tipo de operación ('INCREMENT' o 'DECREMENT').
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/
CREATE OR REPLACE FUNCTION update_product_stock(
    p_idproduct BIGINT,
    p_quantity_change INTEGER,
    p_operation VARCHAR(20) DEFAULT 'INCREMENT'
)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_new_stock INTEGER;
    v_current_stock INTEGER;
    v_product_name VARCHAR(80);
BEGIN
    -- Validar parámetros
    IF p_quantity_change <= 0 THEN
        RETURN 'Error: El cambio en cantidad debe ser mayor a cero.';
    END IF;

    -- Obtener stock actual
    SELECT Stock, NameProduct INTO v_current_stock, v_product_name
    FROM Product 
    WHERE IdProduct = p_idproduct AND Active = true;

    IF NOT FOUND THEN
        RETURN 'Error: Producto no encontrado o inactivo.';
    END IF;

    -- Calcular nuevo stock según operación
    IF UPPER(p_operation) = 'INCREMENT' THEN
        v_new_stock := v_current_stock + p_quantity_change;
    ELSIF UPPER(p_operation) = 'DECREMENT' THEN
        v_new_stock := v_current_stock - p_quantity_change;
        
        -- Validar que no quede stock negativo
        IF v_new_stock < 0 THEN
            RETURN 'Error: No hay suficiente stock. Disponible: ' || v_current_stock || ' unidades.';
        END IF;
    ELSE
        RETURN 'Error: Operación no válida. Use "INCREMENT" o "DECREMENT".';
    END IF;

    -- Actualizar stock
    BEGIN
        UPDATE Product
        SET 
            Stock = v_new_stock,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdProduct = p_idproduct;

        RETURN 'Stock actualizado correctamente. Nuevo stock: ' || v_new_stock || ' unidades.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al actualizar stock: ' || SQLERRM;
    END;
END;
$$;