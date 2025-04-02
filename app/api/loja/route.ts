import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Verificar se a conexão está estabelecida
    const connection = mongoose.connection
    if (!connection || !connection.db) {
      throw new Error("Conexão com o banco de dados não estabelecida")
    }

    // Obter o usuário atual
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
    console.error("Erro ao buscar loja:", error)
    return NextResponse.json({ error: "Erro ao buscar loja" }, { status: 500 })
  }
}

