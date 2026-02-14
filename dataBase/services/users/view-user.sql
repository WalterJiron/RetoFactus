CREATE OR REPLACE FUNCTION obtener_usuario_por_email(p_email VARCHAR(100))
RETURNS TABLE (
    id BIGINT,
    Establishment INT,
    role_name VARCHAR(50)
) 
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        U.iduser,
        U.Idestablishment,
        R.namer
    FROM users AS U
    LEFT JOIN roles AS R ON U.roleuser = R.idrole
    WHERE U.email = p_email;
END;
$$;