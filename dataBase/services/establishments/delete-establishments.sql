/*
  Funcion: delete_establishments
  Descripcion: Eliminacion logica de un establecimiento con validacion de dependencias activas.
  Parametros:
    - p_idestablishment: ID del establecimiento a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION delete_establishments(p_idestablishment INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia y obtener datos
    SELECT Name, Active INTO v_name, v_active
    FROM Establishments WHERE IdEstablishment = p_idestablishment;
    
    IF NOT FOUND THEN
        RETURN 'Error: Establecimiento no encontrado.';
    END IF;
    
    -- Verificar si ya esta eliminado
    IF NOT v_active THEN
        RETURN 'Error: El establecimiento ya esta eliminado.';
    END IF;

    -- Validar dependencias activas
    IF EXISTS (SELECT 1 FROM Roles WHERE IdEstablishment = p_idestablishment AND Active = true) THEN
        RETURN 'Error: No se puede eliminar el establecimiento porque tiene roles activos asociados.';
    END IF;

    IF EXISTS (SELECT 1 FROM Users WHERE IdEstablishment = p_idestablishment AND Active = true) THEN
        RETURN 'Error: No se puede eliminar el establecimiento porque tiene usuarios activos asociados.';
    END IF;

    -- Proteger establecimiento principal (asumiendo ID 1 como principal)
    IF p_idestablishment = 1 THEN
        RETURN 'Error: No se puede eliminar el establecimiento principal del sistema.';
    END IF;

    -- Transaccion de eliminacion logica
    BEGIN
        UPDATE Establishments
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdEstablishment = p_idestablishment;

        RETURN 'Establecimiento ' || v_name || ' eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar establecimiento: ' || SQLERRM;
    END;
END;
$$;