import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  /**
   * Estendendo a interface User
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
  }

  /**
   * Estendendo a interface Session
   */
  interface Session {
    user: {
      id: string
      role: string
      nome: string
      cargo: string
      permissoes: string[]
      plano: string
      emailVerificado: boolean
      lojaId?: string
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  /** Estendendo a interface JWT */
  interface JWT {
    id: string
    role: string
    nome: string
    cargo: string
    permissoes: string[]
    plano: string
    emailVerificado: boolean
    lojaId?: string
  }
}
