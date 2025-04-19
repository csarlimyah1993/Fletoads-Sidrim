import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"

export async function POST(request: Request) {
  try {
    // Verificar autenticação e permissões
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
    }

    // Obter dados da requisição
    const { userId, plano } = await request.json()

    if (!userId || !plano) {
      return NextResponse.json({ error: "ID do usuário e plano são obrigatórios" }, { status: 400 })
    }

    // Validar o plano
    const planosValidos = ["gratuito", "basico", "profissional", "empresarial"]
    if (!planosValidos.includes(plano)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Atualizar o plano do usuário
    const usuarioAtualizado = await Usuario.findByIdAndUpdate(userId, { plano }, { new: true })

    if (!usuarioAtualizado) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Registrar a ação (opcional)
    console.log(`Plano do usuário ${userId} atualizado para ${plano} pelo admin ${session.user.id}`)

    return NextResponse.json({
      success: true,
      message: `Plano atualizado com sucesso para ${plano}`,
      usuario: {
        id: usuarioAtualizado._id,
        nome: usuarioAtualizado.nome,
        email: usuarioAtualizado.email,
        plano: usuarioAtualizado.plano,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar plano do usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: (error as Error).message }, { status: 500 })
  }
}

