import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the user profile
    const user = await Usuario.findById(session.user.id)

    // Mock vitrine configurations
    const configuracoes = {
      id: id,
      nome: "Minha Vitrine",
      descricao: "Descrição da minha vitrine",
      logo: "https://example.com/logo.png",
      banner: "https://example.com/banner.png",
      corPrimaria: "#4F46E5",
      corSecundaria: "#10B981",
      mostrarRedesSociais: true,
      instagram: "@minhaloja",
      facebook: "facebook.com/minhaloja",
      whatsapp: "+5511999999999",
    }

    return NextResponse.json({ success: true, configuracoes })
  } catch (error) {
    console.error("Error getting vitrine configurations:", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
