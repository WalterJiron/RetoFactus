CREATE OR REPLACE FUNCTION ProcRecoverRol(
    p_idrole INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_active BOOLEAN;
    v_namer VARCHAR(50);
    v_row_count INT;
    v_existe_activo BOOLEAN;
BEGIN
    -- Código obligatorio
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;

    BEGIN
        -- Verificar existencia y estado con bloqueo FOR UPDATE
        SELECT Active, Namer INTO STRICT v_active, v_namer
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;  -- Bloquea la fila para esta transacción

        -- Validar si ya está activo
        IF v_active = TRUE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra activo', v_namer, p_idrole);
            RETURN;
        END IF;

        -- Verificar que el nombre del rol no esté siendo usado por otro rol activo
        SELECT EXISTS(
            SELECT 1 FROM Roles 
            WHERE Namer = v_namer 
              AND IdRole <> p_idrole
              AND Active = TRUE
              AND DateDelete IS NULL  -- Aseguramos que no esté eliminado
        ) INTO v_existe_activo;

        IF v_existe_activo THEN
            mensaje := format('No se puede recuperar el rol %s, ya existe un rol activo con ese nombre', v_namer);
            RETURN;
        END IF;

        -- Recuperación del rol (activación) - CORREGIDO: p_idrole en lugar de p_idrol
        UPDATE Roles SET 
            Active = TRUE, 
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole  -- CORRECCIÓN AQUÍ
          AND Active = FALSE;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;

        -- Validar que se actualizó exactamente 1 registro
        IF v_row_count <> 1 THEN
            mensaje := format('Error inesperado al recuperar el rol %s (ID: %s). Filas afectadas: %s', 
                             v_namer, p_idrole, v_row_count);
            RAISE EXCEPTION '%', mensaje;
        END IF;

        mensaje := format('Rol %s recuperado correctamente', v_namer);

    EXCEPTION
        -- Cuando no se encuentra el registro
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        
        -- Cuando hay violación de unicidad del nombre (si tienes restricción única)
        WHEN unique_violation THEN
            mensaje := format('Ya existe un rol activo con el nombre %s. No se puede recuperar.', v_namer);
            RAISE;
        
        -- Cualquier otro error
        WHEN OTHERS THEN
            -- Si el mensaje aún no está establecido, usa el error de PostgreSQL
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al recuperar rol: ' || SQLERRM;
            END IF;
            -- Re-lanzamos para asegurar rollback
            RAISE;
    END;

END;
$$ LANGUAGE plpgsql;