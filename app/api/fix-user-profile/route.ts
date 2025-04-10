import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar se o usuário é admin ou o próprio usuário
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Obter o ID do usuário da query string ou usar o ID do usuário logado
    const url = new URL(req.url)
    const userId = url.searchParams.get("userId") || session.user.id

    // Verificar se o usuário tem permissão para modificar este perfil
    if (userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado a modificar este perfil" }, { status: 403 })
    }

    console.log(`Corrigindo perfil do usuário ${userId}...`)
    const usuario = await Usuario.findById(userId)

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Garantir que o perfil existe
    if (!usuario.perfil) {
      usuario.perfil = {}
      usuario.markModified("perfil")
    }

    // Garantir que as estruturas aninhadas existem
    if (!usuario.perfil.endereco) {
      usuario.perfil.endereco = {}
      usuario.markModified("perfil.endereco")
    }

    if (!usuario.perfil.redesSociais) {
      usuario.perfil.redesSociais = {}
      usuario.markModified("perfil.redesSociais")
    }

    if (!usuario.perfil.preferencias) {
      usuario.perfil.preferencias = {
        notificacoes: true,
        temaEscuro: false,
        idioma: "pt-BR",
      }
      usuario.markModified("perfil.preferencias")
    }

    await usuario.save()

    return NextResponse.json({
      success: true,
      message: "Estrutura do perfil do usuário corrigida com sucesso",
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        perfil: usuario.perfil,
      },
    })
  } catch (error) {
    console.error("Erro ao corrigir perfil do usuário:", error)
    return NextResponse.json({ error: "Erro ao corrigir perfil do usuário" }, { status: 500 })
  }
}
