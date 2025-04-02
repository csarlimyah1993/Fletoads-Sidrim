import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import Usuario from "@/lib/models/usuario"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    // Buscar loja pelo ID do usuário
    const usuarioId = session.user.id

    // Usar o modelo Loja diretamente
    const loja = await Loja.findOne({ usuarioId })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    return NextResponse.json({ loja })
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()
    const usuarioId = session.user.id

    await connectToDatabase()

    // Verificar se o usuário existe
    const usuario = await Usuario.findById(usuarioId)
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se já existe uma loja para este usuário
    let loja = await Loja.findOne({ usuarioId })

    if (loja) {
      // Atualizar loja existente
      Object.assign(loja, {
        ...data,
        dataAtualizacao: new Date(),
      })
      await loja.save()
    } else {
      // Criar nova loja
      loja = new Loja({
        ...data,
        usuarioId,
        ativo: true,
        dataCriacao: new Date(),
        dataAtualizacao: new Date(),
      })
      await loja.save()

      // Atualizar o usuário com o ID da loja
      usuario.lojaId = loja._id
      await usuario.save()
    }

    return NextResponse.json({ loja })
  } catch (error) {
    console.error("Erro ao salvar loja:", error)
    return NextResponse.json({ error: "Erro ao salvar loja" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const usuarioId = session.user.id

    await connectToDatabase()

    // Usar o modelo Loja diretamente
    const loja = await Loja.findOneAndDelete({ usuarioId })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Atualizar o usuário para remover a referência à loja
    await Usuario.findByIdAndUpdate(usuarioId, { $unset: { lojaId: 1 } })

    return NextResponse.json({ message: "Loja excluída com sucesso" })
  } catch (error) {
    console.error("Erro ao excluir loja:", error)
    return NextResponse.json({ error: "Erro ao excluir loja" }, { status: 500 })
  }
}

