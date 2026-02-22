/*
    Procedimiento: ProcRecoverRol
    Descripcion: Reactiva un rol previamente desactivado, siempre que no exista otro rol activo
        con el mismo nombre en el mismo establecimiento.
    Parametros:
        - p_idrole INT - Identificador del rol a recuperar
    Salida:
        - VARCHAR(100) - Mensaje de resultado (exito o error)
*/
CREATE OR REPLACE FUNCTION ProcRecoverRol(
    p_idrole INT,
    OUT mensaje VARCHAR(100)
)
RETURNS VARCHAR(100) AS $$
DECLARE
    v_active BOOLEAN;
    v_namer VARCHAR(50);
    v_idestablishment INT;
    v_row_count INT;
    v_existe_activo BOOLEAN;
BEGIN
    -- Validacion: codigo obligatorio y positivo
    IF p_idrole IS NULL OR p_idrole <= 0 THEN
        mensaje := 'El código de rol es obligatorio y debe ser un número válido';
        RETURN;
    END IF;

    BEGIN
        -- Verificar existencia, estado y obtener establecimiento con bloqueo
        SELECT Active, Name, IdEstablishment INTO STRICT v_active, v_namer, v_idestablishment
        FROM Roles 
        WHERE IdRole = p_idrole
        FOR UPDATE;

        -- Validar si ya esta activo
        IF v_active = TRUE THEN
            mensaje := format('El rol %s (ID: %s) ya se encuentra activo', v_namer, p_idrole);
            RETURN;
        END IF;

        -- Verificar que el nombre del rol no este siendo usado por otro rol activo en el mismo establecimiento
        SELECT EXISTS(
            SELECT 1 FROM Roles 
            WHERE Name = v_namer 
              AND IdEstablishment = v_idestablishment
              AND IdRole <> p_idrole
              AND Active = TRUE
              AND DateDelete IS NULL
        ) INTO v_existe_activo;

        IF v_existe_activo THEN
            mensaje := format('No se puede recuperar el rol %s, ya existe un rol activo con ese nombre en el mismo establecimiento', v_namer);
            RETURN;
        END IF;

        -- Recuperacion del rol (activacion)
        UPDATE Roles SET 
            Active = TRUE, 
            DateDelete = NULL,
            DateUpdate = CURRENT_TIMESTAMP
        WHERE IdRole = p_idrole
          AND Active = FALSE;

        GET DIAGNOSTICS v_row_count = ROW_COUNT;

        IF v_row_count <> 1 THEN
            mensaje := format('Error inesperado al recuperar el rol %s (ID: %s). Filas afectadas: %s', 
                             v_namer, p_idrole, v_row_count);
            RAISE EXCEPTION '%', mensaje;
        END IF;

        mensaje := format('Rol %s recuperado correctamente', v_namer);

    EXCEPTION
        WHEN NO_DATA_FOUND THEN
            mensaje := format('El rol con ID %s no existe en la base de datos', p_idrole);
            RETURN;
        WHEN unique_violation THEN
            mensaje := format('Ya existe un rol activo con el nombre %s en el establecimiento. No se puede recuperar.', v_namer);
            RAISE;
        WHEN OTHERS THEN
            IF mensaje IS NULL OR mensaje = '' THEN
                mensaje := 'Error al recuperar rol: ' || SQLERRM;
            END IF;
            RAISE;
    END;

END;
$$ LANGUAGE plpgsql;