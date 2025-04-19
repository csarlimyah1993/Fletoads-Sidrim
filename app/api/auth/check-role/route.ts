import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          message: "Not authenticated",
        },
        { status: 401 },
      )
    }

    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        nome: session.user.nome,
        role: session.user.role,
        plano: session.user.plano,
      },
      isAdmin: session.user.role === "admin",
    })
  } catch (error) {
    console.error("Error checking role:", error)
    return NextResponse.json(
      {
        error: "Error checking role",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

