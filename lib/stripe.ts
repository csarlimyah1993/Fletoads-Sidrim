import Stripe from "stripe"

// Inicializar o cliente Stripe
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16", // Use a versão mais recente da API
})

// Função para criar um PaymentIntent
export async function createPaymentIntent(amount: number, currency = "brl", customer?: string) {
  return stripe.paymentIntents.create({
    amount,
    currency,
    customer,
    payment_method_types: ["card"],
  })
}

// Função para criar um SetupIntent (para salvar cartões)
export async function createSetupIntent(customer: string) {
  return stripe.setupIntents.create({
    customer,
    payment_method_types: ["card"],
  })
}

// Função para criar um cliente
export async function createCustomer(email: string, name: string) {
  return stripe.customers.create({
    email,
    name,
  })
}

// Função para listar métodos de pagamento de um cliente
export async function listPaymentMethods(customerId: string, type = "card") {
  return stripe.paymentMethods.list({
    customer: customerId,
    type,
  })
}

// Função para anexar um método de pagamento a um cliente
export async function attachPaymentMethod(paymentMethodId: string, customerId: string) {
  return stripe.paymentMethods.attach(paymentMethodId, {
    customer: customerId,
  })
}

// Função para desanexar um método de pagamento
export async function detachPaymentMethod(paymentMethodId: string) {
  return stripe.paymentMethods.detach(paymentMethodId)
}

// Função para criar uma sessão de checkout
export async function createCheckoutSession(params: {
  customerId: string
  successUrl: string
  cancelUrl: string
  lineItems: Array<{
    price: string
    quantity: number
  }>
  mode: "payment" | "subscription" | "setup"
}) {
  return stripe.checkout.sessions.create({
    customer: params.customerId,
    success_url: params.successUrl,
    cancel_url: params.cancelUrl,
    line_items: params.lineItems,
    mode: params.mode,
  })
}

// Função para recuperar um PaymentIntent
export async function retrievePaymentIntent(paymentIntentId: string) {
  return stripe.paymentIntents.retrieve(paymentIntentId)
}

// Função para confirmar um PaymentIntent
export async function confirmPaymentIntent(paymentIntentId: string, paymentMethodId: string) {
  return stripe.paymentIntents.confirm(paymentIntentId, {
    payment_method: paymentMethodId,
  })
}

// Função para obter detalhes de um método de pagamento
export function getPaymentMethodDetails(method: any) {
  if (method.type === "card") {
    const card = method.card
    return {
      brand: card.brand,
      last4: card.last4,
      expMonth: card.exp_month,
      expYear: card.exp_year,
    }
  }
  return null
}

// Função para criar uma sessão de checkout
export async function criarSessaoCheckout(
  customerId: string,
  itens: Array<{ preco: number; nome: string; quantidade: number; imagemUrl?: string }>,
  successUrl: string,
  cancelUrl: string,
  metadata: any,
) {
  const lineItems = itens.map((item) => ({
    price_data: {
      currency: "brl",
      product_data: {
        name: item.nome,
        images: item.imagemUrl ? [item.imagemUrl] : [],
      },
      unit_amount: Math.round(item.preco * 100), // Stripe usa centavos
    },
    quantity: item.quantidade,
  }))

  return stripe.checkout.sessions.create({
    customer: customerId,
    success_url: successUrl,
    cancel_url: cancelUrl,
    line_items: lineItems,
    mode: "payment",
    metadata: metadata,
  })
}

