import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import Stripe from "stripe"

// Inicializar o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia",
})

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o ID do PaymentIntent da URL
    const url = new URL(request.url)
    const paymentIntentId = url.searchParams.get("payment_intent_id")

    if (!paymentIntentId) {
      return NextResponse.json({ error: "ID do PaymentIntent não fornecido" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Verificar se a assinatura existe e pertence ao usuário
    const assinatura = await db.collection("assinaturas").findOne({
      "stripe.paymentIntentId": paymentIntentId,
      userId: session.user.id,
    })

    if (!assinatura) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })
    }

    // Verificar o status do PaymentIntent no Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Atualizar o status da assinatura com base no status do PaymentIntent
    if (paymentIntent.status === "succeeded") {
      // Atualizar o status da assinatura no banco de dados
      await db.collection("assinaturas").updateOne(
        { "stripe.paymentIntentId": paymentIntentId },
        {
          $set: {
            status: "pago",
            "stripe.paymentStatus": paymentIntent.status,
            "stripe.updatedAt": new Date(),
          },
        },
      )

      // Criar notificação para o usuário
      await db.collection("notificacoes").insertOne({
        userId: session.user.id,
        tipo: "pagamento",
        titulo: "Pagamento PIX Confirmado",
        mensagem: `Seu pagamento PIX para o plano ${assinatura.plano} foi confirmado!`,
        lida: false,
        data: new Date(),
      })
    }

    // Retornar o status do PaymentIntent
    return NextResponse.json({
      status: paymentIntent.status,
      planoId: assinatura.plano,
      periodo: assinatura.periodo,
    })
  } catch (error) {
    console.error("Erro ao verificar status do PIX:", error)
    return NextResponse.json({ error: "Erro ao verificar status do PIX" }, { status: 500 })
  }
}
