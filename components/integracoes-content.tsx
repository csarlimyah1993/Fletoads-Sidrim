"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  MessageCircle,
  CreditCard,
  Instagram,
  Facebook,
  Webhook,
  Mail,
  ShoppingCart,
  Zap,
  Search,
  Check,
  ExternalLink,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export function IntegracoesContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [selectedIntegration, setSelectedIntegration] = useState(null)

  // Dados das integrações disponíveis
  const integrations = [
    {
      id: "whatsapp-api",
      name: "WhatsApp API",
      description:
        "Conecte-se com seus clientes através do WhatsApp Business API. Envie mensagens automatizadas, notificações e atendimento personalizado.",
      icon: <MessageCircle className="h-8 w-8 text-green-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "messaging",
      status: "available",
      popular: true,
      features: [
        "Envio de mensagens em massa",
        "Chatbots automatizados",
        "Notificações de pedidos",
        "Atendimento ao cliente",
      ],
    },
    {
      id: "stripe",
      name: "Stripe Checkout",
      description:
        "Processe pagamentos online de forma segura e eficiente. Aceite cartões de crédito, boletos, PIX e outros métodos de pagamento.",
      icon: <CreditCard className="h-8 w-8 text-purple-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "payment",
      status: "available",
      popular: true,
      features: [
        "Checkout personalizado",
        "Pagamentos recorrentes",
        "Múltiplos métodos de pagamento",
        "Relatórios detalhados",
      ],
    },
    {
      id: "instagram",
      name: "Instagram",
      description:
        "Integre sua loja com o Instagram Shopping. Venda produtos diretamente pelo Instagram e aumente seu alcance.",
      icon: <Instagram className="h-8 w-8 text-pink-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "social",
      status: "available",
      popular: true,
      features: ["Instagram Shopping", "Publicações automáticas", "Análise de engajamento", "Catálogo de produtos"],
    },
    {
      id: "facebook",
      name: "Facebook",
      description:
        "Conecte sua loja ao Facebook Shop e alcance milhões de potenciais clientes. Sincronize produtos e gerencie vendas.",
      icon: <Facebook className="h-8 w-8 text-blue-600" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "social",
      status: "available",
      features: ["Facebook Shop", "Pixel para remarketing", "Catálogo de produtos", "Anúncios personalizados"],
    },
    {
      id: "webhooks",
      name: "Webhooks",
      description:
        "Configure webhooks para conectar sua loja a outros serviços e sistemas. Automatize processos e mantenha tudo sincronizado.",
      icon: <Webhook className="h-8 w-8 text-gray-700" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "developer",
      status: "available",
      features: [
        "Notificações em tempo real",
        "Integração com sistemas externos",
        "Automação de processos",
        "Logs detalhados",
      ],
    },
    {
      id: "google-shopping",
      name: "Google Shopping",
      description: "Exiba seus produtos nos resultados de pesquisa do Google e atraia mais clientes para sua loja.",
      icon: <ShoppingCart className="h-8 w-8 text-blue-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "marketing",
      status: "coming-soon",
      features: [
        "Listagem de produtos no Google",
        "Campanhas de produtos",
        "Análise de desempenho",
        "Sincronização automática",
      ],
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Integre com o Mailchimp para gerenciar suas campanhas de email marketing e automações.",
      icon: <Mail className="h-8 w-8 text-yellow-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "marketing",
      status: "available",
      features: [
        "Automação de emails",
        "Segmentação de clientes",
        "Templates personalizados",
        "Relatórios de campanhas",
      ],
    },
    {
      id: "mercado-pago",
      name: "Mercado Pago",
      description: "Processe pagamentos com o Mercado Pago, a solução de pagamentos do Mercado Livre.",
      icon: <CreditCard className="h-8 w-8 text-blue-400" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "payment",
      status: "available",
      features: ["Checkout transparente", "QR Code para pagamentos", "Parcelamento", "Múltiplos métodos de pagamento"],
    },
    {
      id: "telegram",
      name: "Telegram Bot",
      description: "Crie um bot no Telegram para atendimento automatizado e notificações para seus clientes.",
      icon: <MessageCircle className="h-8 w-8 text-blue-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "messaging",
      status: "coming-soon",
      features: ["Atendimento automatizado", "Notificações de pedidos", "Comandos personalizados", "Grupos de suporte"],
    },
    {
      id: "hubspot",
      name: "HubSpot CRM",
      description: "Integre com o HubSpot para gerenciar seus contatos, vendas e marketing em um só lugar.",
      icon: <Users className="h-8 w-8 text-orange-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "crm",
      status: "coming-soon",
      features: ["Gestão de contatos", "Pipeline de vendas", "Automação de marketing", "Relatórios personalizados"],
    },
    {
      id: "zapier",
      name: "Zapier",
      description:
        "Conecte sua loja a mais de 3.000 aplicativos sem precisar de código. Automatize tarefas e processos.",
      icon: <Zap className="h-8 w-8 text-orange-500" />,
      logo: "/placeholder.svg?height=60&width=60",
      category: "developer",
      status: "available",
      features: [
        "Integração com milhares de apps",
        "Automação sem código",
        "Fluxos de trabalho personalizados",
        "Triggers e ações",
      ],
    },
  ]

  // Categorias de integrações
  const categories = [
    { id: "all", name: "Todas" },
    { id: "messaging", name: "Mensagens" },
    { id: "payment", name: "Pagamentos" },
    { id: "social", name: "Redes Sociais" },
    { id: "marketing", name: "Marketing" },
    { id: "developer", name: "Desenvolvedor" },
    { id: "crm", name: "CRM" },
  ]

  // Filtrar integrações com base na categoria e pesquisa
  const filteredIntegrations = integrations
    .filter((integration) => activeCategory === "all" || integration.category === activeCategory)
    .filter(
      (integration) =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()),
    )

  // Ordenar integrações: populares primeiro, depois disponíveis, depois em breve
  const sortedIntegrations = [...filteredIntegrations].sort((a, b) => {
    if (a.popular && !b.popular) return -1
    if (!a.popular && b.popular) return 1
    if (a.status === "available" && b.status === "coming-soon") return -1
    if (a.status === "coming-soon" && b.status === "available") return 1
    return 0
  })

  const handleIntegrationClick = (integration) => {
    setSelectedIntegration(integration)
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Integrações</h1>
      <p className="text-gray-500 mb-6">
        Conecte sua loja a diversos serviços e plataformas para expandir seus negócios e automatizar processos.
      </p>

      {/* Pesquisa e Filtros */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar integrações..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
            <TabsList className="h-10">
              {categories.map((category) => (
                <TabsTrigger key={category.id} value={category.id} className="px-3">
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Lista de Integrações */}
      {sortedIntegrations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium mb-2">Nenhuma integração encontrada</h3>
          <p className="text-gray-500">Tente ajustar seus filtros ou termos de pesquisa.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {sortedIntegrations.map((integration) => (
            <IntegrationCard
              key={integration.id}
              integration={integration}
              onClick={() => handleIntegrationClick(integration)}
            />
          ))}
        </div>
      )}

      {/* Seção de Integrações Populares */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Integrações Recomendadas</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {integrations
            .filter((integration) => integration.popular)
            .map((integration) => (
              <Card
                key={integration.id}
                className="p-4 flex items-center gap-3 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleIntegrationClick(integration)}
              >
                <div className="h-10 w-10 flex-shrink-0">{integration.icon}</div>
                <div>
                  <h3 className="font-medium">{integration.name}</h3>
                  <p className="text-xs text-gray-500 truncate">{integration.category}</p>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {/* Modal de Detalhes da Integração */}
      {selectedIntegration && (
        <Dialog open={!!selectedIntegration} onOpenChange={() => setSelectedIntegration(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 flex-shrink-0">{selectedIntegration.icon}</div>
                <div>
                  <DialogTitle>{selectedIntegration.name}</DialogTitle>
                  <DialogDescription>
                    {selectedIntegration.status === "coming-soon" ? (
                      <Badge variant="outline" className="mt-1">
                        Em breve
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500 mt-1">Disponível</Badge>
                    )}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4">
              <p className="text-gray-700 mb-4">{selectedIntegration.description}</p>

              <h4 className="font-medium mb-2">Recursos principais:</h4>
              <ul className="space-y-2 mb-4">
                {selectedIntegration.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <DialogFooter>
              {selectedIntegration.status === "coming-soon" ? (
                <Button variant="outline">Receber notificação quando disponível</Button>
              ) : (
                <>
                  <Button variant="outline" className="gap-2">
                    <ExternalLink className="h-4 w-4" />
                    Documentação
                  </Button>
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Configurar Integração
                  </Button>
                </>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </div>
  )
}

// Componente de card de integração
function IntegrationCard({ integration, onClick }) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={onClick}>
      <div className="p-6 flex items-center gap-4">
        <div className="h-12 w-12 flex-shrink-0">{integration.icon}</div>
        <div>
          <h3 className="font-medium text-lg">{integration.name}</h3>
          <Badge
            variant={integration.status === "coming-soon" ? "outline" : "default"}
            className={integration.status === "coming-soon" ? "" : "bg-green-500"}
          >
            {integration.status === "coming-soon" ? "Em breve" : "Disponível"}
          </Badge>
        </div>
      </div>

      <div className="px-6 pb-6">
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{integration.description}</p>

        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-xs">
            {integration.category === "messaging"
              ? "Mensagens"
              : integration.category === "payment"
                ? "Pagamentos"
                : integration.category === "social"
                  ? "Redes Sociais"
                  : integration.category === "marketing"
                    ? "Marketing"
                    : integration.category === "developer"
                      ? "Desenvolvedor"
                      : integration.category === "crm"
                        ? "CRM"
                        : integration.category}
          </Badge>

          {integration.status === "available" ? (
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3 w-3" />
              Conectar
            </Button>
          ) : (
            <Button variant="outline" size="sm" disabled>
              Em breve
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

// Certifique-se de importar o ícone Users
import { Users } from "lucide-react"

