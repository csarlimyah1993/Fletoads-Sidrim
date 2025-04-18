import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Extending the User interface
   */
  interface User {
    id: string
    role?: string
    nome?: string
    cargo?: string
    permissoes?: string[]
    plano?: string
    emailVerificado?: boolean
    lojaId?: string
    twoFactorEnabled?: boolean
    twoFactorMethod?: "email" | "app"
  }

  /**
   * Extending the Session interface
   */
  interface Session {
    user: {
      id: string
      role: string
      nome?: string
      cargo?: string
      permissoes?: string[]
      plano?: string
      emailVerificado?: boolean
      lojaId?: string
      twoFactorEnabled?: boolean
      twoFactorMethod?: "email" | "app"
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /** Extending the JWT interface */
  interface JWT {
    id: string
    role: string
    nome?: string
    cargo?: string
    permissoes?: string[]
    plano?: string
    emailVerificado?: boolean
    lojaId?: string
    twoFactorEnabled?: boolean
    twoFactorMethod?: "email" | "app"
  }
}
