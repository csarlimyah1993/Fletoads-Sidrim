import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { getPlanoDoUsuario } from "@/lib/planos"
import { ObjectId, type Document } from "mongodb"

interface Loja extends Document {
  _id: ObjectId
  nome: string
  usuarioId: string | ObjectId
  userId?: string | ObjectId
  [key: string]: any
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { db } = await connectToDatabase()

    // Buscar o usuário para obter o ID do plano
    let usuario = null
    let userObjectId: ObjectId | null = null

    try {
      // Tentar com ObjectId
      userObjectId = new ObjectId(userId)
      usuario = await db.collection("usuarios").findOne({ _id: userObjectId })
    } catch (error) {
      // Se falhar, tentar com outras formas de identificação
      usuario = await db.collection("usuarios").findOne({
        $or: [{ email: userId }, { username: userId }],
      })
    }

    if (!usuario) {
      console.log("Usuário não encontrado com ID:", userId)
      // Retornar plano gratuito como fallback
      const planoGratis = getPlanoDoUsuario("gratis")
      return NextResponse.json({
        planoId: "gratis",
        planoNome: "Grátis",
        isFreeTier: true,
        limitReached: false,
        uso: {
          produtos: {
            usado: 0,
            total: planoGratis.vitrine,
          },
          panfletos: {
            usado: 0,
            total: planoGratis.panfletos,
          },
          imagensPorProduto: planoGratis.imagensPorProduto,
        },
        planoDetalhes: planoGratis,
      })
    }

    // Obter o ID do plano do usuário
    const planoId = usuario.plano || usuario.metodosPagemento?.plano || "gratis"

    // Obter os detalhes do plano
    const planoDetalhes = getPlanoDoUsuario(planoId)

    // Calcular uso atual
    const lojas: Loja[] = (await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()) as Loja[]

    const loja = lojas[0] || null

    // Contar produtos na vitrine
    let produtosCount = 0
    if (loja) {
      try {
        produtosCount = await db.collection("produtos").countDocuments({
          lojaId: loja._id.toString(),
        })
      } catch (error) {
        console.error("Erro ao contar produtos:", error)
      }
    }

    // Contar panfletos
    let panfletosCount = 0
    if (loja) {
      try {
        panfletosCount = await db.collection("panfletos").countDocuments({
          lojaId: loja._id.toString(),
        })
      } catch (error) {
        console.error("Erro ao contar panfletos:", error)
      }
    }

    return NextResponse.json({
      planoId,
      planoNome: planoDetalhes.nome,
      isFreeTier: planoId === "gratis",
      limitReached: {
        produtos: produtosCount >= planoDetalhes.vitrine,
        panfletos: panfletosCount >= planoDetalhes.panfletos,
      },
      uso: {
        produtos: {
          usado: produtosCount,
          total: planoDetalhes.vitrine,
        },
        panfletos: {
          usado: panfletosCount,
          total: planoDetalhes.panfletos,
        },
        imagensPorProduto: planoDetalhes.imagensPorProduto,
      },
      planoDetalhes,
    })
  } catch (error) {
    console.error("Erro ao buscar informações do plano:", error)

    // Retornar plano gratuito como fallback
    const planoGratis = getPlanoDoUsuario("gratis")

    return NextResponse.json({
      planoId: "gratis",
      planoNome: "Grátis",
      isFreeTier: true,
      limitReached: false,
      uso: {
        produtos: {
          usado: 0,
          total: planoGratis.vitrine,
        },
        panfletos: {
          usado: 0,
          total: planoGratis.panfletos,
        },
        imagensPorProduto: planoGratis.imagensPorProduto,
      },
      planoDetalhes: planoGratis,
    })
  }
}

