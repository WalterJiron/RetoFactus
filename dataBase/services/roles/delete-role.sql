/*
    Procedimiento: ProcDeleteRol
    Descripcion: Realiza un soft delete (desactivacion) de un rol, siempre que no tenga
        usuarios activos asociados. Verifica existencia y estado previo.
    Parametros:
        - p_idrole INT - Identificador del rol a desactivar
    Salida:
        - VARCHAR(100) - Mensaje de resultado (exito o error)
*/
CREATE OR REPLACE FUNCTION ProcDeleteRol(
    p_idrole INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_active BOOLEAN;
    v_row_count INT;
    v_rol_name VARCHAR(50);
    v_user_count INT;
BEGIN
    -- Validacion: codigo obligatorio y positivo
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;
    
    -- Bloque de transaccion
    BEGIN
        -- Verificar existencia con bloqueo FOR UPDATE
        SELECT Active, Name INTO STRICT v_active, v_rol_name
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;
        
        -- Verificar si ya esta eliminado
        IF v_active = FALSE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra eliminado', v_rol_name, p_idrole);
            RETURN;
        END IF;
        
        -- Verificar si hay usuarios activos asociados al rol
        SELECT COUNT(*) INTO v_user_count
        FROM Users 
        WHERE RoleUser = p_idrole
          AND Active = TRUE;
        
        IF v_user_count > 0 THEN
            mensaje := format('No se puede eliminar el rol %s, existen %s usuario(s) activo(s) con este rol', 
                             v_rol_name, v_user_count);
            RETURN;
        END IF;
        
        -- Realizar soft delete
        UPDATE Roles SET 
            Active = FALSE, 
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole
          AND Active = TRUE;
        
        GET DIAGNOSTICS v_row_count = ROW_COUNT;
        
        IF v_row_count <> 1 THEN
            mensaje := format('Error inesperado al eliminar el rol %s (ID: %s). Filas afectadas: %s', 
                             v_rol_name, p_idrole, v_row_count);
            RAISE EXCEPTION '%', mensaje;
        END IF;
        
        mensaje := format('Rol %s desactivado correctamente', v_rol_name);
        
    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        WHEN lock_not_available THEN
            mensaje := 'El rol está siendo modificado por otro usuario. Intente nuevamente en unos momentos';
            RETURN;
        WHEN OTHERS THEN
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al desactivar rol: ' || SQLERRM;
            END IF;
            RAISE;
    END;
    
END;
$$ LANGUAGE plpgsql;