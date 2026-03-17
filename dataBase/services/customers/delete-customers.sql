/*
  Funcion: delete_customers
  Descripcion: Eliminacion logica de un cliente con validacion de dependencias.
  Parametros:
    - p_idcustomer: ID del cliente a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION delete_customers(p_idcustomer BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_names VARCHAR(100);
    v_active BOOLEAN;
    v_sales_count INTEGER;
BEGIN
    SELECT Names, Active INTO v_names, v_active
    FROM Customers WHERE IdCustomer = p_idcustomer;
    
    IF NOT FOUND THEN
        RETURN 'Error: Cliente no encontrado.';
    END IF;
    
    IF NOT v_active THEN
        RETURN 'Error: El cliente ya esta eliminado.';
    END IF;

    SELECT COUNT(*) INTO v_sales_count
    FROM Sale
    WHERE CustomerId = p_idcustomer AND Active = true AND Status != 'cancelled';
    
    IF v_sales_count > 0 THEN
        RETURN 'Error: No se puede eliminar el cliente porque tiene ' || v_sales_count || ' ventas activas asociadas.';
    END IF;

    BEGIN
        UPDATE Customers
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCustomer = p_idcustomer;

        RETURN 'Cliente (' || v_names || ') eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar cliente: ' || SQLERRM;
    END;
END;
$$;