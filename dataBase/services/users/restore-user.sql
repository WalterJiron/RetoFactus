/*
  Funcion: restore_users
  Descripcion: Restaura un usuario eliminado logicamente.
  Parametros:
    - p_iduser: ID del usuario a restaurar (debe existir y estar inactivo).
  Retorna:
    - VARCHAR(100): mensaje de exito o error.
*/

CREATE OR REPLACE FUNCTION restore_users(p_iduser BIGINT)
RETURNS VARCHAR(100)
LANGUAGE plpgsql
AS $$
DECLARE
    v_email VARCHAR(100);
    v_role_id INTEGER;
    v_establishment_id INTEGER;
    v_role_active BOOLEAN;
    v_estab_active BOOLEAN;
BEGIN
    -- Verificar existencia
    IF NOT EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser) THEN
        RETURN 'Error: Usuario no encontrado.';
    END IF;

    -- Verificar que esté eliminado
    IF NOT EXISTS (SELECT 1 FROM Users WHERE IdUser = p_iduser AND Active = false) THEN
        RETURN 'Error: El usuario ya está activo.';
    END IF;

    -- Obtener datos del usuario
    SELECT Email, RoleUser, IdEstablishment INTO v_email, v_role_id, v_establishment_id
    FROM Users WHERE IdUser = p_iduser;

    -- Validar que no exista otro usuario activo con el mismo email
    IF EXISTS (
        SELECT 1 
        FROM Users 
        WHERE Email = v_email 
            AND IdUser != p_iduser 
            AND Active = true
    ) THEN
        RETURN 'Error: Existe otro usuario activo con el mismo email. No se puede restaurar.';
    END IF;

    -- Verificar que el rol del usuario aun exista y esté activo
    SELECT Active INTO v_role_active FROM Roles WHERE IdRole = v_role_id;
    IF NOT FOUND THEN
        RETURN 'Error: El rol asignado al usuario ya no existe.';
    END IF;
    IF NOT v_role_active THEN
        RETURN 'Error: El rol asignado al usuario está inactivo.';
    END IF;

    -- Verificar que el establecimiento del usuario aun exista y esté activo
    SELECT Active INTO v_estab_active FROM Establishments WHERE IdEstablishment = v_establishment_id;
    IF NOT FOUND THEN
        RETURN 'Error: El establecimiento asignado al usuario ya no existe.';
    END IF;
    IF NOT v_estab_active THEN
        RETURN 'Error: El establecimiento asignado al usuario está inactivo.';
    END IF;

    -- Transaccion de restauracion
    BEGIN
        UPDATE Users
        SET 
            Active = true,
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdUser = p_iduser;

        RETURN 'Usuario restaurado correctamente.';
    EXCEPTION
        WHEN OTHERS THEN
            RETURN 'Error al restaurar usuario: ' || SQLERRM;
    END;
END;
$$;