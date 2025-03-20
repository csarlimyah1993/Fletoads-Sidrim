import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface User {
    id: string
    nome: string
    email: string
    role?: string
    plano?: {
      id: string
      nome: string
      slug: string
      ativo: boolean
      dataInicio?: string | Date
      dataFim?: string | Date
    }
  }

  interface Session extends DefaultSession {
    user: User & {
      id: string
      role?: string
      plano?: {
        id: string
        nome: string
        slug: string
        ativo: boolean
        dataInicio?: string | Date
        dataFim?: string | Date
      }
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role?: string
    plano?: {
      id: string
      nome: string
      slug: string
      ativo: boolean
      dataInicio?: string | Date
      dataFim?: string | Date
    }
  }
}

