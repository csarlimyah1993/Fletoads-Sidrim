import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

// Lista de tipos de integrações disponíveis
const tiposIntegracao = [
  {
    id: "pagamento",
    nome: "Gateway de Pagamento",
    descricao: "Integre com serviços de processamento de pagamentos",
    provedores: [
      {
        id: "stripe",
        nome: "Stripe",
        descricao: "Processamento de pagamentos online",
        icone: "/icons/stripe.svg",
        campos: [
          { nome: "apiKey", label: "Chave de API", tipo: "password", obrigatorio: true },
          { nome: "webhookSecret", label: "Segredo do Webhook", tipo: "password", obrigatorio: false },
        ],
      },
      {
        id: "mercadopago",
        nome: "Mercado Pago",
        descricao: "Solução de pagamentos do Mercado Livre",
        icone: "/icons/mercadopago.svg",
        campos: [
          { nome: "accessToken", label: "Access Token", tipo: "password", obrigatorio: true },
          { nome: "publicKey", label: "Chave Pública", tipo: "text", obrigatorio: true },
        ],
      },
      {
        id: "paypal",
        nome: "PayPal",
        descricao: "Pagamentos online internacionais",
        icone: "/icons/paypal.svg",
        campos: [
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true },
          { nome: "clientSecret", label: "Client Secret", tipo: "password", obrigatorio: true },
          { nome: "ambiente", label: "Ambiente", tipo: "select", opcoes: ["sandbox", "production"], obrigatorio: true },
        ],
      },
    ],
  },
  {
    id: "ecommerce",
    nome: "Plataforma de E-commerce",
    descricao: "Conecte com sua loja virtual",
    provedores: [
      {
        id: "shopify",
        nome: "Shopify",
        descricao: "Plataforma de e-commerce completa",
        icone: "/icons/shopify.svg",
        campos: [
          { nome: "apiKey", label: "API Key", tipo: "text", obrigatorio: true },
          { nome: "password", label: "API Password", tipo: "password", obrigatorio: true },
          { nome: "shopName", label: "Nome da Loja", tipo: "text", obrigatorio: true },
        ],
      },
      {
        id: "woocommerce",
        nome: "WooCommerce",
        descricao: "Plugin de e-commerce para WordPress",
        icone: "/icons/woocommerce.svg",
        campos: [
          { nome: "url", label: "URL da Loja", tipo: "text", obrigatorio: true },
          { nome: "consumerKey", label: "Consumer Key", tipo: "text", obrigatorio: true },
          { nome: "consumerSecret", label: "Consumer Secret", tipo: "password", obrigatorio: true },
        ],
      },
    ],
  },
  {
    id: "email",
    nome: "Marketing por Email",
    descricao: "Integre com serviços de email marketing",
    provedores: [
      {
        id: "mailchimp",
        nome: "Mailchimp",
        descricao: "Plataforma de automação de marketing",
        icone: "/icons/mailchimp.svg",
        campos: [
          { nome: "apiKey", label: "API Key", tipo: "password", obrigatorio: true },
          { nome: "serverPrefix", label: "Prefixo do Servidor", tipo: "text", obrigatorio: true },
        ],
      },
      {
        id: "sendgrid",
        nome: "SendGrid",
        descricao: "Plataforma de entrega de emails",
        icone: "/icons/sendgrid.svg",
        campos: [{ nome: "apiKey", label: "API Key", tipo: "password", obrigatorio: true }],
      },
    ],
  },
  {
    id: "social",
    nome: "Mídia Social",
    descricao: "Conecte com plataformas de mídia social",
    provedores: [
      {
        id: "facebook",
        nome: "Facebook",
        descricao: "Integração com Facebook e Instagram",
        icone: "/icons/facebook.svg",
        campos: [
          { nome: "appId", label: "App ID", tipo: "text", obrigatorio: true },
          { nome: "appSecret", label: "App Secret", tipo: "password", obrigatorio: true },
          { nome: "accessToken", label: "Access Token", tipo: "password", obrigatorio: true },
        ],
      },
      {
        id: "whatsapp",
        nome: "WhatsApp Business",
        descricao: "API do WhatsApp para empresas",
        icone: "/icons/whatsapp.svg",
        campos: [
          { nome: "phoneNumberId", label: "ID do Número de Telefone", tipo: "text", obrigatorio: true },
          { nome: "accessToken", label: "Access Token", tipo: "password", obrigatorio: true },
        ],
      },
    ],
  },
  {
    id: "logistica",
    nome: "Logística e Entrega",
    descricao: "Integre com serviços de logística e entrega",
    provedores: [
      {
        id: "correios",
        nome: "Correios",
        descricao: "Serviços postais brasileiros",
        icone: "/icons/correios.svg",
        campos: [
          { nome: "usuario", label: "Usuário", tipo: "text", obrigatorio: true },
          { nome: "senha", label: "Senha", tipo: "password", obrigatorio: true },
          { nome: "codigoAdministrativo", label: "Código Administrativo", tipo: "text", obrigatorio: false },
          { nome: "contrato", label: "Número do Contrato", tipo: "text", obrigatorio: false },
        ],
      },
      {
        id: "melhorenvio",
        nome: "Melhor Envio",
        descricao: "Plataforma de fretes para e-commerce",
        icone: "/icons/melhorenvio.svg",
        campos: [
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true },
          { nome: "clientSecret", label: "Client Secret", tipo: "password", obrigatorio: true },
          { nome: "accessToken", label: "Access Token", tipo: "password", obrigatorio: true },
        ],
      },
    ],
  },
  {
    id: "erp",
    nome: "ERP e Gestão",
    descricao: "Conecte com sistemas de gestão empresarial",
    provedores: [
      {
        id: "totvs",
        nome: "TOTVS",
        descricao: "Soluções de gestão empresarial",
        icone: "/icons/totvs.svg",
        campos: [
          { nome: "url", label: "URL da API", tipo: "text", obrigatorio: true },
          { nome: "usuario", label: "Usuário", tipo: "text", obrigatorio: true },
          { nome: "senha", label: "Senha", tipo: "password", obrigatorio: true },
        ],
      },
      {
        id: "sap",
        nome: "SAP",
        descricao: "Sistemas de gestão empresarial",
        icone: "/icons/sap.svg",
        campos: [
          { nome: "url", label: "URL da API", tipo: "text", obrigatorio: true },
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true },
          { nome: "clientSecret", label: "Client Secret", tipo: "password", obrigatorio: true },
        ],
      },
    ],
  },
  {
    id: "marketplace",
    nome: "Marketplace",
    descricao: "Integre com marketplaces populares",
    provedores: [
      {
        id: "mercadolivre",
        nome: "Mercado Livre",
        descricao: "Maior marketplace da América Latina",
        icone: "/icons/mercadolivre.svg",
        campos: [
          { nome: "appId", label: "App ID", tipo: "text", obrigatorio: true },
          { nome: "clientSecret", label: "Client Secret", tipo: "password", obrigatorio: true },
          { nome: "accessToken", label: "Access Token", tipo: "password", obrigatorio: true },
          { nome: "refreshToken", label: "Refresh Token", tipo: "password", obrigatorio: true },
        ],
      },
      {
        id: "amazon",
        nome: "Amazon",
        descricao: "Marketplace global",
        icone: "/icons/amazon.svg",
        campos: [
          { nome: "sellerId", label: "Seller ID", tipo: "text", obrigatorio: true },
          { nome: "accessKey", label: "Access Key", tipo: "text", obrigatorio: true },
          { nome: "secretKey", label: "Secret Key", tipo: "password", obrigatorio: true },
          { nome: "marketplace", label: "Marketplace", tipo: "select", opcoes: ["BR", "US", "EU"], obrigatorio: true },
        ],
      },
    ],
  },
  {
    id: "crm",
    nome: "CRM",
    descricao: "Integre com sistemas de gestão de relacionamento com clientes",
    provedores: [
      {
        id: "hubspot",
        nome: "HubSpot",
        descricao: "Plataforma de marketing, vendas e CRM",
        icone: "/icons/hubspot.svg",
        campos: [{ nome: "apiKey", label: "API Key", tipo: "password", obrigatorio: true }],
      },
      {
        id: "salesforce",
        nome: "Salesforce",
        descricao: "Plataforma de CRM líder mundial",
        icone: "/icons/salesforce.svg",
        campos: [
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true },
          { nome: "clientSecret", label: "Client Secret", tipo: "password", obrigatorio: true },
          { nome: "username", label: "Username", tipo: "text", obrigatorio: true },
          { nome: "password", label: "Password", tipo: "password", obrigatorio: true },
          { nome: "securityToken", label: "Security Token", tipo: "password", obrigatorio: true },
        ],
      },
    ],
  },
]

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    return NextResponse.json(tiposIntegracao)
  } catch (error) {
    console.error("Erro ao listar tipos de integração:", error)
    return NextResponse.json({ error: "Erro ao listar tipos de integração" }, { status: 500 })
  }
}

