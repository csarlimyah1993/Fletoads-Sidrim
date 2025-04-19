import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"

// Define a more complete type for the session user
interface ExtendedUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  nome?: string
  cargo?: string
  plano?: string
  permissoes?: string[]
  emailVerificado?: boolean
  lojaId?: string
  twoFactorEnabled?: boolean
  twoFactorMethod?: "email" | "app"
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No session found",
      })
    }

    // Use type assertion to tell TypeScript that session.user has the ExtendedUser type
    const user = session.user as unknown as ExtendedUser

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          nome: user.nome,
          cargo: user.cargo,
          plano: user.plano,
          // Don't return permissions array for security
          hasPermissions: Array.isArray(user.permissoes) && user.permissoes.length > 0,
        },
        expires: session.expires,
      },
    })
  } catch (error) {
    console.error("Error in debug-session route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
