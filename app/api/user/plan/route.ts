import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb" // Corrigido: mudado de @/lib/db para @/lib/mongodb
import { ObjectId } from "mongodb"

// Define plan limits
const limites = {
  gratuito: {
    panfletos: 5,
    clientes: 50,
    campanhas: 2,
    vitrine: 10,
    imagensPorProduto: 1,
    whatsapp: 0,
    preco: 0,
    popular: false,
  },
  basico: {
    panfletos: 20,
    clientes: 200,
    campanhas: 5,
    vitrine: 30,
    imagensPorProduto: 3,
    whatsapp: 1,
    preco: 49.9,
    popular: true,
  },
  profissional: {
    panfletos: 100,
    clientes: 1000,
    campanhas: 20,
    vitrine: 100,
    imagensPorProduto: 5,
    whatsapp: 2,
    preco: 99.9,
    popular: false,
  },
  empresarial: {
    panfletos: -1, // ilimitado
    clientes: -1, // ilimitado
    campanhas: -1, // ilimitado
    vitrine: -1, // ilimitado
    imagensPorProduto: 10,
    whatsapp: 5,
    preco: 199.9,
    popular: false,
  },
}

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

    // Obter plano do usuário ou definir como gratuito
    let planoUsuario = "gratuito"
    let planoDetalhes = null

    // Se o usuário tem um plano definido
    if (usuario.plano) {
      // Se o plano é um ID, buscar detalhes do plano
      if (ObjectId.isValid(usuario.plano)) {
        try {
          const planoDB = await db.collection("planos").findOne({
            _id: new ObjectId(usuario.plano),
          })

          if (planoDB) {
            planoUsuario = planoDB.nome || "gratuito"
            planoDetalhes = planoDB
          }
        } catch (error) {
          console.error("Erro ao buscar plano:", error)
        }
      } else {
        // Se o plano é uma string (nome do plano)
        planoUsuario = usuario.plano
      }
    }

    // Usar os limites predefinidos ou do plano do banco de dados
    const planoLimites = planoDetalhes?.limites || limites[planoUsuario as keyof typeof limites] || limites.gratuito

    // Contar recursos utilizados
    const panfletosCount = await db.collection("panfletos").countDocuments({ userId })
    const clientesCount = await db.collection("clientes").countDocuments({ userId })
    const campanhasCount = await db.collection("campanhas").countDocuments({ userId })
    const produtosCount = await db.collection("produtos").countDocuments({ userId })

    // Verificar se os limites foram atingidos
    const limitReached = {
      panfletos: planoLimites.panfletos !== -1 && panfletosCount >= planoLimites.panfletos,
      clientes: planoLimites.clientes !== -1 && clientesCount >= planoLimites.clientes,
      campanhas: planoLimites.campanhas !== -1 && campanhasCount >= planoLimites.campanhas,
      produtos: planoLimites.vitrine !== -1 && produtosCount >= planoLimites.vitrine,
    }

    // Construir resposta
    const response = {
      planoId: usuario.plano || "gratuito",
      planoNome: planoUsuario,
      isFreeTier: planoUsuario === "gratuito",
      limitReached,
      uso: {
        produtos: {
          usado: produtosCount,
          total: planoLimites.vitrine === -1 ? "Ilimitado" : planoLimites.vitrine,
        },
        panfletos: {
          usado: panfletosCount,
          total: planoLimites.panfletos === -1 ? "Ilimitado" : planoLimites.panfletos,
        },
        clientes: {
          usado: clientesCount,
          total: planoLimites.clientes === -1 ? "Ilimitado" : planoLimites.clientes,
        },
        campanhas: {
          usado: campanhasCount,
          total: planoLimites.campanhas === -1 ? "Ilimitado" : planoLimites.campanhas,
        },
        imagensPorProduto: planoLimites.imagensPorProduto,
      },
      planoDetalhes: {
        preco: planoLimites.preco,
        popular: planoLimites.popular,
        whatsapp: planoLimites.whatsapp,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao buscar informações do plano:", error)

    // Retornar plano padrão em caso de erro
    return NextResponse.json({
      planoId: "gratuito",
      planoNome: "Grátis",
      isFreeTier: true,
      limitReached: false,
      uso: {
        produtos: { usado: 0, total: limites.gratuito.vitrine },
        panfletos: { usado: 0, total: limites.gratuito.panfletos },
        clientes: { usado: 0, total: limites.gratuito.clientes },
        campanhas: { usado: 0, total: limites.gratuito.campanhas },
        imagensPorProduto: limites.gratuito.imagensPorProduto,
      },
      planoDetalhes: {
        preco: limites.gratuito.preco,
        popular: limites.gratuito.popular,
        whatsapp: limites.gratuito.whatsapp,
      },
    })
  }
}
