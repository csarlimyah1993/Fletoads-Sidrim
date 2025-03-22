import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    try {
      const { db } = await connectToDatabase()

      // Tentar diferentes formatos de ID
      let usuario = null

      // Tentar com o ID como string, mas evitando usar _id diretamente
      usuario = await db.collection("usuarios").findOne({
        $or: [{ email: session.user.email }, { username: userId }],
      })

      // Se não encontrou, tentar com ObjectId
      if (!usuario) {
        try {
          const objectId = new ObjectId(userId)
          usuario = await db.collection("usuarios").findOne({
            $or: [{ _id: objectId }, { email: session.user.email }],
          })
        } catch (error) {
          console.log("Erro ao converter para ObjectId:", error)
        }
      }

      if (!usuario) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
      }

      // Remover campos sensíveis
      if (usuario.password) {
        delete usuario.password
      }
      if (usuario.senha) {
        delete usuario.senha
      }

      // Converter o ObjectId para string
      return NextResponse.json({
        ...usuario,
        _id: usuario._id.toString(),
      })
    } catch (dbError) {
      console.error("Erro ao buscar perfil do usuário no banco de dados:", dbError)

      // Retornar um perfil básico com os dados da sessão para evitar quebrar a UI
      return NextResponse.json({
        _id: userId,
        nome: session.user.name || "Usuário",
        email: session.user.email,
        error: "Erro temporário ao acessar o banco de dados. Tente novamente mais tarde.",
        isTemporaryProfile: true,
      })
    }
  } catch (error) {
    console.error("Erro ao buscar perfil do usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

