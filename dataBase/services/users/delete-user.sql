/*
  Función: delete_users
  Descripción: Eliminación lógica de un usuario.
  Parámetros:
    - p_iduser: ID del usuario a eliminar (debe existir y estar activo).
  Retorna:
    - VARCHAR(100): mensaje de éxito o error.
*/

CREATE OR REPLACE FUNCTION delete_users(p_iduser BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_role_id INTEGER;
    v_admin_count INTEGER;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser) THEN
        RETURN 'Error: Usuario no encontrado.';
    END IF;

    -- Verificar estado actual
    IF EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser AND Active = false) THEN
        RETURN 'Error: El usuario ya está eliminado.';
    END IF;

    -- Validación de negocio: No permitir eliminar el último usuario administrador
    -- Asumiendo que el rol con IdRole = 1 es el administrador
    SELECT RoleUser INTO v_role_id FROM Users WHERE IdUser = p_iduser;
    
    IF v_role_id = 1 THEN -- Si es administrador
        SELECT COUNT(*) INTO v_admin_count 
        FROM Users 
        WHERE RoleUser = 1 AND Active = true AND IdUser != p_iduser;
        
        IF v_admin_count = 0 THEN
            RETURN 'Error: No se puede eliminar el último usuario administrador.';
        END IF;
    END IF;

    -- Transacción de eliminación lógica
    BEGIN
        UPDATE Users
        SET 
            Active = false,
            DateDelete = CURRENT_TIMESTAMP
        WHERE IdUser = p_iduser;

        RETURN 'Usuario eliminado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al eliminar usuario: ' || SQLERRM;
    END;
END;
$$;