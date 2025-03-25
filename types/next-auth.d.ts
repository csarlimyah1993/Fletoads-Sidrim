import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      plano: string
      role?: string
      nome: string
      cargo: string
      permissoes: string[]
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    name: string
    email: string
    nome: string
    cargo: string
    permissoes: string[]
    plano: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    name: string
    nome: string
    cargo: string
    permissoes: string[]
    plano: string
    role: string
  }
}

