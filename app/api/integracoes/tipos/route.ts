import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../../lib/auth"

// Lista de tipos de integrações disponíveis
const tiposIntegracao = [
  {
    id: "google",
    nome: "Google",
    descricao: "Integre com serviços do Google",
    provedores: [
      {
        id: "google-sheets",
        nome: "Google Sheets",
        descricao: "Sincronize dados com planilhas do Google para análises personalizadas.",
        icone: "https://cdn.worldvectorlogo.com/logos/google-sheets-full-logo-1.svg",
        campos: [
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true, descricao: "ID do cliente OAuth" },
          {
            nome: "clientSecret",
            label: "Client Secret",
            tipo: "password",
            obrigatorio: true,
            descricao: "Segredo do cliente OAuth",
          },
          {
            nome: "redirectUri",
            label: "URI de Redirecionamento",
            tipo: "text",
            obrigatorio: true,
            descricao: "URI para redirecionamento após autenticação",
          },
          {
            nome: "spreadsheetId",
            label: "ID da Planilha",
            tipo: "text",
            obrigatorio: false,
            descricao: "ID da planilha do Google Sheets (opcional)",
          },
        ],
      },
      {
        id: "google-calendar",
        nome: "Google Calendar",
        descricao: "Sincronize eventos e agendamentos com o Google Calendar.",
        icone: "https://cdn.worldvectorlogo.com/logos/google-calendar-2020-2.svg",
        campos: [
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true, descricao: "ID do cliente OAuth" },
          {
            nome: "clientSecret",
            label: "Client Secret",
            tipo: "password",
            obrigatorio: true,
            descricao: "Segredo do cliente OAuth",
          },
          {
            nome: "redirectUri",
            label: "URI de Redirecionamento",
            tipo: "text",
            obrigatorio: true,
            descricao: "URI para redirecionamento após autenticação",
          },
          {
            nome: "calendarId",
            label: "ID do Calendário",
            tipo: "text",
            obrigatorio: false,
            descricao: "ID do calendário (opcional)",
          },
        ],
      },
      {
        id: "google-drive",
        nome: "Google Drive",
        descricao: "Armazene e acesse arquivos na nuvem com o Google Drive.",
        icone: "https://cdn.worldvectorlogo.com/logos/google-drive-icon-1.svg",
        campos: [
          { nome: "clientId", label: "Client ID", tipo: "text", obrigatorio: true, descricao: "ID do cliente OAuth" },
          {
            nome: "clientSecret",
            label: "Client Secret",
            tipo: "password",
            obrigatorio: true,
            descricao: "Segredo do cliente OAuth",
          },
          {
            nome: "redirectUri",
            label: "URI de Redirecionamento",
            tipo: "text",
            obrigatorio: true,
            descricao: "URI para redirecionamento após autenticação",
          },
          {
            nome: "folderId",
            label: "ID da Pasta",
            tipo: "text",
            obrigatorio: false,
            descricao: "ID da pasta no Google Drive (opcional)",
          },
        ],
      },
    ],
  },
  {
    id: "outros",
    nome: "Outros Serviços",
    descricao: "Integre com outros serviços populares",
    provedores: [
      {
        id: "zapier",
        nome: "Zapier",
        descricao: "Conecte seus aplicativos favoritos e automatize tarefas repetitivas.",
        icone: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
        campos: [
          {
            nome: "apiKey",
            label: "API Key",
            tipo: "password",
            obrigatorio: true,
            descricao: "Chave de API do Zapier",
          },
          {
            nome: "webhookUrl",
            label: "URL do Webhook",
            tipo: "text",
            obrigatorio: false,
            descricao: "URL do webhook para receber dados (opcional)",
          },
        ],
      },
      {
        id: "mailchimp",
        nome: "Mailchimp",
        descricao: "Sincronize contatos e automatize campanhas de email marketing.",
        icone: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
        campos: [
          {
            nome: "apiKey",
            label: "API Key",
            tipo: "password",
            obrigatorio: true,
            descricao: "Chave de API do Mailchimp",
          },
          {
            nome: "listId",
            label: "ID da Lista",
            tipo: "text",
            obrigatorio: false,
            descricao: "ID da lista de contatos (opcional)",
          },
          {
            nome: "serverPrefix",
            label: "Prefixo do Servidor",
            tipo: "text",
            obrigatorio: true,
            descricao: "Prefixo do servidor (ex: us1, us2)",
          },
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
