"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MessageSquare,
  CreditCard,
  InstagramIcon,
  FacebookIcon,
  Webhook,
  Mail,
  ShoppingCart,
  Zap,
  MessageCircle,
  Users,
} from "lucide-react"

// Tipos de integração pré-definidos
const INTEGRACOES = [
  {
    id: "whatsapp",
    nome: "WhatsApp API",
    descricao:
      "Conecte-se com seus clientes através do WhatsApp Business API. Envie mensagens automatizadas, notificações e atualizações.",
    categoria: "Mensagens",
    icone: MessageSquare,
    status: "disponivel",
    cor: "text-green-500",
  },
  {
    id: "stripe",
    nome: "Stripe Checkout",
    descricao:
      "Processe pagamentos online de forma segura e eficiente. Aceite cartões de crédito, boletos, PIX e outros métodos.",
    categoria: "Pagamentos",
    icone: CreditCard,
    status: "disponivel",
    cor: "text-purple-500",
  },
  {
    id: "instagram",
    nome: "Instagram",
    descricao:
      "Integre sua loja com o Instagram Shopping. Venda produtos diretamente pelo Instagram e aumente suas vendas.",
    categoria: "Redes Sociais",
    icone: InstagramIcon,
    status: "disponivel",
    cor: "text-pink-500",
  },
  {
    id: "facebook",
    nome: "Facebook",
    descricao:
      "Conecte sua loja ao Facebook Shop e alcance milhões de potenciais clientes. Sincronize produtos e gerencie vendas.",
    categoria: "Redes Sociais",
    icone: FacebookIcon,
    status: "disponivel",
    cor: "text-blue-500",
  },
  {
    id: "webhooks",
    nome: "Webhooks",
    descricao:
      "Configure webhooks para conectar sua loja a outros serviços e sistemas. Automatize processos e mantenha tudo sincronizado.",
    categoria: "Desenvolvedor",
    icone: Webhook,
    status: "disponivel",
    cor: "text-gray-400",
  },
  {
    id: "mailchimp",
    nome: "Mailchimp",
    descricao: "Integre com o Mailchimp para gerenciar suas campanhas de email marketing e automações.",
    categoria: "Marketing",
    icone: Mail,
    status: "disponivel",
    cor: "text-yellow-500",
  },
  {
    id: "mercadopago",
    nome: "Mercado Pago",
    descricao: "Processe pagamentos com o Mercado Pago, a solução de pagamentos do Mercado Livre.",
    categoria: "Pagamentos",
    icone: CreditCard,
    status: "disponivel",
    cor: "text-blue-400",
  },
  {
    id: "zapier",
    nome: "Zapier",
    descricao: "Conecte sua loja a mais de 3.000 aplicativos sem precisar de código. Automatize tarefas e processos.",
    categoria: "Desenvolvedor",
    icone: Zap,
    status: "disponivel",
    cor: "text-orange-500",
  },
  {
    id: "google-shopping",
    nome: "Google Shopping",
    descricao: "Exiba seus produtos nos resultados de pesquisa do Google e atraia mais clientes para sua loja.",
    categoria: "Marketing",
    icone: ShoppingCart,
    status: "em_breve",
    cor: "text-blue-500",
  },
  {
    id: "telegram",
    nome: "Telegram Bot",
    descricao: "Crie um bot no Telegram para atendimento automatizado e notificações para seus clientes.",
    categoria: "Mensagens",
    icone: MessageCircle,
    status: "em_breve",
    cor: "text-blue-400",
  },
  {
    id: "hubspot",
    nome: "HubSpot CRM",
    descricao: "Integre com o HubSpot para gerenciar seus contatos, vendas e marketing em um só lugar.",
    categoria: "CRM",
    icone: Users,
    status: "em_breve",
    cor: "text-orange-500",
  },
]

export default function IntegracoesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState("todas")

  // Filtrar integrações
  const integracoesFiltradas = INTEGRACOES.filter(
    (integracao) =>
      (integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        integracao.descricao.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (categoriaAtiva === "todas" || integracao.categoria.toLowerCase() === categoriaAtiva.toLowerCase()),
  )

  // Obter categorias únicas
  const categorias = ["todas", ...new Set(INTEGRACOES.map((i) => i.categoria.toLowerCase()))]

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 bg-background">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Integrações</h2>
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar integrações..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {integracoesFiltradas.map((integracao) => (
          <Card
            key={integracao.id}
            className="relative overflow-hidden border border-gray-800 hover:border-gray-700 transition-colors bg-card/95"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`${integracao.cor}`}>
                    <integracao.icone className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{integracao.nome}</h3>
                    <Badge variant={integracao.status === "disponivel" ? "default" : "secondary"} className="mt-1">
                      {integracao.status === "disponivel" ? "Disponível" : "Em breve"}
                    </Badge>
                  </div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mb-4">{integracao.descricao}</p>
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="bg-background/95">
                  {integracao.categoria}
                </Badge>
                {integracao.status === "disponivel" ? (
                  <Button onClick={() => router.push(`/dashboard/integracoes/${integracao.id}`)}>Conectar</Button>
                ) : (
                  <Button variant="secondary" disabled>
                    Em breve
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Integrações Recomendadas */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold mb-4">Integrações Recomendadas</h3>
        <div className="grid gap-4 md:grid-cols-3">
          {INTEGRACOES.slice(0, 3).map((integracao) => (
            <Card
              key={`rec-${integracao.id}`}
              className="flex items-center p-4 space-x-4 border border-gray-800 hover:border-gray-700 transition-colors bg-card/95"
            >
              <div className={`${integracao.cor}`}>
                <integracao.icone className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">{integracao.nome}</h4>
                <p className="text-xs text-muted-foreground">{integracao.categoria}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

