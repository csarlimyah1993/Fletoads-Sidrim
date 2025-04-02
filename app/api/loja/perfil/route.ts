import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const data = await request.json()

    // Conectar ao banco de dados
    await connectToDatabase()

    // Obter o usuário atual
    const connection = mongoose.connection
    if (!connection || !connection.db) {
      throw new Error("Conexão com o banco de dados não estabelecida")
    }

    const db = connection.db
    const usuariosCollection = db.collection("usuarios")
    const usuario = await usuariosCollection.findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se a loja já existe
    const lojasCollection = db.collection("lojas")
    const userId = usuario._id.toString()

    const lojaExistente = await lojasCollection.findOne({
      $or: [
        { usuarioId: userId },
        { usuarioId: new mongoose.Types.ObjectId(userId) },
        { proprietarioId: userId },
        { proprietarioId: new mongoose.Types.ObjectId(userId) },
      ],
    })

    // Preparar os dados da loja
    const lojaData: {
      nome: any
      descricao: any
      endereco: any
      contato: {
        telefone: any
        email: any
        whatsapp?: any
      }
      website?: any
      logo: any
      banner: any
      horarioFuncionamento: any
      redesSociais: any
      usuarioId: mongoose.Types.ObjectId
      proprietarioId: mongoose.Types.ObjectId
      dataAtualizacao: Date
      dataCriacao?: Date
      ativo?: boolean
    } = {
      nome: data.nome,
      descricao: data.descricao,
      endereco: data.endereco || {},
      contato: {
        telefone: data.telefone || data.contato?.telefone || "",
        email: data.email || data.contato?.email || "",
        whatsapp: data.whatsapp || data.contato?.whatsapp || "",
      },
      logo: data.logo || data.logoUrl || "",
      banner: data.banner || data.bannerUrl || "",
      horarioFuncionamento: data.horarioFuncionamento || {},
      redesSociais: data.redesSociais || {},
      usuarioId: new mongoose.Types.ObjectId(userId),
      proprietarioId: new mongoose.Types.ObjectId(userId),
      dataAtualizacao: new Date(),
    }

    let resultado

    if (lojaExistente) {
      // Atualizar loja existente
      resultado = await lojasCollection.updateOne({ _id: lojaExistente._id }, { $set: lojaData })

      return NextResponse.json({
        success: true,
        message: "Loja atualizada com sucesso",
        loja: { ...lojaData, _id: lojaExistente._id },
      })
    } else {
      // Criar nova loja
      lojaData.dataCriacao = new Date()
      lojaData.ativo = true

      resultado = await lojasCollection.insertOne(lojaData)

      return NextResponse.json({
        success: true,
        message: "Loja criada com sucesso",
        loja: { ...lojaData, _id: resultado.insertedId },
      })
    }
  } catch (error) {
    console.error("Erro ao salvar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao salvar perfil da loja" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Obter o usuário atual
    const connection = mongoose.connection
    if (!connection || !connection.db) {
      throw new Error("Conexão com o banco de dados não estabelecida")
    }

    const db = connection.db
    const usuariosCollection = db.collection("usuarios")
    const usuario = await usuariosCollection.findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Buscar a loja do usuário
    const lojasCollection = db.collection("lojas")
    const userId = usuario._id.toString()

    const loja = await lojasCollection.findOne({
      $or: [
        { usuarioId: userId },
        { usuarioId: new mongoose.Types.ObjectId(userId) },
        { proprietarioId: userId },
        { proprietarioId: new mongoose.Types.ObjectId(userId) },
      ],
    })

    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Converter o ObjectId para string antes de retornar
    const lojaSerializada = JSON.parse(
      JSON.stringify(loja, (key, value) => {
        if (key === "_id" && value && typeof value === "object" && value.toString) {
          return value.toString()
        }
        if (value instanceof Date) {
          return value.toISOString()
        }
        return value
      }),
    )

    return NextResponse.json({
      success: true,
      loja: lojaSerializada,
    })
  } catch (error) {
    console.error("Erro ao buscar perfil da loja:", error)
    return NextResponse.json({ error: "Erro ao buscar perfil da loja" }, { status: 500 })
  }
}

