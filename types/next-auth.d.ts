import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    nome: string
    cargo: string
    permissoes: string[]
  }

  interface Session {
    user: {
      id: string
      nome: string
      cargo: string
      permissoes: string[]
    } & DefaultSession["user"]
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    nome: string
    cargo: string
    permissoes: string[]
  }
}

