import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import Loja from "@/lib/models/loja"
import { connectToDatabase } from "@/lib/mongodb"

// Rota para obter o perfil da loja do usuário logado
export async function GET(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao buscar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil da loja" }, { status: 500 })
  }
}

// Rota para atualizar o perfil da loja
export async function PUT(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const dadosAtualizacao = await req.json()
    console.log("Dados recebidos para atualização:", JSON.stringify(dadosAtualizacao, null, 2))

    let loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      // Se a loja não existir, criar uma nova
      console.log("Criando nova loja para o usuário:", session.user.id)
      loja = new Loja({
        ...dadosAtualizacao,
        proprietarioId: session.user.id,
      })
      await loja.save()
    } else {
      // Atualizar a loja existente
      console.log("Atualizando loja existente:", loja._id)
      loja = await Loja.findByIdAndUpdate(loja._id, { $set: dadosAtualizacao }, { new: true, runValidators: true })
    }

    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao atualizar perfil da loja:", error)
    // Retornar mensagem de erro mais detalhada
    return NextResponse.json(
      {
        error: "Erro ao atualizar perfil da loja",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        details: error,
      },
      { status: 500 },
    )
  }
}

// Rota para criar ou atualizar o perfil da loja (POST)
export async function POST(req: NextRequest) {
  try {
    // Garantir que estamos conectados ao banco de dados
    await connectToDatabase()

    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const dadosLoja = await req.json()
    console.log("Dados recebidos via POST:", JSON.stringify(dadosLoja, null, 2))

    let loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      // Se a loja não existir, criar uma nova
      console.log("Criando nova loja para o usuário:", session.user.id)
      loja = new Loja({
        ...dadosLoja,
        proprietarioId: session.user.id,
      })
    } else {
      // Atualizar a loja existente
      console.log("Atualizando loja existente:", loja._id)
      Object.assign(loja, dadosLoja)
    }

    await loja.save()
    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao salvar perfil da loja:", error)
    // Retornar mensagem de erro mais detalhada
    return NextResponse.json(
      {
        error: "Erro ao salvar perfil da loja",
        message: error instanceof Error ? error.message : "Erro desconhecido",
        details: error,
      },
      { status: 500 },
    )
  }
}

