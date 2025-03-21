import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Loja } from "@/lib/models/loja"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()

    const loja = await Loja.findOne({ usuarioId: session.user.id })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao buscar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil da loja" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await req.json()

    await connectToDatabase()

    // Verificar se a loja já existe
    let loja = await Loja.findOne({ usuarioId: session.user.id })

    if (loja) {
      // Atualizar loja existente
      loja = await Loja.findOneAndUpdate(
        { usuarioId: session.user.id },
        {
          $set: {
            nome: data.nome,
            descricao: data.descricao,
            logo: data.logo,
            banner: data.banner,
            endereco: data.endereco,
            telefone: data.telefone,
            email: data.email,
            website: data.website,
            horarioFuncionamento: data.horarioFuncionamento,
            dataFundacao: data.dataFundacao,
            numeroFuncionarios: data.numeroFuncionarios,
            tags: data.tags,
            redesSociais: data.redesSociais,
          },
        },
        { new: true },
      )
    } else {
      // Criar nova loja
      loja = await Loja.create({
        usuarioId: session.user.id,
        nome: data.nome,
        descricao: data.descricao,
        logo: data.logo,
        banner: data.banner,
        endereco: data.endereco,
        telefone: data.telefone,
        email: data.email,
        website: data.website,
        horarioFuncionamento: data.horarioFuncionamento,
        dataFundacao: data.dataFundacao,
        numeroFuncionarios: data.numeroFuncionarios,
        tags: data.tags,
        redesSociais: data.redesSociais,
      })
    }

    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao salvar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao salvar perfil da loja" }, { status: 500 })
  }
}

