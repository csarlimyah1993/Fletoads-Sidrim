"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, Search, ExternalLink, Lock, AlertCircle, CheckCircle, Info } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

// Definição das integrações disponíveis com logos reais
const integracoesMarketing = [
  {
    id: "google-ads",
    nome: "Google Ads",
    descricao: "Crie e gerencie campanhas de anúncios no Google diretamente da plataforma.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-ads-2.svg",
    categoria: "ads",
    status: "disponivel",
    popular: true,
  },
  {
    id: "facebook-ads",
    nome: "Facebook Ads",
    descricao: "Gerencie campanhas de anúncios no Facebook e Instagram.",
    icone: "https://cdn.worldvectorlogo.com/logos/facebook-ads.svg",
    categoria: "ads",
    status: "disponivel",
    popular: true,
  },
  {
    id: "google-analytics",
    nome: "Google Analytics",
    descricao: "Acompanhe métricas e desempenho do seu site com Google Analytics.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg",
    categoria: "analytics",
    status: "disponivel",
  },
  {
    id: "mailchimp",
    nome: "Mailchimp",
    descricao: "Sincronize contatos e automatize campanhas de email marketing.",
    icone: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
    categoria: "email",
    status: "disponivel",
  },
  {
    id: "tiktok-ads",
    nome: "TikTok Ads",
    descricao: "Crie e gerencie campanhas de anúncios no TikTok.",
    icone: "https://cdn.worldvectorlogo.com/logos/tiktok-1.svg",
    categoria: "ads",
    status: "premium",
  },
  {
    id: "linkedin-ads",
    nome: "LinkedIn Ads",
    descricao: "Gerencie campanhas de anúncios no LinkedIn para alcançar profissionais.",
    icone: "https://cdn.worldvectorlogo.com/logos/linkedin-icon-2.svg",
    categoria: "ads",
    status: "premium",
  },
]

const integracoesFerramentas = [
  {
    id: "zapier",
    nome: "Zapier",
    descricao: "Conecte seus aplicativos favoritos e automatize tarefas repetitivas.",
    icone: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
    categoria: "automacao",
    status: "disponivel",
    popular: true,
  },
  {
    id: "google-sheets",
    nome: "Google Sheets",
    descricao: "Sincronize dados com planilhas do Google para análises personalizadas.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-sheets-full-logo-1.svg",
    categoria: "dados",
    status: "disponivel",
  },
  {
    id: "hubspot",
    nome: "HubSpot",
    descricao: "Integre com o HubSpot para gerenciar leads e clientes.",
    icone: "https://cdn.worldvectorlogo.com/logos/hubspot-1.svg",
    categoria: "crm",
    status: "disponivel",
  },
  {
    id: "slack",
    nome: "Slack",
    descricao: "Receba notificações e atualizações diretamente no Slack.",
    icone: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
    categoria: "comunicacao",
    status: "disponivel",
  },
  {
    id: "google-calendar",
    nome: "Google Calendar",
    descricao: "Sincronize eventos e agendamentos com o Google Calendar.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-calendar-2020-2.svg",
    categoria: "produtividade",
    status: "premium",
  },
  {
    id: "trello",
    nome: "Trello",
    descricao: "Gerencie tarefas e projetos com integração ao Trello.",
    icone: "https://cdn.worldvectorlogo.com/logos/trello.svg",
    categoria: "produtividade",
    status: "premium",
  },
]

// Limites de integrações por plano
const limitesPorPlano = {
  gratuito: 1,
  basico: 3,
  profissional: 10,
  empresarial: 999, // ilimitado
}

export default function IntegracoesPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIntegracao, setSelectedIntegracao] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [activeTab, setActiveTab] = useState("marketing")

  // Estado para informações do usuário e integrações ativas
  const [planoUsuario, setPlanoUsuario] = useState("gratuito")
  const [integracoesAtivas, setIntegracoesAtivas] = useState<any[]>([])
  const [limiteIntegracoes, setLimiteIntegracoes] = useState(1)
  const [integracoesRestantes, setIntegracoesRestantes] = useState(1)
  const [isLoading, setIsLoading] = useState(true)

  // Buscar informações do usuário e integrações ativas
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoading(true)

        const response = await fetch("/api/integracoes-ativas")

        if (!response.ok) {
          throw new Error("Erro ao buscar integrações ativas")
        }

        const data = await response.json()

        setPlanoUsuario(data.planoUsuario)
        setIntegracoesAtivas(data.integracoesAtivas || [])
        setLimiteIntegracoes(data.limiteIntegracoes)
        setIntegracoesRestantes(data.integracoesRestantes)
      } catch (error) {
        console.error("Erro ao buscar informações do usuário:", error)
        toast.error("Erro ao carregar informações do usuário")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserInfo()
  }, [])

  // Filtrar integrações com base no termo de busca
  const filteredMarketing = integracoesMarketing.filter(
    (integracao) =>
      integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredFerramentas = integracoesFerramentas.filter(
    (integracao) =>
      integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Verificar se o usuário pode ativar mais integrações
  const podeAtivarMais = integracoesRestantes > 0

  // Verificar se uma integração já está ativa
  const isIntegracaoAtiva = (id: string) => {
    return integracoesAtivas.some((integracao) => integracao.integracaoId === id)
  }

  // Obter o ID da integração ativa
  const getIntegracaoAtivaId = (id: string) => {
    const integracao = integracoesAtivas.find((integracao) => integracao.integracaoId === id)
    return integracao?._id
  }

  // Abrir diálogo de ativação
  const openActivationDialog = (integracao: any) => {
    // Se a integração já estiver ativa, não faz nada
    if (isIntegracaoAtiva(integracao.id)) {
      toast.info(`A integração com ${integracao.nome} já está ativa`)
      return
    }

    // Se o usuário não pode ativar mais integrações e a integração não é premium
    if (!podeAtivarMais && integracao.status !== "premium") {
      toast.error(`Você atingiu o limite de integrações do seu plano (${limiteIntegracoes})`)
      return
    }

    setSelectedIntegracao(integracao)
    setIsDialogOpen(true)
  }

  // Ativar integração
  const activateIntegration = async () => {
    if (!selectedIntegracao) return

    try {
      setIsActivating(true)

      const response = await fetch("/api/integracoes-ativas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integracaoId: selectedIntegracao.id,
          nome: selectedIntegracao.nome,
          configuracao: {},
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao ativar integração")
      }

      // Atualizar estado local
      setIntegracoesAtivas([...integracoesAtivas, data.integracao])
      setIntegracoesRestantes(data.integracoesRestantes)

      toast.success(`Integração com ${selectedIntegracao.nome} ativada com sucesso!`)
      setIsDialogOpen(false)

      // Redirecionar para a página de configuração da integração
      // router.push(`/dashboard/integracoes/${selectedIntegracao.id}/configurar`)
    } catch (error: any) {
      console.error("Erro ao ativar integração:", error)
      toast.error(error.message || "Erro ao ativar integração. Por favor, tente novamente.")
    } finally {
      setIsActivating(false)
    }
  }

  // Desativar integração
  const deactivateIntegration = async (integracaoId: string, nome: string) => {
    try {
      const id = getIntegracaoAtivaId(integracaoId)

      if (!id) {
        toast.error("Integração não encontrada")
        return
      }

      const response = await fetch(`/api/integracoes-ativas/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao desativar integração")
      }

      // Atualizar estado local
      const novasIntegracoesAtivas = integracoesAtivas.filter((integracao) => integracao._id !== id)
      setIntegracoesAtivas(novasIntegracoesAtivas)
      setIntegracoesRestantes(integracoesRestantes + 1)

      toast.success(`Integração com ${nome} desativada com sucesso!`)
    } catch (error: any) {
      console.error("Erro ao desativar integração:", error)
      toast.error(error.message || "Erro ao desativar integração. Por favor, tente novamente.")
    }
  }

  // Renderizar o status da integração
  const renderIntegrationStatus = (integracao: any) => {
    if (isIntegracaoAtiva(integracao.id)) {
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="mr-1 h-3 w-3" /> Ativa
        </Badge>
      )
    }

    if (integracao.status === "premium" && planoUsuario === "gratuito") {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Lock className="mr-1 h-3 w-3" /> Premium
        </Badge>
      )
    }

    return null
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Integrações</h2>
      </div>

      {/* Card de informações do plano */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Plano {planoUsuario.charAt(0).toUpperCase() + planoUsuario.slice(1)}
              </h3>
              <p className="text-sm text-muted-foreground">
                Você pode ativar até {limiteIntegracoes} {limiteIntegracoes === 1 ? "integração" : "integrações"} com
                seu plano atual.
              </p>
            </div>

            <div className="space-y-2 min-w-[200px]">
              <div className="flex justify-between text-sm">
                <span>Integrações utilizadas</span>
                <span className="font-medium">
                  {integracoesAtivas.length}/{limiteIntegracoes}
                </span>
              </div>
              <Progress value={(integracoesAtivas.length / limiteIntegracoes) * 100} className="h-2" />

              {planoUsuario === "gratuito" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-2 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-400 dark:hover:bg-blue-950/50"
                  onClick={() => router.push("/planos")}
                >
                  Fazer upgrade
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

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

      {!podeAtivarMais && planoUsuario === "gratuito" && (
        <Alert variant="destructive" className="bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900/50">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Limite de integrações atingido</AlertTitle>
          <AlertDescription>
            Seu plano gratuito permite apenas {limiteIntegracoes} integração ativa.
            <Button
              variant="link"
              className="p-0 h-auto text-red-700 font-medium hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
              onClick={() => router.push("/planos")}
            >
              Faça upgrade para ativar mais integrações.
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="marketing" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="marketing">Marketing</TabsTrigger>
          <TabsTrigger value="ferramentas">Ferramentas</TabsTrigger>
        </TabsList>

        <TabsContent value="marketing" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMarketing.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium mb-2">Nenhuma integração encontrada</p>
                <p className="text-sm text-muted-foreground mb-4">Tente ajustar sua busca ou limpar os filtros</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredMarketing.map((integracao) => (
                <Card
                  key={integracao.id}
                  className={`overflow-hidden transition-all hover:shadow-md ${
                    isIntegracaoAtiva(integracao.id)
                      ? "border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20"
                      : integracao.popular
                        ? "border-primary/20"
                        : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
                          <img
                            src={integracao.icone || "/placeholder.svg"}
                            alt={integracao.nome}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {integracao.nome}
                            {renderIntegrationStatus(integracao)}
                          </CardTitle>
                          <CardDescription>{integracao.categoria}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-10">{integracao.descricao}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {isIntegracaoAtiva(integracao.id) ? (
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950/50"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Configurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
                          onClick={() => deactivateIntegration(integracao.id, integracao.nome)}
                        >
                          Desativar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant={integracao.status === "premium" && planoUsuario === "gratuito" ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        onClick={() => openActivationDialog(integracao)}
                        disabled={!podeAtivarMais && integracao.status !== "premium"}
                      >
                        {integracao.status === "premium" && planoUsuario === "gratuito" ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" /> Requer Plano Premium
                          </>
                        ) : (
                          "Ativar Integração"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ferramentas" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredFerramentas.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium mb-2">Nenhuma integração encontrada</p>
                <p className="text-sm text-muted-foreground mb-4">Tente ajustar sua busca ou limpar os filtros</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredFerramentas.map((integracao) => (
                <Card
                  key={integracao.id}
                  className={`overflow-hidden transition-all hover:shadow-md ${
                    isIntegracaoAtiva(integracao.id)
                      ? "border-green-200 bg-green-50/30 dark:border-green-900/50 dark:bg-green-950/20"
                      : integracao.popular
                        ? "border-primary/20"
                        : ""
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
                          <img
                            src={integracao.icone || "/placeholder.svg"}
                            alt={integracao.nome}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div>
                          <CardTitle className="text-lg flex items-center">
                            {integracao.nome}
                            {renderIntegrationStatus(integracao)}
                          </CardTitle>
                          <CardDescription>{integracao.categoria}</CardDescription>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-10">{integracao.descricao}</p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    {isIntegracaoAtiva(integracao.id) ? (
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950/50"
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Configurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
                          onClick={() => deactivateIntegration(integracao.id, integracao.nome)}
                        >
                          Desativar
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant={integracao.status === "premium" && planoUsuario === "gratuito" ? "outline" : "default"}
                        size="sm"
                        className="w-full"
                        onClick={() => openActivationDialog(integracao)}
                        disabled={!podeAtivarMais && integracao.status !== "premium"}
                      >
                        {integracao.status === "premium" && planoUsuario === "gratuito" ? (
                          <>
                            <Lock className="mr-2 h-4 w-4" /> Requer Plano Premium
                          </>
                        ) : (
                          "Ativar Integração"
                        )}
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo de ativação de integração */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Ativar integração com {selectedIntegracao?.nome}</DialogTitle>
            <DialogDescription>
              Conecte sua conta {selectedIntegracao?.nome} para começar a usar esta integração.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
                <img
                  src={selectedIntegracao?.icone || "/placeholder.svg"}
                  alt={selectedIntegracao?.nome}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium">{selectedIntegracao?.nome}</h4>
                <p className="text-sm text-muted-foreground">{selectedIntegracao?.descricao}</p>
              </div>
            </div>

            {selectedIntegracao?.status === "premium" && planoUsuario === "gratuito" ? (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 dark:bg-amber-950/30 dark:border-amber-900/50">
                <p className="text-sm text-amber-800 dark:text-amber-300">
                  Esta integração requer um plano premium. Faça upgrade do seu plano para acessar este recurso.
                </p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => router.push("/planos")}>
                  Ver planos disponíveis
                </Button>
              </div>
            ) : (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 dark:bg-blue-950/30 dark:border-blue-900/50">
                <p className="text-sm text-blue-800 dark:text-blue-300">
                  Ao conectar sua conta {selectedIntegracao?.nome}, você concorda com os termos de serviço e política de
                  privacidade.
                </p>
                {planoUsuario === "gratuito" && (
                  <p className="text-sm text-blue-800 mt-2 font-medium dark:text-blue-300">
                    Atenção: Esta será a única integração disponível no seu plano gratuito.
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            {(selectedIntegracao?.status !== "premium" || planoUsuario !== "gratuito") && (
              <Button type="button" onClick={activateIntegration} disabled={isActivating} className="flex items-center">
                {isActivating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Conectando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Conectar com {selectedIntegracao?.nome}
                  </>
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )

// Adicionar estado para controle do modal de confirmação de exclusão e da instância a ser deletada
const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
const [instanceToDelete, setInstanceToDelete] = useState<any>(null)
const [isDeletingInstance, setIsDeletingInstance] = useState(false)

// Função para deletar instância WhatsApp
const handleDeleteWhatsappInstance = async (instance: any) => {
  setIsDeletingInstance(true)
  try {
    const response = await fetch(`/api/integracoes/whatsapp/${instance._id}`, {
      method: "DELETE",
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || "Erro ao excluir instância")
    }
    // Atualizar lista local removendo a instância deletada
    setIntegracoesAtivas((prev) => prev.filter((i) => i._id !== instance._id))
    toast.success("Instância excluída com sucesso!")
    setDeleteDialogOpen(false)
    setInstanceToDelete(null)
  } catch (error: any) {
    toast.error(error.message || "Erro ao excluir instância")
  } finally {
    setIsDeletingInstance(false)
  }
}

// Renderização das integrações do WhatsApp (exemplo, adapte conforme sua estrutura)
{integracoesAtivas
  .filter((i) => i.tipo === "whatsapp")
  .map((instance) => (
    <Card key={instance._id} className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
              <img src="/whatsapp-logo.svg" alt="WhatsApp" className="w-full h-full object-contain" />
            </div>
            <div>
              <CardTitle className="text-lg flex items-center">{instance.nomeInstancia}</CardTitle>
              <CardDescription>{instance.status}</CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2 mb-2 h-10">Integração WhatsApp</p>
      </CardContent>
      <CardFooter className="pt-0">
        <Button
          variant="outline"
          size="sm"
          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
          onClick={() => {
            if (instance.status === "conectado") {
              setInstanceToDelete(instance)
              setDeleteDialogOpen(true)
            } else {
              handleDeleteWhatsappInstance(instance)
            }
          }}
          disabled={isDeletingInstance}
        >
          Excluir
        </Button>
      </CardFooter>
    </Card>
  ))}

{/* Modal de confirmação para instância conectada */}
<Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Excluir Instância Conectada</DialogTitle>
      <DialogDescription>
        Esta instância está conectada. Ao excluir, você perderá todos os dados relacionados à integração. Tem certeza que deseja continuar?
      </DialogDescription>
    </DialogHeader>
    <DialogFooter>
      <Button variant="ghost" onClick={() => setDeleteDialogOpen(false)} disabled={isDeletingInstance}>
        Cancelar
      </Button>
      <Button
        variant="destructive"
        onClick={() => instanceToDelete && handleDeleteWhatsappInstance(instanceToDelete)}
        disabled={isDeletingInstance}
      >
        {isDeletingInstance ? "Excluindo..." : "Excluir Instância"}
      </Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
}
