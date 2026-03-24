import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

/**
 * Configuracion de autenticacion NextAuth para la aplicacion.
 * Utiliza proveedor de credenciales personalizado que se integra con una API REST externa
 * y maneja tokens JWT para la sesion del usuario.
 *
 * @see https://next-auth.js.org
 * @see https://next-auth.js.org/providers/credentials
 */
export const authOptions: NextAuthOptions = {
    /**
     * Configuracion de paginas personalizadas para el flujo de autenticacion.
     * Todas las paginas apuntan a la ruta raiz para un flujo simplificado.
     */
    pages: {
        signIn: "/",
        signOut: "/",
        error: "/",
    },

    /**
     * Proveedores de autenticacion configurados.
     * En este caso, solo se utiliza el proveedor de credenciales para autenticacion personalizada.
     */
    providers: [
        /**
         * Proveedor de credenciales para autenticacion con email y password.
         * Se integra con un endpoint de login personalizado y maneja tokens de acceso.
         */
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {},
                password: {},
            },

            async authorize(credentials) {
                if (!credentials) return null;

                const res = await fetch(`${process.env.API_URL}/auth/login`, {
                    method: "POST",
                    body: JSON.stringify({
                        email: credentials.email,
                        password: credentials.password,
                    }),
                    headers: { "Content-Type": "application/json" },
                });

                const authData = await res.json();

                // Si la API responde con error, lanzamos el mensaje exacto del backend
                if (!res.ok) {
                    throw new Error(authData.message || "Credenciales inválidas");
                }

                if (!authData.accessToken) {
                    throw new Error("Token no recibido del servidor");
                }

                return {
                    id: credentials.email,
                    email: credentials.email,
                    accessToken: authData.accessToken,
                };
            },
        }),
    ],

    /**
     * Callbacks para personalizar el comportamiento de JWT y sesion.
     */
    callbacks: {
        /**
         * Callback JWT que se ejecuta cada vez que se genera un JWT.
         * Agrega el token de acceso y el ID del usuario al token JWT.
         *
         * @param {Object} params - Parametros del callback JWT.
         * @param {Object} params.token - Token JWT actual.
         * @param {Object} params.user - Objeto de usuario (solo disponible durante la inicializacion).
         * @param {Object} params.account - Informacion de la cuenta del proveedor.
         * @returns {Promise<Object>} Token JWT actualizado.
         */
        async jwt({ token, user, account }) {
            if (user) {
                token.accessToken = user.accessToken;
                token.id = user.id;
            }

            return token;
        },

        /**
         * Callback de sesion que se ejecuta cada vez que se recupera una sesion.
         * Hace disponible el token de acceso y el ID del usuario en el objeto de sesion.
         *
         * @param {Object} params - Parametros del callback de sesion.
         * @param {Object} params.session - Objeto de sesion actual.
         * @param {Object} params.token - Token JWT actual.
         * @returns {Promise<Object>} Sesion actualizada con token de acceso y ID de usuario.
         */
        async session({ session, token }) {
            // Hacer disponible el token de NestJS en el frontend
            session.accessToken = token.accessToken as string;
            session.user.id = token.id as string;

            return session;
        },
    },

    /**
     * Configuracion de la estrategia de sesion.
     * Utiliza JWT para almacenar el estado de sesion en el cliente.
     */
    session: {
        strategy: "jwt", // Esto es necesario para usar JWT
        maxAge: 24 * 60 * 60, // 24 horas
    },

    /**
     * Secreto utilizado para firmar los tokens JWT.
     * Debe estar definido en las variables de entorno.
     */
    secret: process.env.NEXTAUTH_SECRET,
};

/**
 * Exporta los manejadores HTTP GET y POST para las rutas de autenticacion de NextAuth.
 * NextAuth utiliza estas funciones para manejar todas las solicitudes de autenticacion.
 */
const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
