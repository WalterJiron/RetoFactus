import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Extiende los tipos de Session para incluir accessToken
   */
  interface Session {
    accessToken?: string;
    user: {
      id: string;
      email: string;
      name?: string | null;
    } & DefaultSession["user"];
  }

  /**
   * Extiende los tipos de User para incluir accessToken
   */
  interface User {
    id: string;
    email: string;
    name?: string | null;
    accessToken?: string;
  }
}

declare module "next-auth/jwt" {
  /**
   * Extiende los tipos de JWT para incluir accessToken
   */
  interface JWT {
    accessToken?: string;
    id?: string;
  }
}

