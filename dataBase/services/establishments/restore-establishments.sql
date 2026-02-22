/*
  Funcion: restore_establishments
  Descripcion: Restaura un establecimiento eliminado logicamente.
  Parametros:
    - p_idestablishment: ID del establecimiento a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/
CREATE OR REPLACE FUNCTION restore_establishments(p_idestablishment INTEGER)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_name VARCHAR(100);
    v_active BOOLEAN;
BEGIN
    -- Verificar existencia y estado
    SELECT Name, Active INTO v_name, v_active
    FROM Establishments WHERE IdEstablishment = p_idestablishment;
    
    IF NOT FOUND THEN
        RETURN 'Error: Establecimiento no encontrado.';
    END IF;
    
    IF v_active THEN
        RETURN 'Error: El establecimiento ya esta activo.';
    END IF;

    -- Transaccion de restauracion
    BEGIN
        UPDATE Establishments
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdEstablishment = p_idestablishment;

        RETURN 'Establecimiento (' || v_name || ') restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar establecimiento: ' || SQLERRM;
    END;
END;
$$;