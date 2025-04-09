import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { nome, descricao } = await request.json()

    if (!nome || !descricao) {
      return NextResponse.json({ error: "Nome e descrição são obrigatórios" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Buscar o usuário
    const usuario = await db.collection("usuarios").findOne({
      email: session.user.email,
    })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a loja do usuário
    const loja = await db.collection("lojas").findOne({
      proprietarioId: usuario._id.toString(),
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada. Crie uma loja primeiro." }, { status: 404 })
    }

    // Verificar se já existe uma vitrine para esta loja
    const vitrineExistente = await db.collection("vitrines").findOne({
      lojaId: loja._id.toString(),
    })

    if (vitrineExistente) {
      return NextResponse.json({ error: "Já existe uma vitrine para esta loja" }, { status: 400 })
    }

    // Criar a vitrine
    const vitrine = {
      lojaId: loja._id.toString(),
      usuarioId: usuario._id.toString(),
      nome,
      descricao,
      logo: loja.logo || "",
      banner: loja.banner || "",
      endereco: loja.endereco || {
        rua: "",
        numero: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
      },
      contato: loja.contato || {
        telefone: "",
        email: usuario.email,
        whatsapp: "",
      },
      redesSociais: loja.redesSociais || {},
      categorias: loja.categorias || [],
      produtos: [],
      ativo: true,
      destaque: false,
      dataCriacao: new Date(),
      dataAtualizacao: new Date(),
    }

    const resultado = await db.collection("vitrines").insertOne(vitrine)

    return NextResponse.json({
      success: true,
      message: "Vitrine criada com sucesso",
      vitrineId: resultado.insertedId,
    })
  } catch (error) {
    console.error("Erro ao criar vitrine:", error)
    return NextResponse.json({ error: "Erro ao criar vitrine" }, { status: 500 })
  }
}
