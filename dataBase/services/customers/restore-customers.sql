/*
  Funcion: restore_customers
  Descripcion: Restaura un cliente eliminado logicamente.
  Parametros:
    - p_idcustomer: ID del cliente a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION restore_customers(p_idcustomer BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_identification VARCHAR(50);
    v_email VARCHAR(100);
    v_phone VARCHAR(50);
    v_names VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    
    SELECT Identification, Email, Phone, Names, Active INTO v_identification, v_email, v_phone, v_names, v_active
    FROM Customers WHERE IdCustomer = p_idcustomer;
    
    IF NOT FOUND THEN
        RETURN 'Error: Cliente no encontrado.';
    END IF;
    
    IF v_active THEN
        RETURN 'Error: El cliente ya esta activo.';
    END IF;

    IF EXISTS (SELECT 1 FROM Customers WHERE Identification = v_identification AND Active = true AND IdCustomer != p_idcustomer) THEN
        RETURN 'Error: Ya existe otro cliente activo con la misma identificacion. No se puede restaurar.';
    END IF;
    IF EXISTS (SELECT 1 FROM Customers WHERE Email = v_email AND Active = true AND IdCustomer != p_idcustomer) THEN
        RETURN 'Error: Ya existe otro cliente activo con el mismo email. No se puede restaurar.';
    END IF;
    IF EXISTS (SELECT 1 FROM Customers WHERE Phone = v_phone AND Active = true AND IdCustomer != p_idcustomer) THEN
        RETURN 'Error: Ya existe otro cliente activo con el mismo telefono. No se puede restaurar.';
    END IF;

    -- Transaccion
    BEGIN
        UPDATE Customers
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdCustomer = p_idcustomer;

        RETURN 'Cliente "' || v_names || '" restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar cliente: ' || SQLERRM;
    END;
END;
$$;