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
    -- Validación 1: Código obligatorio
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;
    
    -- Bloque de transacción
    BEGIN
        -- Verificar existencia con bloqueo FOR UPDATE
        -- Esto previene lecturas sucias durante la transacción
        SELECT Active, Namer INTO STRICT v_active, v_rol_name
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;  -- Removido NOWAIT para mejor compatibilidad
        
        -- NOTA: STRICT hace que si no encuentra el registro, lance una excepción
        
        -- Verificar si ya está eliminado (Active = FALSE)
        IF v_active = FALSE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra eliminado', v_rol_name, p_idrole);
            RETURN;
        END IF;
        
        -- Verificar si hay usuarios activos asociados al rol
        -- Contar usuarios activos para dar mensaje más informativo
        SELECT COUNT(*) INTO v_user_count
        FROM Users 
        WHERE RoleUser = p_idrole  -- CORREGIDO: cambiado IdRole por RoleUser
          AND Active = TRUE;
        
        IF v_user_count > 0 THEN
            mensaje := format('No se puede eliminar el rol %s, existen %s usuario(s) activo(s) con este rol', 
                             v_rol_name, v_user_count);
            RETURN;
        END IF;
        
        -- También verificar si hay otros registros dependientes
        -- Ejemplo: permisos, configuraciones, etc.
        -- IF EXISTS (SELECT 1 FROM Permisos WHERE IdRole = p_idrole) THEN
        --     mensaje := 'No se puede eliminar el rol porque tiene permisos asignados';
        --     RETURN;
        -- END IF;
        
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
        
        -- Éxito
        mensaje := format('Rol %s desactivado correctamente', v_rol_name);
        
    EXCEPTION
        -- Excepción específica cuando no se encuentra el registro
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        -- Excepción cuando el registro está bloqueado por otra transacción
        WHEN lock_not_available THEN  -- CORREGIDO: snake_case para consistencia
            mensaje := 'El rol está siendo modificado por otro usuario. Intente nuevamente en unos momentos';
            RETURN;
        WHEN OTHERS THEN
            -- Asegurar que siempre haya un mensaje de retorno
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al desactivar rol: ' || SQLERRM;
            END IF;
            -- Re-lanzar la excepción original para rollback automático
            RAISE;
    END;
    
END;
$$ LANGUAGE plpgsql;