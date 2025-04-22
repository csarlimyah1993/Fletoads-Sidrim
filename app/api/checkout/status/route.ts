import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth" // Fixed path
import { connectToDatabase } from "@/lib/mongodb"
import Stripe from "stripe"

// Inicializar o Stripe com a chave secreta
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-02-24.acacia", // Updated API version
})

export async function GET(request: Request) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Obter o ID da sessão da URL
    const url = new URL(request.url)
    const sessionId = url.searchParams.get("session_id")

    if (!sessionId) {
      return NextResponse.json({ error: "ID da sessão não fornecido" }, { status: 400 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Verificar se a assinatura existe e pertence ao usuário
    const assinatura = await db.collection("assinaturas").findOne({
      "stripe.sessionId": sessionId,
      userId: session.user.id,
    })

    if (!assinatura) {
      return NextResponse.json({ error: "Assinatura não encontrada" }, { status: 404 })
    }

    // Verificar o status da sessão no Stripe
    const checkoutSession = await stripe.checkout.sessions.retrieve(sessionId)

    // Atualizar o status da assinatura com base no status da sessão
    let status = assinatura.status
    if (checkoutSession.payment_status === "paid") {
      status = "pago"

      // Atualizar o status da assinatura no banco de dados
      await db.collection("assinaturas").updateOne(
        { "stripe.sessionId": sessionId },
        {
          $set: {
            status: status,
            "stripe.subscriptionId": checkoutSession.subscription,
            "stripe.paymentStatus": checkoutSession.payment_status,
            "stripe.updatedAt": new Date(),
          },
        },
      )
    }

    // Retornar o status da assinatura
    return NextResponse.json({
      status: status,
      planoId: assinatura.plano,
      periodo: assinatura.periodo,
      sessionId: sessionId,
      paymentStatus: checkoutSession.payment_status,
      customerEmail: checkoutSession.customer_details?.email,
    })
  } catch (error) {
    console.error("Erro ao verificar status da sessão:", error)
    return NextResponse.json({ error: "Erro ao verificar status da sessão" }, { status: 500 })
  }
}
