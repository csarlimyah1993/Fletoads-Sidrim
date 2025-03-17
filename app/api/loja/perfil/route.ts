import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"

export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/loja/perfil - Starting request")
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("GET /api/loja/perfil - No session found")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log(`GET /api/loja/perfil - Session found for user: ${session.user.id}`)
    await connectToDatabase()

    // Buscar a loja diretamente pelo proprietarioId
    const loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (!loja) {
      console.log(`GET /api/loja/perfil - No store found for user: ${session.user.id}`)
      return NextResponse.json({})
    }

    console.log(`GET /api/loja/perfil - Store found: ${loja._id}`)
    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao buscar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil da loja" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    console.log("POST /api/loja/perfil - Starting request")
    const session = await getServerSession(authOptions)
    if (!session) {
      console.log("POST /api/loja/perfil - No session found")
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    console.log(`POST /api/loja/perfil - Session found for user: ${session.user.id}`)
    const data = await req.json()
    console.log("POST /api/loja/perfil - Received data:", JSON.stringify(data, null, 2))

    await connectToDatabase()

    // Validar os dados obrigatórios
    if (!data.nome) {
      return NextResponse.json({ error: "Nome da loja é obrigatório" }, { status: 400 })
    }

    if (
      !data.endereco ||
      !data.endereco.rua ||
      !data.endereco.numero ||
      !data.endereco.bairro ||
      !data.endereco.cidade ||
      !data.endereco.estado ||
      !data.endereco.cep
    ) {
      return NextResponse.json({ error: "Todos os campos de endereço são obrigatórios" }, { status: 400 })
    }

    if (!data.contato || !data.contato.telefone || !data.contato.email) {
      return NextResponse.json({ error: "Telefone e email são obrigatórios" }, { status: 400 })
    }

    // Prepare data for MongoDB
    const lojaData = {
      nome: data.nome,
      descricao: data.descricao || "",
      cnpj: data.cnpj || "",
      logo: data.logo || "",
      banner: data.banner || "",
      endereco: {
        rua: data.endereco.rua || "",
        numero: data.endereco.numero || "",
        complemento: data.endereco.complemento || "",
        bairro: data.endereco.bairro || "",
        cidade: data.endereco.cidade || "",
        estado: data.endereco.estado || "",
        cep: data.endereco.cep || "",
      },
      contato: {
        telefone: data.contato.telefone || "",
        email: data.contato.email || "",
        whatsapp: data.contato.whatsapp || "",
        instagram: data.contato.instagram || "",
        facebook: data.contato.facebook || "",
        site: data.contato.site || "",
      },
      categorias: data.categorias || [],
      status: "ativo", // Set status to active by default
    }

    // Buscar a loja existente
    let loja = await Loja.findOne({ proprietarioId: session.user.id })

    if (loja) {
      console.log(`POST /api/loja/perfil - Updating existing store: ${loja._id}`)
      // Atualizar a loja existente
      Object.assign(loja, lojaData)
      await loja.save()
    } else {
      console.log(`POST /api/loja/perfil - Creating new store for user: ${session.user.id}`)
      // Criar uma nova loja
      loja = new Loja({
        proprietarioId: session.user.id,
        ...lojaData,
      })
      await loja.save()
    }

    console.log(`POST /api/loja/perfil - Store saved successfully: ${loja._id}`)
    return NextResponse.json(loja)
  } catch (error) {
    console.error("Erro ao salvar perfil da loja:", error)
    return NextResponse.json({ error: `Erro ao salvar perfil da loja: ${error.message}` }, { status: 500 })
  }
}

