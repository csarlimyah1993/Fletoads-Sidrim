import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user profile
    const user = await Usuario.findById(session.user.id)

    // Mock integrations data
    const integrations = [
      {
        id: "1",
        name: "WhatsApp",
        status: "active",
        lastSync: new Date().toISOString(),
      },
      {
        id: "2",
        name: "Instagram",
        status: "inactive",
        lastSync: null,
      },
    ]

    return NextResponse.json({ success: true, integrations })
  } catch (error) {
    console.error("Error getting active integrations:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
