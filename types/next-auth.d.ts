import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      nome?: string
      cargo?: string
      permissoes?: string[]
      plano?: string
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    nome?: string
    cargo?: string
    permissoes?: string[]
    plano?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
    nome?: string
    cargo?: string
    permissoes?: string[]
    plano?: string
  }
}

