"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ArrowLeft, Save, RefreshCw, ExternalLink, AlertCircle, ChevronRight, Play, Copy } from "lucide-react"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Steps, Step } from "@/components/ui/steps"

// Definições de configuração para cada tipo de integração
const integracoesConfig = {
  "google-sheets": {
    nome: "Google Sheets",
    descricao: "Sincronize dados com planilhas do Google para análises personalizadas.",
    icone: "https://cdn.worldvectorlogo.com/logos/google-sheets-full-logo-1.svg",
    configUrl: "https://console.cloud.google.com/apis/library/sheets.googleapis.com",
    campos: [
      {
        nome: "spreadsheetId",
        label: "ID da Planilha",
        tipo: "text",
        placeholder: "Insira o ID da planilha do Google Sheets",
        descricao: "O ID da planilha pode ser encontrado na URL da planilha.",
        obrigatorio: true,
      },
      {
        nome: "intervaloAtualizacao",
        label: "Intervalo de Atualização",
        tipo: "select",
        opcoes: [
          { valor: "5", label: "5 minutos" },
          { valor: "15", label: "15 minutos" },
          { valor: "30", label: "30 minutos" },
          { valor: "60", label: "1 hora" },
          { valor: "360", label: "6 horas" },
          { valor: "720", label: "12 horas" },
          { valor: "1440", label: "24 horas" },
        ],
        descricao: "Com que frequência os dados devem ser sincronizados.",
        obrigatorio: true,
      },
      {
        nome: "sincronizacaoAutomatica",
        label: "Sincronização Automática",
        tipo: "switch",
        descricao: "Ativar sincronização automática nos intervalos definidos.",
        obrigatorio: false,
      },
      {
        nome: "nomePlanilha",
        label: "Nome da Planilha",
        tipo: "text",
        placeholder: "Ex: Planilha1",
        descricao: "O nome da aba da planilha que contém os dados.",
        obrigatorio: false,
      },
      {
        nome: "intervalo",
        label: "Intervalo de Células",
        tipo: "text",
        placeholder: "Ex: A1:F20",
        descricao: "O intervalo de células a ser sincronizado (opcional).",
        obrigatorio: false,
      },
    ],
    documentacao: {
      titulo: "Como encontrar o ID da planilha do Google Sheets",
      descricao:
        "O ID da planilha é a parte da URL entre /d/ e /edit. Por exemplo, na URL https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit, o ID é 1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms.",
      linkTexto: "Documentação do Google Sheets API",
      linkUrl: "https://developers.google.com/sheets/api/guides/concepts",
    },
    exemplos: [
      {
        titulo: "Sincronizar produtos",
        descricao: "Sincronize automaticamente seus produtos com uma planilha do Google Sheets.",
        configuracao: {
          spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          intervaloAtualizacao: "60",
          sincronizacaoAutomatica: true,
          nomePlanilha: "Produtos",
          intervalo: "A1:G50",
        },
      },
      {
        titulo: "Relatório de vendas",
        descricao: "Exporte dados de vendas para uma planilha do Google Sheets.",
        configuracao: {
          spreadsheetId: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms",
          intervaloAtualizacao: "1440",
          sincronizacaoAutomatica: true,
          nomePlanilha: "Vendas",
          intervalo: "A1:E100",
        },
      },
    ],
    passoAPasso: [
      {
        titulo: "Acessar o Google Cloud Console",
        descricao: "Acesse o Google Cloud Console e crie um novo projeto ou selecione um existente.",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
        url: "https://console.cloud.google.com/",
      },
      {
        titulo: "Ativar a API do Google Sheets",
        descricao: "Na biblioteca de APIs, procure por 'Google Sheets API' e ative-a para seu projeto.",
        imagem: "https://cdn.worldvectorlogo.com/logos/google-sheets-full-logo-1.svg",
        url: "https://console.cloud.google.com/apis/library/sheets.googleapis.com",
      },
      {
        titulo: "Criar credenciais",
        descricao: "Crie credenciais OAuth 2.0 para acessar a API. Defina os escopos necessários.",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
        url: "https://console.cloud.google.com/apis/credentials",
      },
      {
        titulo: "Obter o ID da planilha",
        descricao: "Abra sua planilha no Google Sheets e copie o ID da URL (entre /d/ e /edit).",
        imagem: "https://cdn.worldvectorlogo.com/logos/google-sheets-full-logo-1.svg",
      },
    ],
    videoTutorial: "https://www.youtube.com/watch?v=shctaaILCiU",
  },
  "google-calendar": {
    nome: "Google Calendar",
    descricao: "Sincronize eventos e agendamentos com o Google Calendar.",
    icone: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
    configUrl: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com",
    campos: [
      {
        nome: "calendarId",
        label: "ID do Calendário",
        tipo: "text",
        placeholder: "Insira o ID do calendário",
        descricao: "O ID do calendário do Google Calendar.",
        obrigatorio: true,
      },
      {
        nome: "sincronizacaoBidirecional",
        label: "Sincronização Bidirecional",
        tipo: "switch",
        descricao: "Sincronizar eventos em ambas as direções.",
        obrigatorio: false,
      },
      {
        nome: "intervaloAtualizacao",
        label: "Intervalo de Atualização",
        tipo: "select",
        opcoes: [
          { valor: "5", label: "5 minutos" },
          { valor: "15", label: "15 minutos" },
          { valor: "30", label: "30 minutos" },
          { valor: "60", label: "1 hora" },
          { valor: "360", label: "6 horas" },
        ],
        descricao: "Com que frequência os eventos devem ser sincronizados.",
        obrigatorio: true,
      },
    ],
    documentacao: {
      titulo: "Como encontrar o ID do calendário do Google Calendar",
      descricao:
        "O ID do calendário pode ser encontrado nas configurações do Google Calendar. Para o calendário principal, geralmente é seu endereço de e-mail.",
      linkTexto: "Documentação do Google Calendar API",
      linkUrl: "https://developers.google.com/calendar/api/guides/overview",
    },
    exemplos: [
      {
        titulo: "Sincronizar eventos da loja",
        descricao: "Sincronize automaticamente os eventos da sua loja com o Google Calendar.",
        configuracao: {
          calendarId: "primary",
          sincronizacaoBidirecional: true,
          intervaloAtualizacao: "30",
        },
      },
      {
        titulo: "Agenda de atendimentos",
        descricao: "Mantenha uma agenda de atendimentos sincronizada com o Google Calendar.",
        configuracao: {
          calendarId: "seu-email@gmail.com",
          sincronizacaoBidirecional: true,
          intervaloAtualizacao: "15",
        },
      },
    ],
    passoAPasso: [
      {
        titulo: "Acessar o Google Cloud Console",
        descricao: "Acesse o Google Cloud Console e crie um novo projeto ou selecione um existente.",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
        url: "https://console.cloud.google.com/",
      },
      {
        titulo: "Ativar a API do Google Calendar",
        descricao: "Na biblioteca de APIs, procure por 'Google Calendar API' e ative-a para seu projeto.",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
        url: "https://console.cloud.google.com/apis/library/calendar-json.googleapis.com",
      },
      {
        titulo: "Criar credenciais",
        descricao: "Crie credenciais OAuth 2.0 para acessar a API. Defina os escopos necessários.",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/5/51/Google_Cloud_logo.svg",
        url: "https://console.cloud.google.com/apis/credentials",
      },
      {
        titulo: "Obter o ID do calendário",
        descricao:
          "Nas configurações do Google Calendar, encontre o ID. Para o calendário principal, use 'primary' ou seu e-mail.",
        imagem: "https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg",
        url: "https://calendar.google.com/calendar/u/0/r/settings",
      },
    ],
    videoTutorial: "https://www.youtube.com/watch?v=VVq6XBjvufc",
  },
  zapier: {
    nome: "Zapier",
    descricao: "Conecte seus aplicativos favoritos e automatize tarefas repetitivas.",
    icone: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
    configUrl: "https://zapier.com/app/dashboard",
    campos: [
      {
        nome: "webhookUrl",
        label: "URL do Webhook",
        tipo: "text",
        placeholder: "Insira a URL do webhook do Zapier",
        descricao: "A URL do webhook fornecida pelo Zapier.",
        obrigatorio: true,
      },
      {
        nome: "eventosTrigger",
        label: "Eventos para Acionar",
        tipo: "select",
        opcoes: [
          { valor: "novo_produto", label: "Novo Produto" },
          { valor: "nova_venda", label: "Nova Venda" },
          { valor: "novo_cliente", label: "Novo Cliente" },
          { valor: "atualizacao_estoque", label: "Atualização de Estoque" },
        ],
        descricao: "Evento que acionará o webhook do Zapier.",
        obrigatorio: true,
      },
      {
        nome: "ativoTrigger",
        label: "Ativar Trigger",
        tipo: "switch",
        descricao: "Ativar o envio de eventos para o Zapier.",
        obrigatorio: false,
      },
    ],
    documentacao: {
      titulo: "Como configurar um webhook no Zapier",
      descricao:
        "Para obter a URL do webhook, crie um novo Zap no Zapier e selecione 'Webhook by Zapier' como trigger. Escolha a opção 'Catch Hook' e copie a URL fornecida.",
      linkTexto: "Documentação do Zapier Webhooks",
      linkUrl: "https://zapier.com/help/create/code-webhooks/trigger-zaps-from-webhooks",
    },
    exemplos: [
      {
        titulo: "Notificar novas vendas",
        descricao: "Envie notificações para o Slack quando houver uma nova venda.",
        configuracao: {
          webhookUrl: "https://hooks.zapier.com/hooks/catch/123456/abcdef/",
          eventosTrigger: "nova_venda",
          ativoTrigger: true,
        },
      },
      {
        titulo: "Atualizar planilha com novos clientes",
        descricao: "Adicione automaticamente novos clientes a uma planilha do Google Sheets.",
        configuracao: {
          webhookUrl: "https://hooks.zapier.com/hooks/catch/123456/ghijkl/",
          eventosTrigger: "novo_cliente",
          ativoTrigger: true,
        },
      },
    ],
    passoAPasso: [
      {
        titulo: "Criar uma conta no Zapier",
        descricao: "Se você ainda não tem uma conta, crie uma no Zapier.",
        imagem: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
        url: "https://zapier.com/sign-up",
      },
      {
        titulo: "Criar um novo Zap",
        descricao: "No dashboard do Zapier, clique em 'Create Zap' para iniciar um novo fluxo de automação.",
        imagem: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
        url: "https://zapier.com/app/editor",
      },
      {
        titulo: "Configurar o Webhook",
        descricao: "Selecione 'Webhooks by Zapier' como trigger e escolha 'Catch Hook'. Copie a URL fornecida.",
        imagem: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
      },
      {
        titulo: "Configurar a ação",
        descricao:
          "Configure a ação que será executada quando o webhook for acionado (ex: enviar e-mail, adicionar linha em planilha).",
        imagem: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
      },
      {
        titulo: "Ativar o Zap",
        descricao: "Após testar o fluxo, ative o Zap para começar a receber eventos.",
        imagem: "https://cdn.worldvectorlogo.com/logos/zapier-1.svg",
      },
    ],
    videoTutorial: "https://www.youtube.com/watch?v=m1ALo-i5a4s",
  },
  mailchimp: {
    nome: "Mailchimp",
    descricao: "Sincronize contatos e automatize campanhas de email marketing.",
    icone: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
    configUrl: "https://admin.mailchimp.com/account/api/",
    campos: [
      {
        nome: "apiKey",
        label: "API Key",
        tipo: "password",
        placeholder: "Insira sua API Key do Mailchimp",
        descricao: "A chave de API do Mailchimp.",
        obrigatorio: true,
      },
      {
        nome: "listId",
        label: "ID da Lista",
        tipo: "text",
        placeholder: "Insira o ID da lista de contatos",
        descricao: "O ID da lista de contatos do Mailchimp.",
        obrigatorio: true,
      },
      {
        nome: "serverPrefix",
        label: "Prefixo do Servidor",
        tipo: "text",
        placeholder: "Ex: us1",
        descricao: "O prefixo do servidor do Mailchimp (ex: us1, us2).",
        obrigatorio: true,
      },
      {
        nome: "sincronizacaoAutomatica",
        label: "Sincronização Automática",
        tipo: "switch",
        descricao: "Sincronizar automaticamente novos clientes com o Mailchimp.",
        obrigatorio: false,
      },
    ],
    documentacao: {
      titulo: "Como encontrar sua API Key do Mailchimp",
      descricao:
        "Acesse sua conta do Mailchimp, vá para Account > Extras > API Keys e crie uma nova API Key ou use uma existente.",
      linkTexto: "Documentação da API do Mailchimp",
      linkUrl: "https://mailchimp.com/developer/marketing/api/root/",
    },
    exemplos: [
      {
        titulo: "Sincronizar clientes",
        descricao: "Sincronize automaticamente seus clientes com uma lista do Mailchimp.",
        configuracao: {
          apiKey: "your-api-key-here",
          listId: "abc123def456",
          serverPrefix: "us1",
          sincronizacaoAutomatica: true,
        },
      },
    ],
    passoAPasso: [
      {
        titulo: "Acessar configurações da conta",
        descricao: "Faça login no Mailchimp e acesse Account > Extras > API Keys.",
        imagem: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
        url: "https://admin.mailchimp.com/account/api/",
      },
      {
        titulo: "Criar uma API Key",
        descricao: "Clique em 'Create A Key' para gerar uma nova chave de API.",
        imagem: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
        url: "https://admin.mailchimp.com/account/api/",
      },
      {
        titulo: "Obter o ID da lista",
        descricao: "Acesse Audience > Settings > Audience name and defaults para encontrar o ID da lista.",
        imagem: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
        url: "https://admin.mailchimp.com/lists/",
      },
      {
        titulo: "Identificar o prefixo do servidor",
        descricao: "O prefixo do servidor está na sua URL do Mailchimp (ex: us1.admin.mailchimp.com).",
        imagem: "https://cdn.worldvectorlogo.com/logos/mailchimp.svg",
      },
    ],
    videoTutorial: "https://www.youtube.com/watch?v=YFLodqEHbLI",
  },
}

// Lista de integrações suportadas
const integracoesSuportadas = Object.keys(integracoesConfig)

export default function IntegracaoConfigClient({ integracaoId }: { integracaoId: string }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [activeTab, setActiveTab] = useState("configuracao")
  const [integracao, setIntegracao] = useState<any>(null)
  const [configuracao, setConfiguracao] = useState<Record<string, any>>({})
  const [error, setError] = useState<string | null>(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [wizardMode, setWizardMode] = useState(false)

  // Verificar se a integração é suportada
  const isSupported = integracoesSuportadas.includes(integracaoId)

  // Obter configuração da integração
  const configIntegracao = isSupported ? integracoesConfig[integracaoId as keyof typeof integracoesConfig] : null

  // Buscar dados da integração
  useEffect(() => {
    const fetchIntegracao = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar se a integração é suportada
        if (!isSupported) {
          setError(`Integração "${integracaoId}" não encontrada ou não suportada.`)
          setIsLoading(false)
          return
        }

        // Simular busca de dados da API
        setTimeout(() => {
          // Simular dados da integração
          const integracaoAtiva = {
            _id: "123456789",
            integracaoId: integracaoId,
            nome: configIntegracao?.nome,
            descricao: configIntegracao?.descricao,
            icone: configIntegracao?.icone,
            status: "ativa",
            configuracao: {},
            ultimaSincronizacao: null,
            proximaSincronizacao: null,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }

          setIntegracao(integracaoAtiva)
          setConfiguracao(integracaoAtiva.configuracao || {})
          setIsLoading(false)
        }, 1000)

        // Quando a API estiver pronta, descomente o código abaixo
        /*
        const response = await fetch(`/api/integracoes-ativas/por-id/${integracaoId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error(`Integração "${integracaoId}" não encontrada.`)
          }
          const errorData = await response.json()
          throw new Error(errorData.error || "Erro ao buscar dados da integração")
        }
        
        const data = await response.json()
        setIntegracao(data)
        setConfiguracao(data.configuracao || {})
        */
      } catch (error) {
        console.error("Erro ao buscar integração:", error)
        setError(error instanceof Error ? error.message : "Erro ao buscar dados da integração")
      } finally {
        setIsLoading(false)
      }
    }

    fetchIntegracao()
  }, [integracaoId, isSupported, configIntegracao])

  // Atualizar valor de um campo
  const handleFieldChange = (campo: string, valor: any) => {
    setConfiguracao((prev) => ({
      ...prev,
      [campo]: valor,
    }))
  }

  // Salvar configuração
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Validar campos obrigatórios
      const camposObrigatorios = configIntegracao?.campos
        .filter((campo) => campo.obrigatorio)
        .map((campo) => campo.nome)

      const camposFaltantes = camposObrigatorios?.filter((campo) => !configuracao[campo])

      if (camposFaltantes && camposFaltantes.length > 0) {
        throw new Error(`Campos obrigatórios não preenchidos: ${camposFaltantes.join(", ")}`)
      }

      // Simular salvamento
      setTimeout(() => {
        toast.success("Configuração salva com sucesso!")
        setIsSaving(false)
      }, 1000)

      // Quando a API estiver pronta, descomente o código abaixo
      /*
      const response = await fetch(`/api/integracoes-ativas/${integracao._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configuracao,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar configuração")
      }

      toast.success("Configuração salva com sucesso!")
      */
    } catch (error) {
      console.error("Erro ao salvar configuração:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configuração")
      setError(error instanceof Error ? error.message : "Erro ao salvar configuração")
    } finally {
      setIsSaving(false)
    }
  }

  // Testar integração
  const handleTest = async () => {
    try {
      setIsTesting(true)
      setError(null)

      // Simular teste
      setTimeout(() => {
        toast.success("Teste de integração realizado com sucesso!")
        setIsTesting(false)
      }, 1500)

      // Quando a API estiver pronta, descomente o código abaixo
      /*
      const response = await fetch(`/api/integracoes-ativas/${integracao._id}/testar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          configuracao,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao testar integração")
      }

      toast.success("Teste de integração realizado com sucesso!")
      */
    } catch (error) {
      console.error("Erro ao testar integração:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao testar integração")
      setError(error instanceof Error ? error.message : "Erro ao testar integração")
    } finally {
      setIsTesting(false)
    }
  }

  // Aplicar exemplo
  const handleApplyExample = (exemplo: any) => {
    setConfiguracao(exemplo.configuracao)
    toast.info("Exemplo aplicado! Não esqueça de salvar as alterações.")
  }

  // Copiar para a área de transferência
  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        toast.success(message || "Copiado para a área de transferência!")
      },
      (err) => {
        console.error("Erro ao copiar: ", err)
        toast.error("Erro ao copiar para a área de transferência")
      },
    )
  }

  // Avançar para o próximo passo no wizard
  const nextStep = () => {
    if (configIntegracao?.passoAPasso && currentStep < configIntegracao.passoAPasso.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  // Voltar para o passo anterior no wizard
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Renderizar campo de configuração
  const renderField = (campo: any) => {
    switch (campo.tipo) {
      case "text":
        return (
          <div key={campo.nome} className="space-y-2">
            <Label htmlFor={campo.nome}>
              {campo.label}
              {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
            </Label>
            <div className="flex gap-2">
              <Input
                id={campo.nome}
                placeholder={campo.placeholder}
                value={configuracao[campo.nome] || ""}
                onChange={(e) => handleFieldChange(campo.nome, e.target.value)}
                className="flex-1"
              />
              {configuracao[campo.nome] && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => copyToClipboard(configuracao[campo.nome], `${campo.label} copiado!`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Copiar valor</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
          </div>
        )
      case "password":
        return (
          <div key={campo.nome} className="space-y-2">
            <Label htmlFor={campo.nome}>
              {campo.label}
              {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Input
              id={campo.nome}
              type="password"
              placeholder={campo.placeholder}
              value={configuracao[campo.nome] || ""}
              onChange={(e) => handleFieldChange(campo.nome, e.target.value)}
            />
            {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
          </div>
        )
      case "textarea":
        return (
          <div key={campo.nome} className="space-y-2">
            <Label htmlFor={campo.nome}>
              {campo.label}
              {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Textarea
              id={campo.nome}
              placeholder={campo.placeholder}
              value={configuracao[campo.nome] || ""}
              onChange={(e) => handleFieldChange(campo.nome, e.target.value)}
              rows={4}
            />
            {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
          </div>
        )
      case "select":
        return (
          <div key={campo.nome} className="space-y-2">
            <Label htmlFor={campo.nome}>
              {campo.label}
              {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
            </Label>
            <Select
              value={configuracao[campo.nome] || ""}
              onValueChange={(value) => handleFieldChange(campo.nome, value)}
            >
              <SelectTrigger id={campo.nome}>
                <SelectValue placeholder={`Selecione ${campo.label.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {campo.opcoes.map((opcao: any) => (
                  <SelectItem key={opcao.valor} value={opcao.valor}>
                    {opcao.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
          </div>
        )
      case "switch":
        return (
          <div key={campo.nome} className="flex items-center justify-between space-y-0 rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor={campo.nome}>{campo.label}</Label>
              {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
            </div>
            <Switch
              id={campo.nome}
              checked={configuracao[campo.nome] || false}
              onCheckedChange={(checked) => handleFieldChange(campo.nome, checked)}
            />
          </div>
        )
      default:
        return null
    }
  }

  // Renderizar o wizard de configuração
  const renderWizard = () => {
    if (!configIntegracao?.passoAPasso) return null

    const currentPasso = configIntegracao.passoAPasso[currentStep]
    const totalSteps = configIntegracao.passoAPasso.length

    return (
      <div className="space-y-6">
        <Steps currentStep={currentStep} totalSteps={totalSteps}>
          {configIntegracao.passoAPasso.map((passo, index) => (
            <Step key={index} title={passo.titulo} />
          ))}
        </Steps>

        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold">
                {currentStep + 1}
              </span>
              {currentPasso.titulo}
            </CardTitle>
            <CardDescription>{currentPasso.descricao}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentPasso.imagem && (
              <div className="mb-4 rounded-md overflow-hidden border p-4 bg-muted/20 flex justify-center">
                <img
                  src={currentPasso.imagem || "/placeholder.svg"}
                  alt={currentPasso.titulo}
                  className="max-h-40 object-contain"
                />
              </div>
            )}

            {currentPasso.url && (
              <Button variant="outline" className="w-full mt-2" onClick={() => window.open(currentPasso.url, "_blank")}>
                <ExternalLink className="mr-2 h-4 w-4" />
                Acessar {currentPasso.titulo}
              </Button>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Anterior
            </Button>
            <Button onClick={nextStep} disabled={currentStep === totalSteps - 1}>
              Próximo <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        {currentStep === totalSteps - 1 && (
          <div className="flex justify-center">
            <Button variant="outline" className="mt-4" onClick={() => setWizardMode(false)}>
              Concluir e voltar para configuração
            </Button>
          </div>
        )}
      </div>
    )
  }

  // Se estiver carregando
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Se ocorreu um erro
  if (error) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/integracoes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Configuração de Integração</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <Button className="mt-4" onClick={() => router.push("/dashboard/integracoes")}>
          Voltar para Integrações
        </Button>
      </div>
    )
  }

  // Se a integração não for encontrada ou não for suportada
  if (!configIntegracao) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/integracoes")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Configuração de Integração</h2>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Integração não suportada</AlertTitle>
          <AlertDescription>
            A integração "{integracaoId}" não está disponível ou não é suportada pelo sistema.
          </AlertDescription>
        </Alert>

        <Button className="mt-4" onClick={() => router.push("/dashboard/integracoes")}>
          Voltar para Integrações
        </Button>
      </div>
    )
  }

  // Se estiver no modo wizard
  if (wizardMode) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2 mb-4">
          <Button variant="outline" size="icon" onClick={() => setWizardMode(false)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-3xl font-bold tracking-tight">Configuração Guiada: {configIntegracao.nome}</h2>
        </div>

        {renderWizard()}
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/integracoes")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Configuração de Integração</h2>
      </div>

      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 rounded overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-1">
          <img
            src={configIntegracao.icone || "/placeholder.svg"}
            alt={configIntegracao.nome}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h3 className="text-xl font-semibold flex items-center gap-2">
            {configIntegracao.nome}
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Ativa
            </Badge>
          </h3>
          <p className="text-sm text-muted-foreground">{configIntegracao.descricao}</p>
        </div>
      </div>

      {/* Botões de ação rápida */}
      <div className="flex flex-wrap gap-2">
        {configIntegracao.configUrl && (
          <Button variant="outline" size="sm" onClick={() => window.open(configIntegracao.configUrl, "_blank")}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Acessar {configIntegracao.nome}
          </Button>
        )}

        {configIntegracao.passoAPasso && (
          <Button variant="outline" size="sm" onClick={() => setWizardMode(true)}>
            <Play className="mr-2 h-4 w-4" />
            Configuração Guiada
          </Button>
        )}

        {configIntegracao.videoTutorial && (
          <Button variant="outline" size="sm" onClick={() => window.open(configIntegracao.videoTutorial, "_blank")}>
            <Play className="mr-2 h-4 w-4" />
            Ver Tutorial em Vídeo
          </Button>
        )}
      </div>

      <Tabs defaultValue="configuracao" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="configuracao">Configuração</TabsTrigger>
          <TabsTrigger value="exemplos">Exemplos</TabsTrigger>
          <TabsTrigger value="passoAPasso">Passo a Passo</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações da Integração</CardTitle>
              <CardDescription>Configure os parâmetros necessários para a integração funcionar.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {configIntegracao.campos.map((campo) => renderField(campo))}
            </CardContent>
            <CardFooter className="flex justify-between">
              <div className="flex space-x-2">
                <Button variant="outline" onClick={() => router.push("/dashboard/integracoes")}>
                  Cancelar
                </Button>
                <Button variant="outline" onClick={handleTest} disabled={isTesting}>
                  {isTesting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Testando...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Testar Conexão
                    </>
                  )}
                </Button>
              </div>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Salvar Configuração
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentação</CardTitle>
              <CardDescription>Recursos úteis para configurar esta integração.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">{configIntegracao.documentacao.titulo}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{configIntegracao.documentacao.descricao}</p>
                  <Button variant="outline" size="sm" className="mt-2" asChild>
                    <a href={configIntegracao.documentacao.linkUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      {configIntegracao.documentacao.linkTexto}
                    </a>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exemplos" className="space-y-4">
          {configIntegracao.exemplos && configIntegracao.exemplos.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {configIntegracao.exemplos.map((exemplo: any, index: number) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle>{exemplo.titulo}</CardTitle>
                    <CardDescription>{exemplo.descricao}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Configuração:</h4>
                      <pre className="bg-muted p-2 rounded-md text-xs overflow-auto">
                        {JSON.stringify(exemplo.configuracao, null, 2)}
                      </pre>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm" className="w-full" onClick={() => handleApplyExample(exemplo)}>
                      Aplicar este exemplo
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium mb-2">Nenhum exemplo disponível</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Não há exemplos de configuração para esta integração.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="passoAPasso" className="space-y-4">
          {configIntegracao.passoAPasso && configIntegracao.passoAPasso.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Guia de Configuração Passo a Passo</CardTitle>
                <CardDescription>Siga estas instruções para configurar sua integração corretamente.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {configIntegracao.passoAPasso.map((passo: any, index: number) => (
                    <div key={index} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-base mb-1">{passo.titulo}</h4>
                        <p className="text-sm text-muted-foreground mb-2">{passo.descricao}</p>
                        {passo.imagem && (
                          <div className="mt-2 rounded-md overflow-hidden border p-2 bg-muted/20 w-full max-w-xs">
                            <img
                              src={passo.imagem || "/placeholder.svg"}
                              alt={passo.titulo}
                              className="w-full h-auto object-contain"
                            />
                          </div>
                        )}
                        {passo.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => window.open(passo.url, "_blank")}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Acessar {passo.titulo}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center">
                  <Button onClick={() => setWizardMode(true)}>
                    <Play className="mr-2 h-4 w-4" />
                    Iniciar Configuração Guiada
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64 text-center">
                <p className="text-lg font-medium mb-2">Guia não disponível</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Não há um guia passo a passo para esta integração ainda.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Sincronização</CardTitle>
              <CardDescription>Histórico de sincronizações e eventos da integração.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border p-4 text-center">
                <p className="text-muted-foreground">Nenhum log disponível ainda.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Os logs serão exibidos aqui após a primeira sincronização.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
