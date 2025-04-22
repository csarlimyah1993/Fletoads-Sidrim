import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Stripe from "stripe"
import { ObjectId } from "mongodb"

// Inicializar o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

// Mapeamento de planos para produtos e preços no Stripe
const planoParaProduto = {
  start: {
    plano: "prod_SAVV15DmKCNLNZ",
    mensal: "price_1RGAUWJQbAomvNmpOofdBh1I",
    anual: "price_1RGAUWJQbAomvNmpUcTFPLt7",
  },
  basico: {
    plano: "prod_SAVYQYcon7rOlH",
    mensal: "price_1RGAX2JQbAomvNmphGwGlXOm",
    anual: "price_1RGAX2JQbAomvNmp15SWjDSC",
  },
  completo: {
    plano: "prod_SAVaZigoV9Tlq8",
    mensal: "price_1RGAZXJQbAomvNmpmdRu8jVt",
    anual: "price_1RGAczJQbAomvNmpvXB8C86d",
  },
  premium: {
    plano: "prod_SAVhwILpp7STpt",
    mensal: "price_1RGAftJQbAomvNmpqIa6rxmF",
    anual: "price_1RGAftJQbAomvNmphuUtoZcm",
  },
  empresarial: {
    plano: "prod_SAVjq8TuSIsrTt",
    mensal: "price_1RGAhwJQbAomvNmpx1vQUOLs",
    anual: "price_1RGAhwJQbAomvNmpWoR9AcCU",
  },
}

export async function POST(request: Request) {
  try {
    // Verificar autenticação
    const userSession = await getServerSession(authOptions)

    if (!userSession) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const data = await request.json()
    const { planoId, periodo, nome, email, documento, tipoDocumento, telefone, endereco, cidade, estado, cep } = data

    // Validar dados obrigatórios
    if (!planoId || !periodo || !nome || !email || !documento) {
      return NextResponse.json({ error: "Dados incompletos" }, { status: 400 })
    }

    // Validar plano e período
    if (!["start", "basico", "completo", "premium", "empresarial"].includes(planoId)) {
      return NextResponse.json({ error: "Plano inválido" }, { status: 400 })
    }

    if (!["mensal", "anual"].includes(periodo)) {
      return NextResponse.json({ error: "Período inválido" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Buscar o plano no banco de dados para verificar o preço
    const plano = await db.collection("planos").findOne({ slug: planoId })

    if (!plano) {
      return NextResponse.json({ error: "Plano não encontrado" }, { status: 404 })
    }

    // Obter o ID do preço no Stripe
    const priceId = planoParaProduto[planoId as keyof typeof planoParaProduto]?.[periodo as "mensal" | "anual"]

    if (!priceId) {
      return NextResponse.json({ error: "Configuração de preço não encontrada" }, { status: 400 })
    }

    // Criar um cliente no Stripe se não existir
    let stripeCustomerId = ""
    const existingCustomer = await db.collection("usuarios").findOne({
      _id: new ObjectId(userSession.user.id),
      "stripe.customerId": { $exists: true },
    })

    if (existingCustomer && existingCustomer.stripe?.customerId) {
      stripeCustomerId = existingCustomer.stripe.customerId
    } else {
      // Criar um novo cliente no Stripe
      const customer = await stripe.customers.create({
        email: email,
        name: nome,
        phone: telefone,
        metadata: {
          userId: userSession.user.id,
          tipoDocumento: tipoDocumento,
          documento: documento,
        },
      })

      stripeCustomerId = customer.id

      // Salvar o ID do cliente Stripe no usuário
      await db.collection("usuarios").updateOne(
        { _id: new ObjectId(userSession.user.id) },
        {
          $set: {
            "stripe.customerId": stripeCustomerId,
            "stripe.updatedAt": new Date(),
          },
        },
      )
    }

    // Criar uma sessão de checkout no Stripe para cartão de crédito/débito
    const stripeSession = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ["card"], // Usar cartão como método de pagamento
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // Modo de assinatura
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos/contrato?session_id={CHECKOUT_SESSION_ID}&plano=${planoId}&periodo=${periodo}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/planos/checkout?plano=${planoId}&periodo=${periodo}&canceled=true`,
      metadata: {
        userId: userSession.user.id,
        planoId: planoId,
        periodo: periodo,
      },
      subscription_data: {
        metadata: {
          userId: userSession.user.id,
          planoId: planoId,
          periodo: periodo,
        },
      },
      billing_address_collection: "auto", // Coletar endereço de cobrança
      allow_promotion_codes: true, // Permitir códigos promocionais
    })

    // Criar registro de assinatura pendente
    const assinatura = {
      userId: userSession.user.id,
      plano: planoId,
      periodo: periodo,
      nome: nome,
      email: email,
      tipoDocumento: tipoDocumento,
      documento: documento,
      telefone: telefone,
      endereco: {
        logradouro: endereco,
        cidade: cidade,
        estado: estado,
        cep: cep,
      },
      metodoPagamento: "cartao",
      status: "pendente",
      dataAssinatura: new Date(),
      contratoAceito: false,
      stripe: {
        sessionId: stripeSession.id,
        customerId: stripeCustomerId,
      },
    }

    await db.collection("assinaturas").insertOne(assinatura)

    // Retornar URL da sessão de checkout
    return NextResponse.json({
      url: stripeSession.url,
      sessionId: stripeSession.id,
    })
  } catch (error) {
    console.error("Erro ao processar checkout:", error)
    return NextResponse.json({ error: "Erro ao processar checkout" }, { status: 500 })
  }
}
