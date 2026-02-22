/*
  Funcion: obtener_usuario_por_email
  Descripcion: Retorna el ID, establecimiento y nombre del rol de un usuario dado su email.
  Parametros:
    - p_email: Correo electronico del usuario.
  Retorna:
    - Tabla con columnas: id, Establishment, role_name.
*/
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
        U.IdUser,
        U.IdEstablishment,
        R.Name  
    FROM Users AS U
    LEFT JOIN Roles AS R ON U.RoleUser = R.IdRole
    WHERE U.Email = p_email;
END;
$$;