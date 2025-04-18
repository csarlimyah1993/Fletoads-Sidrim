import type { Session } from "next-auth"

// Extended session user type with all properties
export interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  nome?: string
  emailVerificado?: boolean
  plano?: string
  lojaId?: string
  permissoes?: string[]
  twoFactorEnabled?: boolean
  twoFactorMethod?: "email" | "app"
}

// Helper function to get typed session user
export function getSessionUser(session: Session | null): SessionUser | null {
  if (!session || !session.user) {
    return null
  }

  return session.user as SessionUser
}
