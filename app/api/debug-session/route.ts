import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No session found",
      })
    }

    return NextResponse.json({
      authenticated: true,
      session: {
        user: {
          id: session.user?.id,
          email: session.user?.email,
          name: session.user?.name,
          role: session.user?.role,
          nome: session.user?.nome,
          cargo: session.user?.cargo,
          plano: session.user?.plano,
          // Don't return permissions array for security
          hasPermissions: Array.isArray(session.user?.permissoes) && session.user?.permissoes.length > 0,
        },
        expires: session.expires,
      },
    })
  } catch (error) {
    console.error("Error in debug-session route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
