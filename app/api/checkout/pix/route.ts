import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth" // Fixed path
import { connectToDatabase } from "@/lib/mongodb"
import Stripe from "stripe"
import { ObjectId } from "mongodb"

// Inicializar o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia", // Updated API version
})

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
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter dados do corpo da requisição
    const data = await request.json()
    const { planoId, periodo, nome, email, documento, tipoDocumento, telefone } = data

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

    // Obter o ID do produto no Stripe
    const priceId = planoParaProduto[planoId as keyof typeof planoParaProduto]?.[periodo as "mensal" | "anual"]

    if (!priceId) {
      return NextResponse.json({ error: "Configuração de preço não encontrada" }, { status: 400 })
    }

    // Criar um cliente no Stripe se não existir
    let stripeCustomerId = ""
    const existingCustomer = await db.collection("usuarios").findOne({
      _id: new ObjectId(session.user.id),
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
          userId: session.user.id,
          tipoDocumento: tipoDocumento,
          documento: documento,
        },
      })

      stripeCustomerId = customer.id

      // Salvar o ID do cliente Stripe no usuário
      await db.collection("usuarios").updateOne(
        { _id: new ObjectId(session.user.id) },
        {
          $set: {
            "stripe.customerId": stripeCustomerId,
            "stripe.updatedAt": new Date(),
          },
        },
      )
    }

    // Criar uma sessão de pagamento com PIX
    const paymentIntent = await stripe.paymentIntents.create({
      amount: plano.preco * 100, // Stripe trabalha com centavos
      currency: "brl",
      customer: stripeCustomerId,
      payment_method_types: ["pix"],
      metadata: {
        userId: session.user.id,
        planoId: planoId,
        periodo: periodo,
      },
    })

    // Obter os detalhes do PIX
    const pixDetails = paymentIntent.next_action?.display_bank_transfer_instructions

    if (!pixDetails) {
      return NextResponse.json({ error: "Não foi possível gerar o PIX" }, { status: 500 })
    }

    // Criar registro de assinatura pendente
    const assinatura = {
      userId: session.user.id,
      plano: planoId,
      periodo: periodo,
      nome: nome,
      email: email,
      tipoDocumento: tipoDocumento,
      documento: documento,
      telefone: telefone,
      metodoPagamento: "pix",
      status: "pendente",
      dataAssinatura: new Date(),
      contratoAceito: false,
      stripe: {
        paymentIntentId: paymentIntent.id,
        customerId: stripeCustomerId,
      },
    }

    await db.collection("assinaturas").insertOne(assinatura)

    // Retornar os detalhes do PIX com os nomes de propriedades corretos
    // Use only properties that are guaranteed to exist in the DisplayBankTransferInstructions type
    return NextResponse.json({
      // Use the hosted_instructions_url which is guaranteed to exist
      qrCode: pixDetails.hosted_instructions_url,
      qrCodeImage: pixDetails.hosted_instructions_url,
      // Define a date of expiration (24 hours)
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      // Use the hosted_instructions_url for the PIX code as well
      pixCopiaECola: pixDetails.hosted_instructions_url,
      paymentIntentId: paymentIntent.id,
    })
  } catch (error) {
    console.error("Erro ao gerar PIX:", error)
    return NextResponse.json({ error: "Erro ao gerar PIX" }, { status: 500 })
  }
}
