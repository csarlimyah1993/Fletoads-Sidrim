import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter userId da query ou do session
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId") || session.user.id

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Falha ao conectar ao banco de dados")
    }

    // Verificar se a coleção usuarios existe
    const collections = await db.listCollections({ name: "usuarios" }).toArray()

    // Se a coleção não existir, criar e retornar plano padrão
    if (collections.length === 0) {
      await db.createCollection("usuarios")
      return NextResponse.json({
        plano: "gratuito",
        limites: {
          panfletos: 5,
          clientes: 50,
          campanhas: 2,
        },
        utilizacao: {
          panfletos: 0,
          clientes: 0,
          campanhas: 0,
        },
      })
    }

    // Buscar usuário
    let usuario
    try {
      // Tentar buscar por ID
      if (ObjectId.isValid(userId)) {
        usuario = await db.collection("usuarios").findOne({
          _id: new ObjectId(userId),
        })
      }
    } catch (error) {
      // Se falhar, tentar com outras formas de identificação
      usuario = await db.collection("usuarios").findOne({
        $or: [{ email: userId }, { username: userId }],
      })
    }

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Definir limites baseados no plano
    const limites = {
      gratuito: {
        panfletos: 5,
        clientes: 50,
        campanhas: 2,
      },
      basico: {
        panfletos: 20,
        clientes: 200,
        campanhas: 5,
      },
      profissional: {
        panfletos: 100,
        clientes: 1000,
        campanhas: 20,
      },
      empresarial: {
        panfletos: -1, // ilimitado
        clientes: -1, // ilimitado
        campanhas: -1, // ilimitado
      },
    }

    // Obter plano do usuário ou definir como gratuito
    const planoUsuario = usuario.plano || "gratuito"

    // Contar recursos utilizados
    const panfletosCount = await db.collection("panfletos").countDocuments({ userId })
    const clientesCount = await db.collection("clientes").countDocuments({ userId })
    const campanhasCount = await db.collection("campanhas").countDocuments({ userId })

    return NextResponse.json({
      plano: planoUsuario,
      limites: limites[planoUsuario as keyof typeof limites],
      utilizacao: {
        panfletos: panfletosCount,
        clientes: clientesCount,
        campanhas: campanhasCount,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar informações do plano:", error)

    // Retornar plano padrão em caso de erro
    return NextResponse.json({
      plano: "gratuito",
      limites: {
        panfletos: 5,
        clientes: 50,
        campanhas: 2,
      },
      utilizacao: {
        panfletos: 0,
        clientes: 0,
        campanhas: 0,
      },
    })
  }
}

