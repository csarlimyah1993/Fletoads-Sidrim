"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
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
import { Loader2, Search, ExternalLink, Lock, AlertCircle, CheckCircle, Info, Play, ArrowRight } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { useAuth } from "@/contexts/auth-context"

// Definição das integrações disponíveis com logos reais
const integracoesGoogle = [
  {
    id: "google-sheets",
    nome: "Google Sheets",
    descricao: "Sincronize dados com planilhas do Google para análises personalizadas.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-sheets-full-logo-1.svg",
    categoria: "dados",
    status: "disponivel",
    popular: true,
    suportado: true,
    configUrl: "https://console.cloud.google.com/apis/library/sheets.googleapis.com",
    videoTutorial: "https://www.youtube.com/watch?v=shctaaILCiU",
  },
  {
    id: "google-calendar",
    nome: "Google Calendar",
    descricao: "Sincronize eventos e agendamentos com o Google Calendar.",
    icone: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    categoria: "produtividade",
    status: "disponivel",
    popular: true,
    suportado: true,
    configUrl: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com",
    videoTutorial: "https://www.youtube.com/watch?v=VVq6XBjvufc",
  },
  {
    id: "google-drive",
    nome: "Google Drive",
    descricao: "Armazene e acesse arquivos na nuvem com o Google Drive.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-drive-icon-1.svg",
    categoria: "armazenamento",
    status: "disponivel",
    suportado: false,
  },
  {
    id: "google-analytics",
    nome: "Google Analytics",
    descricao: "Acompanhe métricas e desempenho do seu site com Google Analytics.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-analytics-4.svg",
    categoria: "analytics",
    status: "disponivel",
    suportado: false,
  },
  {
    id: "google-ads",
    nome: "Google Ads",
    descricao: "Crie e gerencie campanhas de anúncios no Google diretamente da plataforma.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-ads-2.svg",
    categoria: "ads",
    status: "premium",
    suportado: false,
  },
  {
    id: "google-my-business",
    nome: "Google Meu Negócio",
    descricao: "Gerencie sua presença nos resultados de busca e no Google Maps.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-my-business.svg",
    categoria: "presença",
    status: "premium",
    suportado: false,
  },
]

const integracoesOutras = [
  {
    id: "zapier",
    nome: "Zapier",
    descricao: "Conecte seus aplicativos favoritos e automatize tarefas repetitivas.",
    icone: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
    categoria: "automacao",
    status: "disponivel",
    popular: true,
    suportado: true,
    configUrl: "https://zapier.com/app/dashboard",
    videoTutorial: "https://www.youtube.com/watch?v=m1ALo-i5a4s",
  },
  {
    id: "mailchimp",
    nome: "Mailchimp",
    descricao: "Sincronize contatos e automatize campanhas de email marketing.",
    icone: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
    categoria: "email",
    status: "disponivel",
    suportado: true,
    configUrl: "https://admin.mailchimp.com/account/api/",
    videoTutorial: "https://www.youtube.com/watch?v=YFLodqEHbLI",
  },
  {
    id: "hubspot",
    nome: "HubSpot",
    descricao: "Integre com o HubSpot para gerenciar leads e clientes.",
    icone: "https://cdn.worldvectorlogo.com/logos/hubspot-1.svg",
    categoria: "crm",
    status: "disponivel",
    suportado: false,
  },
  {
    id: "slack",
    nome: "Slack",
    descricao: "Receba notificações e atualizações diretamente no Slack.",
    icone: "https://cdn.worldvectorlogo.com/logos/slack-new-logo.svg",
    categoria: "comunicacao",
    status: "disponivel",
    suportado: false,
  },
  {
    id: "trello",
    nome: "Trello",
    descricao: "Gerencie tarefas e projetos com integração ao Trello.",
    icone: "https://cdn.worldvectorlogo.com/logos/trello.svg",
    categoria: "produtividade",
    status: "premium",
    suportado: false,
  },
  {
    id: "facebook-ads",
    nome: "Facebook Ads",
    descricao: "Gerencie campanhas de anúncios no Facebook e Instagram.",
    icone: "https://cdn.worldvectorlogo.com/logos/facebook-ads.svg",
    categoria: "ads",
    status: "premium",
    suportado: false,
  },
]

// Limites de integrações por plano
const limitesPorPlano = {
  gratuito: 1,
  basico: 3,
  profissional: 10,
  premium: 999, // ilimitado
  empresarial: 999, // ilimitado
}

export default function IntegracoesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { user, isLoading: isLoadingUser, error: userError, refreshUserData } = useAuth()
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedIntegracao, setSelectedIntegracao] = useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isActivating, setIsActivating] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("google")
  const [showTutorialDialog, setShowTutorialDialog] = useState(false)
  const [tutorialIntegracao, setTutorialIntegracao] = useState<any>(null)

  // Estado para integrações ativas
  const [integracoesAtivas, setIntegracoesAtivas] = useState<any[]>([])
  const [isLoadingIntegracoes, setIsLoadingIntegracoes] = useState(true)
  const [apiPlanoInfo, setApiPlanoInfo] = useState<any>(null)

  // Forçar atualização dos dados do usuário ao carregar a página
  useEffect(() => {
    refreshUserData()
  }, [])

  // Determinar o plano do usuário - usar dados da API como fonte primária
  const planoUsuario = apiPlanoInfo?.planoUsuario || user?.plano || (session?.user?.plano as string) || "gratuito"

  // Log para depuração
  useEffect(() => {
    console.log("IntegracoesPage: Dados do usuário:", {
      apiPlanoInfo: apiPlanoInfo?.planoUsuario,
      userContextPlano: user?.plano,
      sessionPlano: session?.user?.plano,
      planoFinal: planoUsuario,
      isLoading: isLoadingUser,
      sessionStatus: session ? "authenticated" : "unauthenticated",
    })
  }, [user, session, planoUsuario, isLoadingUser, apiPlanoInfo])

  const limiteIntegracoes = limitesPorPlano[planoUsuario as keyof typeof limitesPorPlano] || limitesPorPlano.gratuito
  const integracoesRestantes = Math.max(0, limiteIntegracoes - integracoesAtivas.length)

  // Buscar integrações ativas
  useEffect(() => {
    const fetchIntegracoesAtivas = async () => {
      try {
        setIsLoadingIntegracoes(true)
        console.log("IntegracoesPage: Buscando integrações ativas...")

        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/integracoes-ativas?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        if (!response.ok) {
          throw new Error(`Erro ao buscar integrações ativas: ${response.status}`)
        }

        const data = await response.json()
        console.log("IntegracoesPage: Integrações ativas recebidas:", data)

        // Armazenar informações do plano da API
        setApiPlanoInfo({
          planoUsuario: data.planoUsuario,
          limiteIntegracoes: data.limiteIntegracoes,
          integracoesRestantes: data.integracoesRestantes,
        })

        setIntegracoesAtivas(data.integracoesAtivas || [])
      } catch (error) {
        console.error("IntegracoesPage: Erro ao buscar integrações:", error)
        toast.error("Erro ao carregar integrações. Por favor, tente novamente.")
      } finally {
        setIsLoadingIntegracoes(false)
      }
    }

    // Buscar integrações mesmo se o usuário ainda não estiver carregado
    fetchIntegracoesAtivas()

    // Adicionar um timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (isLoadingIntegracoes) {
        console.warn("IntegracoesPage: Timeout de segurança acionado para evitar loading infinito nas integrações")
        setIsLoadingIntegracoes(false)
      }
    }, 5000) // Reduzido para 5 segundos

    return () => clearTimeout(timeoutId)
  }, []) // Remover dependência de user para evitar loops

  // Filtrar integrações suportadas
  const integracoesGoogleSuportadas = integracoesGoogle.filter((integracao) => integracao.suportado)
  const integracoesOutrasSuportadas = integracoesOutras.filter((integracao) => integracao.suportado)

  // Filtrar integrações com base no termo de busca
  const filteredGoogle = integracoesGoogleSuportadas.filter(
    (integracao) =>
      integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredOutras = integracoesOutrasSuportadas.filter(
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

  // Verificar se o usuário tem acesso a integrações premium
  const temAcessoPremium = ["premium", "empresarial", "profissional"].includes(planoUsuario)

  // Abrir diálogo de ativação
  const openActivationDialog = (integracao: any) => {
    // Se a integração já estiver ativa, não faz nada
    if (isIntegracaoAtiva(integracao.id)) {
      toast.info(`A integração com ${integracao.nome} já está ativa`)
      return
    }

    // Se o usuário não pode ativar mais integrações
    if (!podeAtivarMais) {
      toast.error(`Você atingiu o limite de integrações do seu plano (${limiteIntegracoes})`)
      return
    }

    // Se a integração é premium e o usuário não tem acesso premium
    if (integracao.status === "premium" && !temAcessoPremium) {
      toast.error(`A integração com ${integracao.nome} requer um plano premium`)
      return
    }

    setSelectedIntegracao(integracao)
    setIsDialogOpen(true)
  }

  // Abrir diálogo de tutorial
  const openTutorialDialog = (integracao: any) => {
    setTutorialIntegracao(integracao)
    setShowTutorialDialog(true)
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

      toast.success(`Integração com ${selectedIntegracao.nome} ativada com sucesso!`)
      setIsDialogOpen(false)
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

      setDeactivatingId(integracaoId)

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

      toast.success(`Integração com ${nome} desativada com sucesso!`)
    } catch (error: any) {
      console.error("Erro ao desativar integração:", error)
      toast.error(error.message || "Erro ao desativar integração. Por favor, tente novamente.")
    } finally {
      setDeactivatingId(null)
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

    if (integracao.status === "premium" && !temAcessoPremium) {
      return (
        <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
          <Lock className="mr-1 h-3 w-3" /> Premium
        </Badge>
      )
    }

    return null
  }

  // Formatar nome do plano para exibição
  const formatarNomePlano = (plano: string) => {
    if (!plano) return "Carregando..."

    const planoFormatado = plano.charAt(0).toUpperCase() + plano.slice(1)
    return planoFormatado
  }

  // Mostrar estado de carregamento
  const isLoading = isLoadingUser && isLoadingIntegracoes

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Integrações</h2>
      </div>

      {userError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro ao carregar dados do usuário</AlertTitle>
          <AlertDescription>{userError}</AlertDescription>
        </Alert>
      )}

      {/* Card de informações do plano */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100 dark:from-blue-950/30 dark:to-indigo-950/30 dark:border-blue-900/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium flex items-center">
                <Info className="h-5 w-5 mr-2 text-blue-500" />
                Plano {formatarNomePlano(planoUsuario)}
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

      <Tabs defaultValue="google" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="google">Google</TabsTrigger>
          <TabsTrigger value="outras">Outras Integrações</TabsTrigger>
        </TabsList>

        <TabsContent value="google" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredGoogle.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium mb-2">Nenhuma integração encontrada</p>
                <p className="text-sm text-muted-foreground mb-4">Tente ajustar sua busca ou limpar os filtros</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredGoogle.map((integracao) => (
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

                    {/* Botões de acesso rápido */}
                    {integracao.configUrl && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 w-full"
                          onClick={() => window.open(integracao.configUrl, "_blank")}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Acessar {integracao.nome}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    {isIntegracaoAtiva(integracao.id) ? (
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950/50"
                          onClick={() => router.push(`/dashboard/integracoes/${integracao.id}/configurar`)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Configurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
                          onClick={() => deactivateIntegration(integracao.id, integracao.nome)}
                          disabled={deactivatingId === integracao.id}
                        >
                          {deactivatingId === integracao.id ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Desativando...
                            </>
                          ) : (
                            "Desativar"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full gap-2">
                        <Button
                          variant={integracao.status === "premium" && !temAcessoPremium ? "outline" : "default"}
                          size="sm"
                          className="w-full"
                          onClick={() => openActivationDialog(integracao)}
                          disabled={!podeAtivarMais || (integracao.status === "premium" && !temAcessoPremium)}
                        >
                          {integracao.status === "premium" && !temAcessoPremium ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" /> Requer Plano Premium
                            </>
                          ) : (
                            "Ativar Integração"
                          )}
                        </Button>

                        {integracao.videoTutorial && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openTutorialDialog(integracao)}
                          >
                            <Play className="mr-2 h-3 w-3" /> Ver Tutorial
                          </Button>
                        )}
                      </div>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outras" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredOutras.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium mb-2">Nenhuma integração encontrada</p>
                <p className="text-sm text-muted-foreground mb-4">Tente ajustar sua busca ou limpar os filtros</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredOutras.map((integracao) => (
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

                    {/* Botões de acesso rápido */}
                    {integracao.configUrl && (
                      <div className="mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs h-7 w-full"
                          onClick={() => window.open(integracao.configUrl, "_blank")}
                        >
                          <ExternalLink className="mr-1 h-3 w-3" />
                          Acessar {integracao.nome}
                        </Button>
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    {isIntegracaoAtiva(integracao.id) ? (
                      <div className="flex w-full gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 border-green-200 text-green-700 hover:bg-green-50 dark:border-green-900/50 dark:text-green-400 dark:hover:bg-green-950/50"
                          onClick={() => router.push(`/dashboard/integracoes/${integracao.id}/configurar`)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" /> Configurar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/50"
                          onClick={() => deactivateIntegration(integracao.id, integracao.nome)}
                          disabled={deactivatingId === integracao.id}
                        >
                          {deactivatingId === integracao.id ? (
                            <>
                              <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                              Desativando...
                            </>
                          ) : (
                            "Desativar"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col w-full gap-2">
                        <Button
                          variant={integracao.status === "premium" && !temAcessoPremium ? "outline" : "default"}
                          size="sm"
                          className="w-full"
                          onClick={() => openActivationDialog(integracao)}
                          disabled={!podeAtivarMais || (integracao.status === "premium" && !temAcessoPremium)}
                        >
                          {integracao.status === "premium" && !temAcessoPremium ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" /> Requer Plano Premium
                            </>
                          ) : (
                            "Ativar Integração"
                          )}
                        </Button>

                        {integracao.videoTutorial && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => openTutorialDialog(integracao)}
                          >
                            <Play className="mr-2 h-3 w-3" /> Ver Tutorial
                          </Button>
                        )}
                      </div>
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
                  alt={selectedIntegracao?.nome || ""}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium">{selectedIntegracao?.nome}</h4>
                <p className="text-sm text-muted-foreground">{selectedIntegracao?.descricao}</p>
              </div>
            </div>

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
          </div>

          <DialogFooter className="flex space-x-2 sm:justify-start">
            <Button type="button" variant="ghost" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
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
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de tutorial */}
      <Dialog open={showTutorialDialog} onOpenChange={setShowTutorialDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tutorial: {tutorialIntegracao?.nome}</DialogTitle>
            <DialogDescription>
              Aprenda como configurar e usar a integração com {tutorialIntegracao?.nome}.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col space-y-4 py-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
                <img
                  src={tutorialIntegracao?.icone || "/placeholder.svg"}
                  alt={tutorialIntegracao?.nome || ""}
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h4 className="font-medium">{tutorialIntegracao?.nome}</h4>
                <p className="text-sm text-muted-foreground">{tutorialIntegracao?.descricao}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-lg border p-4">
                <h4 className="font-medium mb-2">Opções de tutorial</h4>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => {
                      window.open(tutorialIntegracao?.videoTutorial, "_blank")
                      setShowTutorialDialog(false)
                    }}
                  >
                    <span className="flex items-center">
                      <Play className="mr-2 h-4 w-4" />
                      Ver tutorial em vídeo
                    </span>
                    <ExternalLink className="h-4 w-4" />
                  </Button>

                  <Button
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => {
                      router.push(`/dashboard/integracoes/${tutorialIntegracao?.id}/configurar`)
                      setShowTutorialDialog(false)
                    }}
                  >
                    <span className="flex items-center">
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Configuração guiada passo a passo
                    </span>
                  </Button>

                  {tutorialIntegracao?.configUrl && (
                    <Button
                      variant="outline"
                      className="w-full justify-between"
                      onClick={() => {
                        window.open(tutorialIntegracao?.configUrl, "_blank")
                        setShowTutorialDialog(false)
                      }}
                    >
                      <span className="flex items-center">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Acessar {tutorialIntegracao?.nome} diretamente
                      </span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => setShowTutorialDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
