import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Estendendo a interface User
   */
  interface User {
    id: string
    name: string
    email: string
    plano?: string
    role?: string
  }

  /**
   * Estendendo a interface Session
   */
  interface Session {
    user: {
      id: string
      plano: string
      role?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /** Estendendo o token JWT */
  interface JWT {
    id: string
    plano?: string
    role?: string
  }
}

