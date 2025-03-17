import { type NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import Pagamento from "@/lib/models/pagamento"

// Desativar o bodyParser para o webhook do Stripe
export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    // Obter o corpo da requisição como texto
    const text = await req.text()

    // Obter o cabeçalho de assinatura do Stripe
    const headers = await req.headers
    const signature = headers.get("stripe-signature")

    if (!signature) {
      return NextResponse.json({ error: "Assinatura do webhook ausente" }, { status: 400 })
    }

    // Verificar a assinatura do webhook
    const event = stripe.webhooks.constructEvent(text, signature, process.env.STRIPE_WEBHOOK_SECRET || "")

    // Processar o evento
    await handleStripeEvent(event)

    return NextResponse.json({ received: true })
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : "Unknown error"
    console.error(`Erro no webhook: ${errorMessage}`)
    return NextResponse.json({ error: `Erro no webhook: ${errorMessage}` }, { status: 400 })
  }
}

async function handleStripeEvent(event: any) {
  await connectToDatabase()

  switch (event.type) {
    case "payment_intent.succeeded":
      const paymentIntent = event.data.object
      await updatePaymentStatus(paymentIntent.id, "concluido")
      break

    case "payment_intent.payment_failed":
      const failedPayment = event.data.object
      await updatePaymentStatus(failedPayment.id, "falha")
      break

    case "checkout.session.completed":
      const session = event.data.object
      await processCheckoutSession(session)
      break

    default:
      console.log(`Evento não tratado: ${event.type}`)
  }
}

async function processCheckoutSession(session: any) {
  // Encontrar o usuário pelo ID do cliente do Stripe
  const usuario = await Usuario.findOne({ stripeCustomerId: session.customer })

  if (!usuario) {
    console.error("Usuário não encontrado para o cliente:", session.customer)
    return
  }

  // Processar os itens da sessão
  if (session.line_items) {
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id)

    // Processar cada item
    lineItems.data.forEach(async (item: any) => {
      // Implementar lógica para processar cada item
      console.log("Item processado:", item)
    })
  }

  // Atualizar o status do pagamento
  if (session.payment_intent) {
    await updatePaymentStatus(session.payment_intent, "concluido")
  }
}

async function updatePaymentStatus(paymentIntentId: string, status: string) {
  // Encontrar o pagamento pelo ID do PaymentIntent
  const pagamento = await Pagamento.findOne({ paymentIntentId })

  if (!pagamento) {
    console.error("Pagamento não encontrado:", paymentIntentId)
    return
  }

  // Atualizar o status
  pagamento.status = status
  await pagamento.save()

  console.log(`Pagamento ${paymentIntentId} atualizado para ${status}`)
}

