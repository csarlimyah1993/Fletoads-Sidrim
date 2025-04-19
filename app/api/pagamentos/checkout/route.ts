import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import Loja from "@/lib/models/loja"
import Produto from "@/lib/models/produto"
import { criarSessaoCheckout } from "@/lib/stripe"

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase()

    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const usuario = await Usuario.findById(session.user.id)
    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem um ID de cliente Stripe
    if (!usuario.pagamento?.stripeCustomerId) {
      return NextResponse.json({ error: "Usuário não possui um perfil de pagamento" }, { status: 400 })
    }

    const body = await req.json()
    const { itens, lojaId } = body

    if (!itens || !Array.isArray(itens) || itens.length === 0) {
      return NextResponse.json({ error: "Itens inválidos" }, { status: 400 })
    }

    // Buscar a loja
    const loja = await Loja.findById(lojaId)
    if (!loja) {
      return NextResponse.json({ error: "Loja não encontrada" }, { status: 404 })
    }

    // Verificar se a loja aceita pagamentos online
    if (!loja.configuracoes?.pagamento?.aceitaCartao) {
      return NextResponse.json({ error: "Esta loja não aceita pagamentos online" }, { status: 400 })
    }

    // Buscar informações dos produtos
    const produtosIds = itens.map((item) => item.produtoId)

    const produtos = await Produto.find({ _id: { $in: produtosIds } })

    // Verificar se todos os produtos existem e pertencem à loja
    const produtosMap = new Map(produtos.map((p) => [p._id.toString(), p]))

    const itensProcessados = []

    for (const item of itens) {
      const produto = produtosMap.get(item.produtoId)

      if (!produto) {
        return NextResponse.json({ error: `Produto ${item.produtoId} não encontrado` }, { status: 404 })
      }

      if (produto.lojaId.toString() !== lojaId) {
        return NextResponse.json({ error: `Produto ${item.produtoId} não pertence à loja informada` }, { status: 400 })
      }

      // Verificar estoque
      if (produto.estoque < item.quantidade) {
        return NextResponse.json(
          {
            error: `Produto ${produto.nome} não possui estoque suficiente`,
          },
          { status: 400 },
        )
      }

      // Usar preço promocional se disponível
      const preco = produto.precoPromocional || produto.preco

      itensProcessados.push({
        preco,
        nome: produto.nome,
        quantidade: item.quantidade,
        imagemUrl: produto.imagens && produto.imagens.length > 0 ? produto.imagens[0] : undefined,
      })
    }

    // URLs de sucesso e cancelamento
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `https://${process.env.VERCEL_URL}` || "http://localhost:3000"
    const successUrl = `${baseUrl}/pagamento/sucesso?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${baseUrl}/pagamento/cancelado`

    // Metadados para rastreamento
    const metadata = {
      usuarioId: session.user.id,
      lojaId,
      itens: JSON.stringify(
        itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
        })),
      ),
    }

    // Criar sessão de checkout
    const checkoutSession = await criarSessaoCheckout(
      usuario.pagamento.stripeCustomerId,
      itensProcessados,
      successUrl,
      cancelUrl,
      metadata,
    )

    return NextResponse.json({
      success: true,
      url: checkoutSession.url,
    })
  } catch (error) {
    console.error("Erro ao criar sessão de checkout:", error)
    return NextResponse.json({ error: "Erro ao processar pagamento" }, { status: 500 })
  }
}

