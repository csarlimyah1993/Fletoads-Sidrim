import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import Produto from "@/lib/models/produto"
import Panfleto from "@/lib/models/panfleto"
import Cliente from "@/lib/models/cliente"
import Campanha from "@/lib/models/campanha"

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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Verificar autenticação e permissões
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    if (session.user.role !== "admin") {
      return NextResponse.json({ error: "Permissão negada" }, { status: 403 })
    }

    const userId = params.id

    if (!userId) {
      return NextResponse.json({ error: "ID do usuário é obrigatório" }, { status: 400 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Buscar usuário
    const usuario = await Usuario.findById(userId).select("_id nome email plano")

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Obter plano do usuário ou definir como gratuito
    const planoUsuario = usuario.plano || "gratuito"

    // Usar os limites predefinidos
    const planoLimites = limites[planoUsuario as keyof typeof limites] || limites.gratuito

    // Contar recursos utilizados
    const produtosCount = await Produto.countDocuments({ userId })
    const panfletosCount = await Panfleto.countDocuments({ userId })
    const clientesCount = await Cliente.countDocuments({ userId })
    const campanhasCount = await Campanha.countDocuments({ userId })

    // Verificar se os limites foram atingidos
    const limitReached = {
      produtos: planoLimites.vitrine !== -1 && produtosCount >= planoLimites.vitrine,
      panfletos: planoLimites.panfletos !== -1 && panfletosCount >= planoLimites.panfletos,
      clientes: planoLimites.clientes !== -1 && clientesCount >= planoLimites.clientes,
      campanhas: planoLimites.campanhas !== -1 && campanhasCount >= planoLimites.campanhas,
    }

    // Construir resposta
    const response = {
      usuario: {
        _id: usuario._id,
        nome: usuario.nome,
        email: usuario.email,
        plano: planoUsuario,
      },
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
      limitReached,
      planoDetalhes: {
        preco: planoLimites.preco,
        popular: planoLimites.popular,
        whatsapp: planoLimites.whatsapp,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Erro ao buscar métricas do usuário:", error)
    return NextResponse.json({ error: "Erro interno do servidor", message: (error as Error).message }, { status: 500 })
  }
}
