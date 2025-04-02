import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Vitrine from "@/lib/models/vitrine"
import Loja from "@/lib/models/loja"
import Usuario from "@/lib/models/usuario"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    await connectToDatabase()

    // Buscar o usuário
    const usuario = await Usuario.findById(session.user.id)
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário já tem uma loja
    let lojaId = null
    if (usuario.lojaId) {
      const loja = await Loja.findById(usuario.lojaId)
      if (loja) {
        lojaId = loja._id
      }
    }

    // Criar a vitrine
    const vitrine = new Vitrine({
      ...data,
      usuarioId: usuario._id,
      lojaId: lojaId,
    })

    await vitrine.save()

    return NextResponse.json(vitrine)
  } catch (error) {
    console.error("Erro ao criar vitrine:", error)
    return NextResponse.json({ error: "Erro ao criar vitrine" }, { status: 500 })
  }
}

