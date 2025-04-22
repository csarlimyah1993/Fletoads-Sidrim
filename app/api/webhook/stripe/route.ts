import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

// Inicializar o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia", // Versão atualizada da API
})

// Webhook secret para verificar assinatura
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const headersList = await headers()
  const sig = headersList.get("stripe-signature")

  if (!sig) {
    return NextResponse.json({ error: "Assinatura do webhook não fornecida" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    // Verificar assinatura do webhook
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error(`Erro na assinatura do webhook: ${err.message}`)
    return NextResponse.json({ error: `Assinatura do webhook inválida: ${err.message}` }, { status: 400 })
  }

  // Conectar ao banco de dados
  const { db } = await connectToDatabase()

  try {
    // Processar diferentes tipos de eventos
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentSucceeded(paymentIntent, db)
        break

      case "payment_intent.payment_failed":
        const failedPaymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentIntentFailed(failedPaymentIntent, db)
        break

      case "checkout.session.completed":
        const session = event.data.object as Stripe.Checkout.Session
        await handleCheckoutSessionCompleted(session, db)
        break

      case "invoice.paid":
        const invoice = event.data.object as Stripe.Invoice
        await handleInvoicePaid(invoice, db)
        break

      case "invoice.payment_failed":
        const failedInvoice = event.data.object as Stripe.Invoice
        await handleInvoicePaymentFailed(failedInvoice, db)
        break

      case "customer.subscription.deleted":
        const subscription = event.data.object as Stripe.Subscription
        await handleSubscriptionDeleted(subscription, db)
        break

      default:
        console.log(`Evento não tratado: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error(`Erro ao processar webhook: ${error}`)
    return NextResponse.json({ error: "Erro interno ao processar webhook" }, { status: 500 })
  }
}

// Funções para lidar com diferentes eventos

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent, db: any) {
  console.log(`PaymentIntent bem-sucedido: ${paymentIntent.id}`)

  // Verificar se há metadados com informações do usuário e plano
  if (paymentIntent.metadata && paymentIntent.metadata.userId) {
    const userId = paymentIntent.metadata.userId
    const planoId = paymentIntent.metadata.planoId
    const periodo = paymentIntent.metadata.periodo

    // Atualizar a assinatura no banco de dados
    await db.collection("assinaturas").updateOne(
      { "stripe.paymentIntentId": paymentIntent.id },
      {
        $set: {
          status: "ativa",
          dataConfirmacao: new Date(),
          ultimaAtualizacao: new Date(),
        },
      },
    )

    // Registrar o pagamento
    await db.collection("pagamentos").insertOne({
      userId: userId,
      planoId: planoId,
      valor: paymentIntent.amount / 100, // Converter de centavos para reais
      moeda: paymentIntent.currency,
      status: "confirmado",
      metodoPagamento: "cartao",
      dataPagamento: new Date(),
      stripe: {
        paymentIntentId: paymentIntent.id,
        chargeId: paymentIntent.latest_charge,
      },
    })
  }
}

async function handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent, db: any) {
  console.log(`PaymentIntent falhou: ${paymentIntent.id}`)

  if (paymentIntent.metadata && paymentIntent.metadata.userId) {
    // Atualizar a assinatura no banco de dados
    await db.collection("assinaturas").updateOne(
      { "stripe.paymentIntentId": paymentIntent.id },
      {
        $set: {
          status: "falha",
          ultimaAtualizacao: new Date(),
          motivoFalha: paymentIntent.last_payment_error?.message || "Falha no pagamento",
        },
      },
    )

    // Registrar a tentativa de pagamento
    await db.collection("pagamentos").insertOne({
      userId: paymentIntent.metadata.userId,
      planoId: paymentIntent.metadata.planoId,
      valor: paymentIntent.amount / 100,
      moeda: paymentIntent.currency,
      status: "falha",
      metodoPagamento: "cartao",
      dataTentativa: new Date(),
      motivoFalha: paymentIntent.last_payment_error?.message || "Falha no pagamento",
      stripe: {
        paymentIntentId: paymentIntent.id,
      },
    })
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session, db: any) {
  console.log(`Checkout session concluída: ${session.id}`)

  // Verificar se a sessão tem um cliente e assinatura
  if (session.customer && session.subscription) {
    const customerId = session.customer as string
    const subscriptionId = session.subscription as string

    try {
      // Buscar detalhes da assinatura no Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Extrair metadados
      const planoId = session.metadata?.planoId || "desconhecido"
      const periodo = session.metadata?.periodo || "mensal"
      const userId = session.metadata?.userId || "guest"

      // Calcular data de vencimento
      const dataAtual = new Date()
      const dataVencimento = new Date(dataAtual)

      if (periodo === "mensal") {
        dataVencimento.setMonth(dataVencimento.getMonth() + 1)
      } else if (periodo === "anual") {
        dataVencimento.setFullYear(dataVencimento.getFullYear() + 1)
      }

      // Criar objeto de plano para salvar no banco
      const planoObj = {
        tipo: planoId,
        modelo: periodo,
        ativo: true,
        dataAssinatura: new Date(),
        dataVencimento: dataVencimento,
        valorPago: subscription.items.data[0].price.unit_amount
          ? subscription.items.data[0].price.unit_amount / 100
          : 0,
        moeda: subscription.currency,
        renovacaoAutomatica: true,
        stripe: {
          subscriptionId: subscriptionId,
          customerId: customerId,
          status: subscription.status,
          currentPeriodEnd: new Date(subscription.current_period_end * 1000),
          currentPeriodStart: new Date(subscription.current_period_start * 1000),
        },
      }

      // Buscar o usuário pelo customerId do Stripe ou pelo userId nos metadados
      const usuario = await db.collection("usuarios").findOne({
        $or: [{ "stripe.customerId": customerId }, { _id: userId !== "guest" ? new ObjectId(userId) : null }],
      })

      if (usuario) {
        // Atualizar o usuário com os detalhes da assinatura
        await db.collection("usuarios").updateOne(
          { _id: usuario._id },
          {
            $set: {
              assinaturaAtiva: true,
              planoAtivo: planoId,
              periodoAssinatura: periodo,
              dataAssinatura: new Date(),
              dataVencimento: dataVencimento,
              "stripe.subscriptionId": subscriptionId,
              "stripe.customerId": customerId,
              "stripe.ultimoPagamento": new Date(),
              plano: planoObj,
            },
          },
        )

        // Criar ou atualizar o registro de assinatura
        await db.collection("assinaturas").updateOne(
          { userId: usuario._id.toString() },
          {
            $set: {
              status: "ativa",
              plano: planoId,
              periodo: periodo,
              dataAssinatura: new Date(),
              dataConfirmacao: new Date(),
              dataVencimento: dataVencimento,
              ultimaAtualizacao: new Date(),
              renovacaoAutomatica: true,
              detalhesPlano: planoObj,
              stripe: {
                customerId: customerId,
                subscriptionId: subscriptionId,
                sessionId: session.id,
              },
            },
          },
          { upsert: true },
        )
      } else {
        console.log(`Usuário não encontrado para customerId: ${customerId} ou userId: ${userId}`)
      }
    } catch (error) {
      console.error(`Erro ao processar checkout session: ${error}`)
    }
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice, db: any) {
  console.log(`Fatura paga: ${invoice.id}`)

  if (invoice.customer && invoice.subscription) {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    try {
      // Buscar detalhes da assinatura no Stripe
      const subscription = await stripe.subscriptions.retrieve(subscriptionId)

      // Buscar o usuário pelo customerId do Stripe
      const usuario = await db.collection("usuarios").findOne({
        "stripe.customerId": customerId,
      })

      if (usuario) {
        // Calcular nova data de vencimento
        const dataVencimento = new Date(subscription.current_period_end * 1000)

        // Atualizar o objeto de plano
        const planoObj = {
          tipo: usuario.planoAtivo || "desconhecido",
          modelo: usuario.periodoAssinatura || "mensal",
          ativo: true,
          dataAssinatura: new Date(subscription.start_date * 1000),
          dataVencimento: dataVencimento,
          valorPago: invoice.amount_paid / 100,
          moeda: invoice.currency,
          renovacaoAutomatica: true,
          stripe: {
            subscriptionId: subscriptionId,
            customerId: customerId,
            status: subscription.status,
            currentPeriodEnd: new Date(subscription.current_period_end * 1000),
            currentPeriodStart: new Date(subscription.current_period_start * 1000),
          },
        }

        // Atualizar o status da assinatura
        await db.collection("assinaturas").updateOne(
          { "stripe.subscriptionId": subscriptionId },
          {
            $set: {
              status: "ativa",
              ultimaAtualizacao: new Date(),
              dataVencimento: dataVencimento,
              detalhesPlano: planoObj,
              "stripe.ultimaFatura": invoice.id,
              "stripe.proximaFatura": invoice.next_payment_attempt
                ? new Date(invoice.next_payment_attempt * 1000)
                : null,
            },
          },
        )

        // Registrar o pagamento
        await db.collection("pagamentos").insertOne({
          userId: usuario._id.toString(),
          valor: invoice.amount_paid / 100,
          moeda: invoice.currency,
          status: "confirmado",
          metodoPagamento: "cartao",
          dataPagamento: new Date(),
          stripe: {
            invoiceId: invoice.id,
            subscriptionId: subscriptionId,
            customerId: customerId,
          },
        })

        // Atualizar o status do usuário
        await db.collection("usuarios").updateOne(
          { _id: usuario._id },
          {
            $set: {
              assinaturaAtiva: true,
              dataVencimento: dataVencimento,
              "stripe.ultimoPagamento": new Date(),
              plano: planoObj,
            },
          },
        )
      }
    } catch (error) {
      console.error(`Erro ao processar invoice paid: ${error}`)
    }
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice, db: any) {
  console.log(`Pagamento de fatura falhou: ${invoice.id}`)

  if (invoice.customer && invoice.subscription) {
    const customerId = invoice.customer as string
    const subscriptionId = invoice.subscription as string

    // Buscar o usuário pelo customerId do Stripe
    const usuario = await db.collection("usuarios").findOne({
      "stripe.customerId": customerId,
    })

    if (usuario) {
      // Atualizar o status da assinatura
      await db.collection("assinaturas").updateOne(
        { "stripe.subscriptionId": subscriptionId },
        {
          $set: {
            status: "pendente",
            ultimaAtualizacao: new Date(),
            motivoFalha: "Falha no pagamento da fatura",
          },
        },
      )

      // Atualizar o plano do usuário
      await db.collection("usuarios").updateOne(
        { _id: usuario._id },
        {
          $set: {
            "plano.ativo": false,
            "plano.motivoInatividade": "Falha no pagamento da fatura",
          },
        },
      )

      // Registrar a tentativa de pagamento
      await db.collection("pagamentos").insertOne({
        userId: usuario._id.toString(),
        valor: invoice.amount_due / 100,
        moeda: invoice.currency,
        status: "falha",
        metodoPagamento: "cartao",
        dataTentativa: new Date(),
        motivoFalha: "Falha no pagamento da fatura",
        stripe: {
          invoiceId: invoice.id,
          subscriptionId: subscriptionId,
          customerId: customerId,
        },
      })
    }
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription, db: any) {
  console.log(`Assinatura cancelada: ${subscription.id}`)

  // Buscar a assinatura no banco de dados
  const assinatura = await db.collection("assinaturas").findOne({
    "stripe.subscriptionId": subscription.id,
  })

  if (assinatura) {
    // Atualizar o status da assinatura
    await db.collection("assinaturas").updateOne(
      { "stripe.subscriptionId": subscription.id },
      {
        $set: {
          status: "cancelada",
          ultimaAtualizacao: new Date(),
          dataCancelamento: new Date(),
        },
      },
    )

    // Atualizar o status do usuário
    await db.collection("usuarios").updateOne(
      { _id: new ObjectId(assinatura.userId) },
      {
        $set: {
          assinaturaAtiva: false,
          planoAtivo: null,
          "stripe.subscriptionId": null,
          dataCancelamentoAssinatura: new Date(),
          "plano.ativo": false,
          "plano.dataCancelamento": new Date(),
        },
      },
    )
  }
}

export const GET = POST
