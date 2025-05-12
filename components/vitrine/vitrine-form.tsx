"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { AlertCircle, Check, Info, ExternalLink } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ColorPicker } from "@/components/ui/color-picker"
import type { Loja } from "@/types/loja"
import { useSession } from "next-auth/react"
import { PlanCardCompact } from "@/components/planos/plano-compact-card"
import { toast } from "@/components/ui/use-toast"

// Componente principal
export function VitrineForm({ loja }: { loja: Loja }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("geral")
  const router = useRouter()
  const { data: session } = useSession()
  const [isMobile, setIsMobile] = useState(false)

  // Detectar se é dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    // Verificar inicialmente
    checkMobile()

    // Adicionar listener para redimensionamento
    window.addEventListener("resize", checkMobile)

    // Limpar listener
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Verificação do plano premium baseada nos dados do usuário logado e da loja
  const isPremium =
    session?.user?.plano === "premium" || loja.plano === "premium" || loja.proprietarioPlano === "premium"

  console.log("Status do plano:", {
    userPlano: session?.user?.plano,
    lojaPlano: loja.plano,
    proprietarioPlano: loja.proprietarioPlano,
    isPremium,
  })

  // Estado do formulário
  const [formData, setFormData] = useState({
    titulo: loja.nome || "",
    descricao: loja.descricao || "",
    corPrimaria: "#3b82f6",
    corSecundaria: "#6366f1",
    corTexto: "#ffffff",
    corFundo: "#f8fafc",
    corDestaque: "#f59e0b",
    layout: "padrao",
    tema: "claro",
    mostrarProdutos: true,
    mostrarContato: true,
    mostrarEndereco: true,
    mostrarHorarios: true,
    mostrarRedesSociais: true,
    mostrarBanner: true,
    mostrarLogo: true,
    mostrarBusca: true,
    mostrarCategorias: true,
    mostrarPrecos: true,
    mostrarPromocoes: true,
    mostrarEstoque: false,
    mostrarAvaliacao: true,
    mostrarCompartilhar: true,
    mostrarWhatsapp: true,
    dominio: "",
    slug:
      loja.nome
        ?.toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "") || "",
    // Opções premium
    animacoes: isPremium ? true : false,
    efeitos: isPremium ? "fade" : "nenhum",
    fontePersonalizada: isPremium ? "Inter" : "padrao",
    widgetPromocao: {
      ativo: false,
      titulo: "Promoção Especial",
      descricao: "Aproveite 20% de desconto em todos os produtos!",
      corFundo: "#ffedd5",
      corTexto: "#9a3412",
    },
    widgetContador: {
      ativo: false,
      titulo: "Oferta por tempo limitado",
      dataFim: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm"),
      corFundo: "#fee2e2",
      corTexto: "#b91c1c",
    },
    widgetNewsletter: {
      ativo: false,
      titulo: "Assine nossa newsletter",
      descricao: "Receba novidades e promoções exclusivas no seu email",
      corFundo: "#dbeafe",
      corTexto: "#1e40af",
    },
    // Novas seções
    secaoDestaque: {
      ativo: false,
      titulo: "Produtos em Destaque",
      subtitulo: "Confira nossa seleção especial",
      produtos: [],
    },
    secaoSobre: {
      ativo: false,
      titulo: "Sobre Nossa Loja",
      conteudo: "Somos uma empresa comprometida com a qualidade e satisfação dos nossos clientes.",
      imagem: "",
    },
    secaoValores: {
      ativo: false,
      titulo: "Nossos Valores",
      valores: [
        {
          icone: "truck",
          titulo: "Entrega Rápida",
          descricao: "Entregamos em todo o Brasil com rapidez e segurança.",
        },
        {
          icone: "shield",
          titulo: "Compra Segura",
          descricao: "Seus dados estão protegidos em todas as etapas da compra.",
        },
        {
          icone: "award",
          titulo: "Qualidade Garantida",
          descricao: "Produtos de alta qualidade e com garantia.",
        },
      ],
    },
    // SEO
    metaTitulo: loja.nome || "",
    metaDescricao: loja.descricao || "",
    // Imagens
    bannerPrincipal: loja.banner || "",
    bannerSecundario: "",
    logoPersonalizado: loja.logo || "",
    iconePersonalizado: "",
  })

  // Carregar configurações existentes
  useEffect(() => {
    const fetchVitrineConfig = async () => {
      try {
        const response = await fetch(`/api/lojas/${loja._id}/vitrine`)
        if (response.ok) {
          const data = await response.json()
          if (data.vitrine) {
            setFormData((prev) => {
              const vitrineData = data.vitrine || {}
              return {
                ...prev,
                ...vitrineData,
                // Garantir que os objetos aninhados sejam preservados
                widgetPromocao: {
                  ...prev.widgetPromocao,
                  ...(vitrineData.widgetPromocao || {}),
                },
                widgetContador: {
                  ...prev.widgetContador,
                  ...(vitrineData.widgetContador || {}),
                },
                widgetNewsletter: {
                  ...prev.widgetNewsletter,
                  ...(vitrineData.widgetNewsletter || {}),
                },
                secaoDestaque: {
                  ...prev.secaoDestaque,
                  ...(vitrineData.secaoDestaque || {}),
                },
                secaoSobre: {
                  ...prev.secaoSobre,
                  ...(vitrineData.secaoSobre || {}),
                },
                secaoValores: {
                  ...prev.secaoValores,
                  ...(vitrineData.secaoValores || {}),
                },
              }
            })
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações da vitrine:", error)
      }
    }

    if (loja._id) {
      fetchVitrineConfig()
    }
  }, [loja._id])

  // Função para atualizar o estado do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Função para atualizar switches
  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }))
  }

  // Função para atualizar selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // Função para atualizar widgets
  const handleWidgetChange = (widget: string, field: string, value: any) => {
    setFormData((prev) => {
      const updatedForm = { ...prev }

      // Type-safe approach to update nested objects
      if (widget === "widgetPromocao" && typeof updatedForm.widgetPromocao === "object") {
        updatedForm.widgetPromocao = {
          ...updatedForm.widgetPromocao,
          [field]: value,
        }
      } else if (widget === "widgetContador" && typeof updatedForm.widgetContador === "object") {
        updatedForm.widgetContador = {
          ...updatedForm.widgetContador,
          [field]: value,
        }
      } else if (widget === "widgetNewsletter" && typeof updatedForm.widgetNewsletter === "object") {
        updatedForm.widgetNewsletter = {
          ...updatedForm.widgetNewsletter,
          [field]: value,
        }
      } else if (widget === "secaoDestaque" && typeof updatedForm.secaoDestaque === "object") {
        updatedForm.secaoDestaque = {
          ...updatedForm.secaoDestaque,
          [field]: value,
        }
      } else if (widget === "secaoSobre" && typeof updatedForm.secaoSobre === "object") {
        updatedForm.secaoSobre = {
          ...updatedForm.secaoSobre,
          [field]: value,
        }
      } else if (widget === "secaoValores" && typeof updatedForm.secaoValores === "object") {
        updatedForm.secaoValores = {
          ...updatedForm.secaoValores,
          [field]: value,
        }
      }

      return updatedForm
    })
  }

  // Função para salvar as configurações
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    try {
      console.log("Enviando dados para:", `/api/lojas/${loja._id}/vitrine`)

      // Alterado de POST para PUT, que é mais apropriado para atualizar recursos existentes
      const response = await fetch(`/api/lojas/${loja._id}/vitrine`, {
        method: "PUT", // Alterado de POST para PUT
        headers: {
          "Content-Type": "application/json",
          // Adicionar cabeçalhos para evitar cache
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify(formData),
      })

      // Verificar se a resposta está ok antes de tentar analisar o JSON
      if (!response.ok) {
        let errorMessage = "Erro ao salvar configurações"

        try {
          // Tentar analisar o JSON apenas se houver conteúdo
          const text = await response.text()
          console.log("Resposta de erro:", text)

          if (text) {
            try {
              const errorData = JSON.parse(text)
              errorMessage = errorData.error || errorMessage
            } catch (parseError) {
              console.error("Erro ao analisar JSON:", parseError)
              errorMessage = text || errorMessage
            }
          }
        } catch (parseError) {
          console.error("Erro ao analisar resposta:", parseError)
        }

        throw new Error(errorMessage)
      }

      // Tentar obter a resposta de sucesso
      try {
        const result = await response.json()
        console.log("Resposta de sucesso:", result)
      } catch (e) {
        console.log("Resposta vazia ou não-JSON")
      }

      // Exibir mensagem de sucesso mais visível
      setSuccess("Configurações salvas com sucesso!")

      // Exibir toast de confirmação
      toast({
        title: "Configurações salvas!",
        description: "Suas alterações foram salvas com sucesso.",
        // Use "default" em vez de "success" e adicione uma classe personalizada
        variant: "default",
        className: "bg-green-50 border-green-200 text-green-800",
      })

      // Exibir feedback visual temporário
      const formElement = document.querySelector("form")
      if (formElement) {
        formElement.classList.add("save-success-animation")
        setTimeout(() => {
          formElement.classList.remove("save-success-animation")
        }, 1000)
      }

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      setError(error instanceof Error ? error.message : "Erro ao salvar configurações")

      // Exibir toast de erro
      toast({
        title: "Erro ao salvar",
        description: error instanceof Error ? error.message : "Erro ao salvar configurações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Função para visualizar a vitrine - usando o ID da loja em vez do slug
  const handlePreview = () => {
    // Priorizar o ID da loja para garantir que a URL seja correta
    const vitrineUrl = `/vitrines/${loja._id}`
    window.open(vitrineUrl, "_blank")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-sm sm:text-base">Erro</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 border-green-300 text-green-800">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle className="text-sm sm:text-base font-bold">Salvo com sucesso!</AlertTitle>
          <AlertDescription className="text-xs sm:text-sm">{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-xl sm:text-2xl font-bold">Configurações da Vitrine</h1>
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <Button
            type="button"
            variant="outline"
            onClick={handlePreview}
            className="flex items-center gap-2 text-xs sm:text-sm h-9 sm:h-10 flex-1 md:flex-none"
          >
            <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            Visualizar Vitrine
          </Button>
          <Button type="submit" disabled={loading} className="text-xs sm:text-sm h-9 sm:h-10 flex-1 md:flex-none">
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      {/* Status do plano */}
      <PlanCardCompact className="mb-4" />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative w-full overflow-auto pb-2 mb-4 sm:mb-6">
          <TabsList className="inline-flex min-w-full w-max border-b-0">
            <TabsTrigger value="geral" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Geral
            </TabsTrigger>
            <TabsTrigger value="aparencia" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Aparência
            </TabsTrigger>
            <TabsTrigger value="conteudo" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Conteúdo
            </TabsTrigger>
            <TabsTrigger value="widgets" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Widgets
            </TabsTrigger>
            <TabsTrigger value="secoes" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Seções
            </TabsTrigger>
            <TabsTrigger value="avancado" className="text-xs sm:text-sm whitespace-nowrap flex-shrink-0">
              Avançado
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Informações Básicas</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure as informações principais da sua vitrine
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div>
                <Label htmlFor="titulo" className="text-sm sm:text-base">
                  Título da Vitrine
                </Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Nome da sua vitrine"
                  className="text-sm sm:text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="descricao" className="text-sm sm:text-base">
                  Descrição
                </Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descreva sua vitrine em poucas palavras"
                  rows={3}
                  className="text-sm sm:text-base mt-1 min-h-[80px] sm:min-h-[100px]"
                />
              </div>
              <div>
                <Label htmlFor="slug" className="text-sm sm:text-base">
                  URL da Vitrine
                </Label>
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-xs sm:text-sm text-gray-500 whitespace-nowrap">/vitrines/</div>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="minha-loja"
                    className="flex-1 text-sm sm:text-base"
                  />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">
                  Esta será a URL pública da sua vitrine. Use apenas letras minúsculas, números e hífens.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Elementos Visíveis</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Escolha quais elementos serão exibidos na sua vitrine
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarProdutos" className="text-sm sm:text-base">
                    Mostrar Produtos
                  </Label>
                  <Switch
                    id="mostrarProdutos"
                    checked={formData.mostrarProdutos}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarProdutos", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarContato" className="text-sm sm:text-base">
                    Mostrar Contato
                  </Label>
                  <Switch
                    id="mostrarContato"
                    checked={formData.mostrarContato}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarContato", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarEndereco" className="text-sm sm:text-base">
                    Mostrar Endereço
                  </Label>
                  <Switch
                    id="mostrarEndereco"
                    checked={formData.mostrarEndereco}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarEndereco", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarHorarios" className="text-sm sm:text-base">
                    Mostrar Horários
                  </Label>
                  <Switch
                    id="mostrarHorarios"
                    checked={formData.mostrarHorarios}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarHorarios", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarRedesSociais" className="text-sm sm:text-base">
                    Mostrar Redes Sociais
                  </Label>
                  <Switch
                    id="mostrarRedesSociais"
                    checked={formData.mostrarRedesSociais}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarRedesSociais", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarBanner" className="text-sm sm:text-base">
                    Mostrar Banner
                  </Label>
                  <Switch
                    id="mostrarBanner"
                    checked={formData.mostrarBanner}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarBanner", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarLogo" className="text-sm sm:text-base">
                    Mostrar Logo
                  </Label>
                  <Switch
                    id="mostrarLogo"
                    checked={formData.mostrarLogo}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarLogo", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarBusca" className="text-sm sm:text-base">
                    Mostrar Busca
                  </Label>
                  <Switch
                    id="mostrarBusca"
                    checked={formData.mostrarBusca}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarBusca", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarCategorias" className="text-sm sm:text-base">
                    Mostrar Categorias
                  </Label>
                  <Switch
                    id="mostrarCategorias"
                    checked={formData.mostrarCategorias}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarCategorias", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarPrecos" className="text-sm sm:text-base">
                    Mostrar Preços
                  </Label>
                  <Switch
                    id="mostrarPrecos"
                    checked={formData.mostrarPrecos}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarPrecos", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarPromocoes" className="text-sm sm:text-base">
                    Mostrar Promoções
                  </Label>
                  <Switch
                    id="mostrarPromocoes"
                    checked={formData.mostrarPromocoes}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarPromocoes", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarEstoque" className="text-sm sm:text-base">
                    Mostrar Estoque
                  </Label>
                  <Switch
                    id="mostrarEstoque"
                    checked={formData.mostrarEstoque}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarEstoque", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarAvaliacao" className="text-sm sm:text-base">
                    Mostrar Avaliações
                  </Label>
                  <Switch
                    id="mostrarAvaliacao"
                    checked={formData.mostrarAvaliacao}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarAvaliacao", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarCompartilhar" className="text-sm sm:text-base">
                    Mostrar Compartilhar
                  </Label>
                  <Switch
                    id="mostrarCompartilhar"
                    checked={formData.mostrarCompartilhar}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarCompartilhar", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarWhatsapp" className="text-sm sm:text-base">
                    Mostrar WhatsApp
                  </Label>
                  <Switch
                    id="mostrarWhatsapp"
                    checked={formData.mostrarWhatsapp}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarWhatsapp", checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Aparência */}
        <TabsContent value="aparencia" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Layout e Tema</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Escolha o layout e o tema da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div>
                <Label htmlFor="layout" className="text-sm sm:text-base">
                  Layout
                </Label>
                <Select value={formData.layout} onValueChange={(value) => handleSelectChange("layout", value)}>
                  <SelectTrigger className="mt-1 text-sm sm:text-base">
                    <SelectValue placeholder="Selecione um layout" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padrao">Padrão</SelectItem>
                    <SelectItem value="moderno">Moderno</SelectItem>
                    <SelectItem value="minimalista">Minimalista</SelectItem>
                    <SelectItem value="slider">Slider</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                    <SelectItem value="magazine">Magazine</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tema" className="text-sm sm:text-base">
                  Tema
                </Label>
                <Select value={formData.tema} onValueChange={(value) => handleSelectChange("tema", value)}>
                  <SelectTrigger className="mt-1 text-sm sm:text-base">
                    <SelectValue placeholder="Selecione um tema" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="claro">Claro</SelectItem>
                    <SelectItem value="escuro">Escuro</SelectItem>
                    <SelectItem value="personalizado">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="fontePersonalizada" className="text-sm sm:text-base">
                  Fonte
                </Label>
                <Select
                  value={formData.fontePersonalizada}
                  onValueChange={(value) => handleSelectChange("fontePersonalizada", value)}
                  disabled={!isPremium}
                >
                  <SelectTrigger className="mt-1 text-sm sm:text-base">
                    <SelectValue placeholder="Selecione uma fonte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="padrao">Padrão</SelectItem>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                    <SelectItem value="OpenSans">Open Sans</SelectItem>
                  </SelectContent>
                </Select>
                {!isPremium && (
                  <p className="text-xs text-amber-600 mt-1">
                    Personalização de fonte disponível apenas para planos Premium.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Cores</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Personalize as cores da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria" className="text-sm sm:text-base">
                  Cor Primária
                </Label>
                <ColorPicker
                  color={formData.corPrimaria}
                  onChange={(color) => handleSelectChange("corPrimaria", color)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corSecundaria" className="text-sm sm:text-base">
                  Cor Secundária
                </Label>
                <ColorPicker
                  color={formData.corSecundaria}
                  onChange={(color) => handleSelectChange("corSecundaria", color)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corTexto" className="text-sm sm:text-base">
                  Cor do Texto
                </Label>
                <ColorPicker color={formData.corTexto} onChange={(color) => handleSelectChange("corTexto", color)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corFundo" className="text-sm sm:text-base">
                  Cor de Fundo
                </Label>
                <ColorPicker color={formData.corFundo} onChange={(color) => handleSelectChange("corFundo", color)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corDestaque" className="text-sm sm:text-base">
                  Cor de Destaque
                </Label>
                <ColorPicker
                  color={formData.corDestaque}
                  onChange={(color) => handleSelectChange("corDestaque", color)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Animações</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure as animações da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="animacoes" className="text-sm sm:text-base">
                  Ativar Animações
                </Label>
                <Switch
                  id="animacoes"
                  checked={formData.animacoes}
                  onCheckedChange={(checked) => handleSwitchChange("animacoes", checked)}
                  disabled={!isPremium}
                />
              </div>
              {!isPremium && (
                <p className="text-xs text-amber-600">Animações disponíveis apenas para planos Premium.</p>
              )}
              {formData.animacoes && isPremium && (
                <div>
                  <Label htmlFor="efeitos" className="text-sm sm:text-base">
                    Tipo de Efeito
                  </Label>
                  <Select value={formData.efeitos} onValueChange={(value) => handleSelectChange("efeitos", value)}>
                    <SelectTrigger className="mt-1 text-sm sm:text-base">
                      <SelectValue placeholder="Selecione um efeito" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fade">Fade</SelectItem>
                      <SelectItem value="slide">Slide</SelectItem>
                      <SelectItem value="zoom">Zoom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Conteúdo */}
        <TabsContent value="conteudo" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Imagens</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure as imagens da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div>
                <Label htmlFor="bannerPrincipal" className="text-sm sm:text-base">
                  Banner Principal
                </Label>
                <Input
                  id="bannerPrincipal"
                  name="bannerPrincipal"
                  value={formData.bannerPrincipal}
                  onChange={handleChange}
                  placeholder="URL da imagem do banner principal"
                  className="mt-1 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Recomendado: 1920x480 pixels</p>
              </div>
              <div>
                <Label htmlFor="bannerSecundario" className="text-sm sm:text-base">
                  Banner Secundário
                </Label>
                <Input
                  id="bannerSecundario"
                  name="bannerSecundario"
                  value={formData.bannerSecundario}
                  onChange={handleChange}
                  placeholder="URL da imagem do banner secundário"
                  disabled={!isPremium}
                  className="mt-1 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Recomendado: 1200x300 pixels</p>
                {!isPremium && (
                  <p className="text-xs text-amber-600 mt-1">
                    Banner secundário disponível apenas para planos Premium.
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="logoPersonalizado" className="text-sm sm:text-base">
                  Logo Personalizado
                </Label>
                <Input
                  id="logoPersonalizado"
                  name="logoPersonalizado"
                  value={formData.logoPersonalizado}
                  onChange={handleChange}
                  placeholder="URL da imagem do logo personalizado"
                  className="mt-1 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Recomendado: 200x200 pixels</p>
              </div>
              <div>
                <Label htmlFor="iconePersonalizado" className="text-sm sm:text-base">
                  Ícone Personalizado
                </Label>
                <Input
                  id="iconePersonalizado"
                  name="iconePersonalizado"
                  value={formData.iconePersonalizado}
                  onChange={handleChange}
                  placeholder="URL da imagem do ícone personalizado"
                  disabled={!isPremium}
                  className="mt-1 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Recomendado: 32x32 pixels</p>
                {!isPremium && (
                  <p className="text-xs text-amber-600 mt-1">
                    Ícone personalizado disponível apenas para planos Premium.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">SEO</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure as informações para motores de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div>
                <Label htmlFor="metaTitulo" className="text-sm sm:text-base">
                  Título da Página
                </Label>
                <Input
                  id="metaTitulo"
                  name="metaTitulo"
                  value={formData.metaTitulo}
                  onChange={handleChange}
                  placeholder="Título para SEO"
                  className="mt-1 text-sm sm:text-base"
                />
              </div>
              <div>
                <Label htmlFor="metaDescricao" className="text-sm sm:text-base">
                  Descrição da Página
                </Label>
                <Textarea
                  id="metaDescricao"
                  name="metaDescricao"
                  value={formData.metaDescricao}
                  onChange={handleChange}
                  placeholder="Descrição para SEO"
                  rows={3}
                  className="mt-1 text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Widgets */}
        <TabsContent value="widgets" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Widget de Promoção</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure o banner de promoção</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="widgetPromocao.ativo" className="text-sm sm:text-base">
                  Ativar Widget de Promoção
                </Label>
                <Switch
                  id="widgetPromocao.ativo"
                  checked={formData.widgetPromocao.ativo}
                  onCheckedChange={(checked) => handleWidgetChange("widgetPromocao", "ativo", checked)}
                  disabled={!isPremium}
                />
              </div>
              {!isPremium && (
                <p className="text-xs text-amber-600">Widget de promoção disponível apenas para planos Premium.</p>
              )}
              {formData.widgetPromocao.ativo && isPremium && (
                <>
                  <div>
                    <Label htmlFor="widgetPromocao.titulo" className="text-sm sm:text-base">
                      Título
                    </Label>
                    <Input
                      id="widgetPromocao.titulo"
                      value={formData.widgetPromocao.titulo}
                      onChange={(e) => handleWidgetChange("widgetPromocao", "titulo", e.target.value)}
                      placeholder="Título da promoção"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widgetPromocao.descricao" className="text-sm sm:text-base">
                      Descrição
                    </Label>
                    <Input
                      id="widgetPromocao.descricao"
                      value={formData.widgetPromocao.descricao}
                      onChange={(e) => handleWidgetChange("widgetPromocao", "descricao", e.target.value)}
                      placeholder="Descrição da promoção"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetPromocao.corFundo" className="text-sm sm:text-base">
                      Cor de Fundo
                    </Label>
                    <ColorPicker
                      color={formData.widgetPromocao.corFundo}
                      onChange={(color) => handleWidgetChange("widgetPromocao", "corFundo", color)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetPromocao.corTexto" className="text-sm sm:text-base">
                      Cor do Texto
                    </Label>
                    <ColorPicker
                      color={formData.widgetPromocao.corTexto}
                      onChange={(color) => handleWidgetChange("widgetPromocao", "corTexto", color)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Widget de Contador</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure o contador regressivo</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="widgetContador.ativo" className="text-sm sm:text-base">
                  Ativar Widget de Contador
                </Label>
                <Switch
                  id="widgetContador.ativo"
                  checked={formData.widgetContador.ativo}
                  onCheckedChange={(checked) => handleWidgetChange("widgetContador", "ativo", checked)}
                  disabled={!isPremium}
                />
              </div>
              {!isPremium && (
                <p className="text-xs text-amber-600">Widget de contador disponível apenas para planos Premium.</p>
              )}
              {formData.widgetContador.ativo && isPremium && (
                <>
                  <div>
                    <Label htmlFor="widgetContador.titulo" className="text-sm sm:text-base">
                      Título
                    </Label>
                    <Input
                      id="widgetContador.titulo"
                      value={formData.widgetContador.titulo}
                      onChange={(e) => handleWidgetChange("widgetContador", "titulo", e.target.value)}
                      placeholder="Título do contador"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widgetContador.dataFim" className="text-sm sm:text-base">
                      Data de Término
                    </Label>
                    <Input
                      id="widgetContador.dataFim"
                      type="datetime-local"
                      value={formData.widgetContador.dataFim}
                      onChange={(e) => handleWidgetChange("widgetContador", "dataFim", e.target.value)}
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetContador.corFundo" className="text-sm sm:text-base">
                      Cor de Fundo
                    </Label>
                    <ColorPicker
                      color={formData.widgetContador.corFundo}
                      onChange={(color) => handleWidgetChange("widgetContador", "corFundo", color)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetContador.corTexto" className="text-sm sm:text-base">
                      Cor do Texto
                    </Label>
                    <ColorPicker
                      color={formData.widgetContador.corTexto}
                      onChange={(color) => handleWidgetChange("widgetContador", "corTexto", color)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Widget de Newsletter</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure o formulário de newsletter</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="widgetNewsletter.ativo" className="text-sm sm:text-base">
                  Ativar Widget de Newsletter
                </Label>
                <Switch
                  id="widgetNewsletter.ativo"
                  checked={formData.widgetNewsletter.ativo}
                  onCheckedChange={(checked) => handleWidgetChange("widgetNewsletter", "ativo", checked)}
                  disabled={!isPremium}
                />
              </div>
              {!isPremium && (
                <p className="text-xs text-amber-600">Widget de newsletter disponível apenas para planos Premium.</p>
              )}
              {formData.widgetNewsletter.ativo && isPremium && (
                <>
                  <div>
                    <Label htmlFor="widgetNewsletter.titulo" className="text-sm sm:text-base">
                      Título
                    </Label>
                    <Input
                      id="widgetNewsletter.titulo"
                      value={formData.widgetNewsletter.titulo}
                      onChange={(e) => handleWidgetChange("widgetNewsletter", "titulo", e.target.value)}
                      placeholder="Título da newsletter"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widgetNewsletter.descricao" className="text-sm sm:text-base">
                      Descrição
                    </Label>
                    <Input
                      id="widgetNewsletter.descricao"
                      value={formData.widgetNewsletter.descricao}
                      onChange={(e) => handleWidgetChange("widgetNewsletter", "descricao", e.target.value)}
                      placeholder="Descrição da newsletter"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetNewsletter.corFundo" className="text-sm sm:text-base">
                      Cor de Fundo
                    </Label>
                    <ColorPicker
                      color={formData.widgetNewsletter.corFundo}
                      onChange={(color) => handleWidgetChange("widgetNewsletter", "corFundo", color)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetNewsletter.corTexto" className="text-sm sm:text-base">
                      Cor do Texto
                    </Label>
                    <ColorPicker
                      color={formData.widgetNewsletter.corTexto}
                      onChange={(color) => handleWidgetChange("widgetNewsletter", "corTexto", color)}
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Seções */}
        <TabsContent value="secoes" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Seção de Valores</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure a seção de valores da empresa</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="secaoValores.ativo" className="text-sm sm:text-base">
                  Ativar Seção de Valores
                </Label>
                <Switch
                  id="secaoValores.ativo"
                  checked={formData.secaoValores?.ativo || false}
                  onCheckedChange={(checked) => handleWidgetChange("secaoValores", "ativo", checked)}
                  disabled={!isPremium}
                />
              </div>
              {!isPremium && (
                <p className="text-xs text-amber-600">Seção de valores disponível apenas para planos Premium.</p>
              )}
              {formData.secaoValores?.ativo && isPremium && (
                <>
                  <div>
                    <Label htmlFor="secaoValores.titulo" className="text-sm sm:text-base">
                      Título da Seção
                    </Label>
                    <Input
                      id="secaoValores.titulo"
                      value={formData.secaoValores.titulo}
                      onChange={(e) => handleWidgetChange("secaoValores", "titulo", e.target.value)}
                      placeholder="Título da seção de valores"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Seção Sobre</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Configure a seção sobre a empresa</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="secaoSobre.ativo" className="text-sm sm:text-base">
                  Ativar Seção Sobre
                </Label>
                <Switch
                  id="secaoSobre.ativo"
                  checked={formData.secaoSobre?.ativo || false}
                  onCheckedChange={(checked) => handleWidgetChange("secaoSobre", "ativo", checked)}
                />
              </div>
              {formData.secaoSobre?.ativo && (
                <>
                  <div>
                    <Label htmlFor="secaoSobre.titulo" className="text-sm sm:text-base">
                      Título da Seção
                    </Label>
                    <Input
                      id="secaoSobre.titulo"
                      value={formData.secaoSobre.titulo}
                      onChange={(e) => handleWidgetChange("secaoSobre", "titulo", e.target.value)}
                      placeholder="Título da seção sobre"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secaoSobre.conteudo" className="text-sm sm:text-base">
                      Conteúdo
                    </Label>
                    <Textarea
                      id="secaoSobre.conteudo"
                      value={formData.secaoSobre.conteudo}
                      onChange={(e) => handleWidgetChange("secaoSobre", "conteudo", e.target.value)}
                      placeholder="Conteúdo da seção sobre"
                      rows={4}
                      className="mt-1 text-sm sm:text-base min-h-[80px] sm:min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secaoSobre.imagem" className="text-sm sm:text-base">
                      URL da Imagem
                    </Label>
                    <Input
                      id="secaoSobre.imagem"
                      value={formData.secaoSobre.imagem}
                      onChange={(e) => handleWidgetChange("secaoSobre", "imagem", e.target.value)}
                      placeholder="URL da imagem da seção sobre"
                      className="mt-1 text-sm sm:text-base"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Avançado */}
        <TabsContent value="avancado" className="space-y-4 sm:space-y-6">
          <Card>
            <CardHeader className="px-4 sm:px-6 py-4 sm:py-6">
              <CardTitle className="text-lg sm:text-xl">Domínio Personalizado</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Configure um domínio personalizado para sua vitrine
              </CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6 py-2 sm:py-4 space-y-4">
              <div>
                <Label htmlFor="dominio" className="text-sm sm:text-base">
                  Domínio
                </Label>
                <Input
                  id="dominio"
                  name="dominio"
                  value={formData.dominio}
                  onChange={handleChange}
                  placeholder="exemplo.com.br"
                  disabled={!isPremium}
                  className="mt-1 text-sm sm:text-base"
                />
                <p className="text-xs sm:text-sm text-gray-500 mt-1">Insira apenas o domínio, sem http:// ou www.</p>
                {!isPremium && (
                  <p className="text-xs text-amber-600 mt-1">
                    Domínio personalizado disponível apenas para planos Premium.
                  </p>
                )}
              </div>
              {isPremium && (
                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertTitle className="text-sm sm:text-base">Configuração de DNS</AlertTitle>
                  <AlertDescription className="text-xs sm:text-sm">
                    Após salvar, você precisará configurar os registros DNS do seu domínio. Instruções serão enviadas
                    por email.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/dashboard")}
          className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10"
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={loading} className="w-full sm:w-auto text-xs sm:text-sm h-9 sm:h-10">
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>

      <style jsx global>{`
        .save-success-animation {
          animation: success-pulse 1s ease-in-out;
        }
        
        @keyframes success-pulse {
          0% { 
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); 
          }
          70% { 
            box-shadow: 0 0 0 10px rgba(34, 197, 94, 0); 
          }
          100% { 
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0); 
          }
        }
      `}</style>
    </form>
  )
}
