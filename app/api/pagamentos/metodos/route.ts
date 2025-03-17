import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Usuario from "@/lib/models/usuario"
import { connectToDatabase } from "@/lib/mongodb"
import { stripe } from "@/lib/stripe"

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    await connectToDatabase()
    const usuario = await Usuario.findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Obter métodos de pagamento do Stripe
    const paymentMethods = await stripe.paymentMethods.list({
      customer: usuario.stripeCustomerId,
      type: "card",
    })

    // Obter PIX cadastrados
    const pixKeys = usuario.metodosPagemento?.pix || []

    return NextResponse.json({
      cartoes: paymentMethods.data,
      pix: pixKeys,
    })
  } catch (error) {
    console.error("Erro ao buscar métodos de pagamento:", error)
    return NextResponse.json({ error: "Erro ao buscar métodos de pagamento" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { tipo, dados } = await req.json()

    await connectToDatabase()
    const usuario = await Usuario.findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // Verificar se o usuário tem um ID de cliente no Stripe
    if (!usuario.stripeCustomerId && tipo === "cartao") {
      // Criar cliente no Stripe
      const customer = await stripe.customers.create({
        email: usuario.email,
        name: usuario.nome,
      })

      usuario.stripeCustomerId = customer.id
      await usuario.save()
    }

    if (tipo === "cartao") {
      // Adicionar cartão
      const { paymentMethod } = await stripe.setupIntents.create({
        customer: usuario.stripeCustomerId,
        payment_method: dados.paymentMethodId,
        confirm: true,
      })

      return NextResponse.json({
        success: true,
        message: "Cartão adicionado com sucesso",
        paymentMethod,
      })
    } else if (tipo === "pix") {
      // Adicionar chave PIX
      if (!usuario.metodosPagemento) {
        usuario.metodosPagemento = { pix: [] }
      }

      if (!usuario.metodosPagemento.pix) {
        usuario.metodosPagemento.pix = []
      }

      // Verificar se a chave já existe
      const pixExists = usuario.metodosPagemento.pix.some((c: any) => c.chave === dados.chave)

      if (pixExists) {
        return NextResponse.json({ error: "Esta chave PIX já está cadastrada" }, { status: 400 })
      }

      usuario.metodosPagemento.pix.push({
        chave: dados.chave,
        tipo: dados.tipo,
        nome: dados.nome,
      })

      await usuario.save()

      return NextResponse.json({
        success: true,
        message: "Chave PIX adicionada com sucesso",
        pix: usuario.metodosPagemento.pix,
      })
    }

    return NextResponse.json({ error: "Tipo de método de pagamento inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao adicionar método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao adicionar método de pagamento" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const tipo = searchParams.get("tipo")
    const id = searchParams.get("id")

    if (!tipo || !id) {
      return NextResponse.json({ error: "Parâmetros inválidos" }, { status: 400 })
    }

    await connectToDatabase()
    const usuario = await Usuario.findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (tipo === "cartao") {
      // Remover cartão do Stripe
      await stripe.paymentMethods.detach(id)

      return NextResponse.json({
        success: true,
        message: "Cartão removido com sucesso",
      })
    } else if (tipo === "pix") {
      // Remover chave PIX
      if (!usuario.metodosPagemento?.pix) {
        return NextResponse.json({ error: "Nenhuma chave PIX encontrada" }, { status: 404 })
      }

      // Encontrar o índice da chave PIX
      const pixIndex = usuario.metodosPagemento.pix.findIndex((c: any) => c._id.toString() === id)

      if (pixIndex === -1) {
        return NextResponse.json({ error: "Chave PIX não encontrada" }, { status: 404 })
      }

      // Remover a chave PIX
      usuario.metodosPagemento.pix.splice(pixIndex, 1)
      await usuario.save()

      return NextResponse.json({
        success: true,
        message: "Chave PIX removida com sucesso",
        pix: usuario.metodosPagemento.pix,
      })
    }

    return NextResponse.json({ error: "Tipo de método de pagamento inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao remover método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao remover método de pagamento" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const { tipo, id, dados } = await req.json()

    await connectToDatabase()
    const usuario = await Usuario.findOne({ email: session.user.email })

    if (!usuario) {
      return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    if (tipo === "pix") {
      // Atualizar chave PIX
      if (!usuario.metodosPagemento?.pix) {
        return NextResponse.json({ error: "Nenhuma chave PIX encontrada" }, { status: 404 })
      }

      // Encontrar o índice da chave PIX
      const pixIndex = usuario.metodosPagemento.pix.findIndex((p: any) => p._id.toString() === id)

      if (pixIndex === -1) {
        return NextResponse.json({ error: "Chave PIX não encontrada" }, { status: 404 })
      }

      // Atualizar a chave PIX
      usuario.metodosPagemento.pix[pixIndex] = {
        ...usuario.metodosPagemento.pix[pixIndex],
        ...dados,
      }

      await usuario.save()

      return NextResponse.json({
        success: true,
        message: "Chave PIX atualizada com sucesso",
        pix: usuario.metodosPagemento.pix,
      })
    }

    return NextResponse.json({ error: "Tipo de método de pagamento inválido" }, { status: 400 })
  } catch (error) {
    console.error("Erro ao atualizar método de pagamento:", error)
    return NextResponse.json({ error: "Erro ao atualizar método de pagamento" }, { status: 500 })
  }
}

