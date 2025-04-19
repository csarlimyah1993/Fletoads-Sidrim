import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

// Define a type for the session user with lojaId
interface SessionUser {
  id: string
  name?: string | null
  email?: string | null
  image?: string | null
  role: string
  nome?: string
  emailVerificado?: boolean
  plano?: string
  lojaId?: string
  permissoes?: string[]
  twoFactorEnabled?: boolean
  twoFactorMethod?: "email" | "app"
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    // Verificar autenticação
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { codigo, valorTotal, produtosIds = [] } = body

    if (!codigo) {
      return NextResponse.json({ error: "Código do cupom não fornecido" }, { status: 400 })
    }

    const { db } = await connectToDatabase()

    // Use type assertion to access lojaId
    const user = session.user as SessionUser

    // Buscar cupom pelo código
    const cupom = await db.collection("cupons").findOne({
      codigo: codigo,
      lojaId: user.lojaId,
      ativo: true,
    })

    if (!cupom) {
      return NextResponse.json({ error: "Cupom não encontrado ou inativo" }, { status: 404 })
    }

    // Verificar se o cupom está dentro do período de validade
    const agora = new Date()
    const dataInicio = new Date(cupom.dataInicio)
    const dataExpiracao = new Date(cupom.dataExpiracao)

    if (agora < dataInicio || agora > dataExpiracao) {
      return NextResponse.json({ error: "Cupom fora do período de validade" }, { status: 400 })
    }

    // Verificar se o cupom atingiu o limite de usos
    if (cupom.limiteTotalUsos && cupom.usos >= cupom.limiteTotalUsos) {
      return NextResponse.json({ error: "Cupom atingiu o limite de usos" }, { status: 400 })
    }

    // Verificar se o usuário já utilizou o cupom mais vezes do que o permitido
    if (cupom.limitePorUsuario) {
      const usosDoUsuario = await db.collection("usos_cupom").countDocuments({
        cupomId: cupom._id.toString(),
        usuarioId: session.user.id,
      })

      if (usosDoUsuario >= cupom.limitePorUsuario) {
        return NextResponse.json({ error: "Você já atingiu o limite de usos para este cupom" }, { status: 400 })
      }
    }

    // Verificar valor mínimo do pedido
    if (cupom.valorMinimo && valorTotal < cupom.valorMinimo) {
      return NextResponse.json(
        {
          error: `O valor mínimo para este cupom é de R$ ${cupom.valorMinimo.toFixed(2)}`,
          valorMinimo: cupom.valorMinimo,
        },
        { status: 400 },
      )
    }

    // Verificar se o cupom é específico para produtos
    if (cupom.produtos && cupom.produtos.length > 0) {
      const produtosCompatíveis = produtosIds.some((id: string) => cupom.produtos.includes(id))
      if (!produtosCompatíveis) {
        return NextResponse.json({ error: "Este cupom não é válido para os produtos selecionados" }, { status: 400 })
      }
    }

    // Verificar se o cupom é específico para usuários
    if (cupom.usuariosEspecificos && cupom.usuariosEspecificos.length > 0) {
      if (!cupom.usuariosEspecificos.includes(session.user.id)) {
        return NextResponse.json({ error: "Este cupom não é válido para o seu usuário" }, { status: 400 })
      }
    }

    // Calcular o valor do desconto
    let valorDesconto = 0
    if (cupom.tipo === "percentual") {
      valorDesconto = (valorTotal * cupom.valor) / 100
    } else if (cupom.tipo === "valor_fixo") {
      valorDesconto = cupom.valor
      // Garantir que o desconto não seja maior que o valor total
      if (valorDesconto > valorTotal) {
        valorDesconto = valorTotal
      }
    } else if (cupom.tipo === "frete_gratis") {
      // Para cupons de frete grátis, o valor do desconto é 0
      // O cliente deve tratar este tipo de cupom de forma especial
      valorDesconto = 0
    }

    return NextResponse.json({
      valido: true,
      cupom: {
        _id: cupom._id,
        codigo: cupom.codigo,
        tipo: cupom.tipo,
        valor: cupom.valor,
        descricao: cupom.descricao,
      },
      valorDesconto,
    })
  } catch (error) {
    console.error("Erro ao validar cupom:", error)
    return NextResponse.json({ error: "Erro ao processar a solicitação" }, { status: 500 })
  }
}
