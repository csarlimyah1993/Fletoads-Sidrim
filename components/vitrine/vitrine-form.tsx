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
import { AlertCircle, Check, Crown, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ColorPicker } from "@/components/ui/color-picker"
import type { Loja } from "@/types/loja"

// Componente principal
export function VitrineForm({ loja }: { loja: Loja }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [activeTab, setActiveTab] = useState("geral")
  const router = useRouter()

  // Verificar se o usuário tem plano premium - CORRIGIDO: Agora verifica múltiplas propriedades
  const isPremium = loja.plano === "premium" || loja.proprietarioPlano === "premium" || true // Temporariamente habilitado para todos os usuários

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
      const response = await fetch(`/api/lojas/${loja._id}/vitrine`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar configurações")
      }

      setSuccess("Configurações salvas com sucesso!")

      // Recarregar a página após 2 segundos
      setTimeout(() => {
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      setError(error instanceof Error ? error.message : "Erro ao salvar configurações")
    } finally {
      setLoading(false)
    }
  }

  // Função para visualizar a vitrine
  const handlePreview = () => {
    const vitrineUrl = formData.slug ? `/vitrines/${formData.slug}` : `/vitrines/${loja._id}`
    window.open(vitrineUrl, "_blank")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <Check className="h-4 w-4 text-green-500" />
          <AlertTitle>Sucesso</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Configurações da Vitrine</h1>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={handlePreview}>
            Visualizar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-blue-100 dark:border-blue-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-2 rounded-full">
            <Crown className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-medium">Status do Plano: {isPremium ? "Premium" : "Básico"}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isPremium
                ? "Você tem acesso a todos os recursos premium da vitrine."
                : "Faça upgrade para o plano Premium para desbloquear todos os recursos."}
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6 flex flex-wrap">
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="aparencia">Aparência</TabsTrigger>
          <TabsTrigger value="conteudo">Conteúdo</TabsTrigger>
          <TabsTrigger value="widgets">Widgets</TabsTrigger>
          <TabsTrigger value="secoes">Seções</TabsTrigger>
          <TabsTrigger value="avancado">Avançado</TabsTrigger>
        </TabsList>

        {/* Aba Geral */}
        <TabsContent value="geral" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Configure as informações principais da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="titulo">Título da Vitrine</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Nome da sua vitrine"
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  placeholder="Descreva sua vitrine em poucas palavras"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="slug">URL da Vitrine</Label>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-gray-500 whitespace-nowrap">/vitrines/</div>
                  <Input
                    id="slug"
                    name="slug"
                    value={formData.slug}
                    onChange={handleChange}
                    placeholder="minha-loja"
                    className="flex-1"
                  />
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Esta será a URL pública da sua vitrine. Use apenas letras minúsculas, números e hífens.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Elementos Visíveis</CardTitle>
              <CardDescription>Escolha quais elementos serão exibidos na sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarProdutos">Mostrar Produtos</Label>
                  <Switch
                    id="mostrarProdutos"
                    checked={formData.mostrarProdutos}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarProdutos", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarContato">Mostrar Contato</Label>
                  <Switch
                    id="mostrarContato"
                    checked={formData.mostrarContato}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarContato", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarEndereco">Mostrar Endereço</Label>
                  <Switch
                    id="mostrarEndereco"
                    checked={formData.mostrarEndereco}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarEndereco", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarHorarios">Mostrar Horários</Label>
                  <Switch
                    id="mostrarHorarios"
                    checked={formData.mostrarHorarios}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarHorarios", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarRedesSociais">Mostrar Redes Sociais</Label>
                  <Switch
                    id="mostrarRedesSociais"
                    checked={formData.mostrarRedesSociais}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarRedesSociais", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarBanner">Mostrar Banner</Label>
                  <Switch
                    id="mostrarBanner"
                    checked={formData.mostrarBanner}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarBanner", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarLogo">Mostrar Logo</Label>
                  <Switch
                    id="mostrarLogo"
                    checked={formData.mostrarLogo}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarLogo", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarBusca">Mostrar Busca</Label>
                  <Switch
                    id="mostrarBusca"
                    checked={formData.mostrarBusca}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarBusca", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarCategorias">Mostrar Categorias</Label>
                  <Switch
                    id="mostrarCategorias"
                    checked={formData.mostrarCategorias}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarCategorias", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarPrecos">Mostrar Preços</Label>
                  <Switch
                    id="mostrarPrecos"
                    checked={formData.mostrarPrecos}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarPrecos", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarPromocoes">Mostrar Promoções</Label>
                  <Switch
                    id="mostrarPromocoes"
                    checked={formData.mostrarPromocoes}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarPromocoes", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarEstoque">Mostrar Estoque</Label>
                  <Switch
                    id="mostrarEstoque"
                    checked={formData.mostrarEstoque}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarEstoque", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarAvaliacao">Mostrar Avaliações</Label>
                  <Switch
                    id="mostrarAvaliacao"
                    checked={formData.mostrarAvaliacao}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarAvaliacao", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarCompartilhar">Mostrar Compartilhar</Label>
                  <Switch
                    id="mostrarCompartilhar"
                    checked={formData.mostrarCompartilhar}
                    onCheckedChange={(checked) => handleSwitchChange("mostrarCompartilhar", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="mostrarWhatsapp">Mostrar WhatsApp</Label>
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
        <TabsContent value="aparencia" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Layout e Tema</CardTitle>
              <CardDescription>Escolha o layout e o tema da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="layout">Layout</Label>
                <Select value={formData.layout} onValueChange={(value) => handleSelectChange("layout", value)}>
                  <SelectTrigger>
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
                <Label htmlFor="tema">Tema</Label>
                <Select value={formData.tema} onValueChange={(value) => handleSelectChange("tema", value)}>
                  <SelectTrigger>
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
                <Label htmlFor="fontePersonalizada">Fonte</Label>
                <Select
                  value={formData.fontePersonalizada}
                  onValueChange={(value) => handleSelectChange("fontePersonalizada", value)}
                >
                  <SelectTrigger>
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
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Cores</CardTitle>
              <CardDescription>Personalize as cores da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="corPrimaria">Cor Primária</Label>
                <ColorPicker
                  color={formData.corPrimaria}
                  onChange={(color) => handleSelectChange("corPrimaria", color)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corSecundaria">Cor Secundária</Label>
                <ColorPicker
                  color={formData.corSecundaria}
                  onChange={(color) => handleSelectChange("corSecundaria", color)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corTexto">Cor do Texto</Label>
                <ColorPicker color={formData.corTexto} onChange={(color) => handleSelectChange("corTexto", color)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corFundo">Cor de Fundo</Label>
                <ColorPicker color={formData.corFundo} onChange={(color) => handleSelectChange("corFundo", color)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="corDestaque">Cor de Destaque</Label>
                <ColorPicker
                  color={formData.corDestaque}
                  onChange={(color) => handleSelectChange("corDestaque", color)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Animações</CardTitle>
              <CardDescription>Configure as animações da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="animacoes">Ativar Animações</Label>
                <Switch
                  id="animacoes"
                  checked={formData.animacoes}
                  onCheckedChange={(checked) => handleSwitchChange("animacoes", checked)}
                />
              </div>
              {formData.animacoes && (
                <div>
                  <Label htmlFor="efeitos">Tipo de Efeito</Label>
                  <Select value={formData.efeitos} onValueChange={(value) => handleSelectChange("efeitos", value)}>
                    <SelectTrigger>
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
        <TabsContent value="conteudo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagens</CardTitle>
              <CardDescription>Configure as imagens da sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bannerPrincipal">Banner Principal</Label>
                <Input
                  id="bannerPrincipal"
                  name="bannerPrincipal"
                  value={formData.bannerPrincipal}
                  onChange={handleChange}
                  placeholder="URL da imagem do banner principal"
                />
                <p className="text-sm text-gray-500 mt-1">Recomendado: 1920x480 pixels</p>
              </div>
              <div>
                <Label htmlFor="bannerSecundario">Banner Secundário</Label>
                <Input
                  id="bannerSecundario"
                  name="bannerSecundario"
                  value={formData.bannerSecundario}
                  onChange={handleChange}
                  placeholder="URL da imagem do banner secundário"
                />
                <p className="text-sm text-gray-500 mt-1">Recomendado: 1200x300 pixels</p>
              </div>
              <div>
                <Label htmlFor="logoPersonalizado">Logo Personalizado</Label>
                <Input
                  id="logoPersonalizado"
                  name="logoPersonalizado"
                  value={formData.logoPersonalizado}
                  onChange={handleChange}
                  placeholder="URL da imagem do logo personalizado"
                />
                <p className="text-sm text-gray-500 mt-1">Recomendado: 200x200 pixels</p>
              </div>
              <div>
                <Label htmlFor="iconePersonalizado">Ícone Personalizado</Label>
                <Input
                  id="iconePersonalizado"
                  name="iconePersonalizado"
                  value={formData.iconePersonalizado}
                  onChange={handleChange}
                  placeholder="URL da imagem do ícone personalizado"
                />
                <p className="text-sm text-gray-500 mt-1">Recomendado: 32x32 pixels</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>Configure as informações para motores de busca</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="metaTitulo">Título da Página</Label>
                <Input
                  id="metaTitulo"
                  name="metaTitulo"
                  value={formData.metaTitulo}
                  onChange={handleChange}
                  placeholder="Título para SEO"
                />
              </div>
              <div>
                <Label htmlFor="metaDescricao">Descrição da Página</Label>
                <Textarea
                  id="metaDescricao"
                  name="metaDescricao"
                  value={formData.metaDescricao}
                  onChange={handleChange}
                  placeholder="Descrição para SEO"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Widgets */}
        <TabsContent value="widgets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Widget de Promoção</CardTitle>
              <CardDescription>Configure o banner de promoção</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="widgetPromocao.ativo">Ativar Widget de Promoção</Label>
                <Switch
                  id="widgetPromocao.ativo"
                  checked={formData.widgetPromocao.ativo}
                  onCheckedChange={(checked) => handleWidgetChange("widgetPromocao", "ativo", checked)}
                />
              </div>
              {formData.widgetPromocao.ativo && (
                <>
                  <div>
                    <Label htmlFor="widgetPromocao.titulo">Título</Label>
                    <Input
                      id="widgetPromocao.titulo"
                      value={formData.widgetPromocao.titulo}
                      onChange={(e) => handleWidgetChange("widgetPromocao", "titulo", e.target.value)}
                      placeholder="Título da promoção"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widgetPromocao.descricao">Descrição</Label>
                    <Input
                      id="widgetPromocao.descricao"
                      value={formData.widgetPromocao.descricao}
                      onChange={(e) => handleWidgetChange("widgetPromocao", "descricao", e.target.value)}
                      placeholder="Descrição da promoção"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetPromocao.corFundo">Cor de Fundo</Label>
                    <ColorPicker
                      color={formData.widgetPromocao.corFundo}
                      onChange={(color) => handleWidgetChange("widgetPromocao", "corFundo", color)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetPromocao.corTexto">Cor do Texto</Label>
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
            <CardHeader>
              <CardTitle>Widget de Contador</CardTitle>
              <CardDescription>Configure o contador regressivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="widgetContador.ativo">Ativar Widget de Contador</Label>
                <Switch
                  id="widgetContador.ativo"
                  checked={formData.widgetContador.ativo}
                  onCheckedChange={(checked) => handleWidgetChange("widgetContador", "ativo", checked)}
                />
              </div>
              {formData.widgetContador.ativo && (
                <>
                  <div>
                    <Label htmlFor="widgetContador.titulo">Título</Label>
                    <Input
                      id="widgetContador.titulo"
                      value={formData.widgetContador.titulo}
                      onChange={(e) => handleWidgetChange("widgetContador", "titulo", e.target.value)}
                      placeholder="Título do contador"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widgetContador.dataFim">Data de Término</Label>
                    <Input
                      id="widgetContador.dataFim"
                      type="datetime-local"
                      value={formData.widgetContador.dataFim}
                      onChange={(e) => handleWidgetChange("widgetContador", "dataFim", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetContador.corFundo">Cor de Fundo</Label>
                    <ColorPicker
                      color={formData.widgetContador.corFundo}
                      onChange={(color) => handleWidgetChange("widgetContador", "corFundo", color)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetContador.corTexto">Cor do Texto</Label>
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
            <CardHeader>
              <CardTitle>Widget de Newsletter</CardTitle>
              <CardDescription>Configure o formulário de newsletter</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="widgetNewsletter.ativo">Ativar Widget de Newsletter</Label>
                <Switch
                  id="widgetNewsletter.ativo"
                  checked={formData.widgetNewsletter.ativo}
                  onCheckedChange={(checked) => handleWidgetChange("widgetNewsletter", "ativo", checked)}
                />
              </div>
              {formData.widgetNewsletter.ativo && (
                <>
                  <div>
                    <Label htmlFor="widgetNewsletter.titulo">Título</Label>
                    <Input
                      id="widgetNewsletter.titulo"
                      value={formData.widgetNewsletter.titulo}
                      onChange={(e) => handleWidgetChange("widgetNewsletter", "titulo", e.target.value)}
                      placeholder="Título da newsletter"
                    />
                  </div>
                  <div>
                    <Label htmlFor="widgetNewsletter.descricao">Descrição</Label>
                    <Input
                      id="widgetNewsletter.descricao"
                      value={formData.widgetNewsletter.descricao}
                      onChange={(e) => handleWidgetChange("widgetNewsletter", "descricao", e.target.value)}
                      placeholder="Descrição da newsletter"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetNewsletter.corFundo">Cor de Fundo</Label>
                    <ColorPicker
                      color={formData.widgetNewsletter.corFundo}
                      onChange={(color) => handleWidgetChange("widgetNewsletter", "corFundo", color)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="widgetNewsletter.corTexto">Cor do Texto</Label>
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
        <TabsContent value="secoes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Seção de Valores</CardTitle>
              <CardDescription>Configure a seção de valores da empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="secaoValores.ativo">Ativar Seção de Valores</Label>
                <Switch
                  id="secaoValores.ativo"
                  checked={formData.secaoValores?.ativo || false}
                  onCheckedChange={(checked) => handleWidgetChange("secaoValores", "ativo", checked)}
                />
              </div>
              {formData.secaoValores?.ativo && (
                <>
                  <div>
                    <Label htmlFor="secaoValores.titulo">Título da Seção</Label>
                    <Input
                      id="secaoValores.titulo"
                      value={formData.secaoValores.titulo}
                      onChange={(e) => handleWidgetChange("secaoValores", "titulo", e.target.value)}
                      placeholder="Título da seção de valores"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seção Sobre</CardTitle>
              <CardDescription>Configure a seção sobre a empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="secaoSobre.ativo">Ativar Seção Sobre</Label>
                <Switch
                  id="secaoSobre.ativo"
                  checked={formData.secaoSobre?.ativo || false}
                  onCheckedChange={(checked) => handleWidgetChange("secaoSobre", "ativo", checked)}
                />
              </div>
              {formData.secaoSobre?.ativo && (
                <>
                  <div>
                    <Label htmlFor="secaoSobre.titulo">Título da Seção</Label>
                    <Input
                      id="secaoSobre.titulo"
                      value={formData.secaoSobre.titulo}
                      onChange={(e) => handleWidgetChange("secaoSobre", "titulo", e.target.value)}
                      placeholder="Título da seção sobre"
                    />
                  </div>
                  <div>
                    <Label htmlFor="secaoSobre.conteudo">Conteúdo</Label>
                    <Textarea
                      id="secaoSobre.conteudo"
                      value={formData.secaoSobre.conteudo}
                      onChange={(e) => handleWidgetChange("secaoSobre", "conteudo", e.target.value)}
                      placeholder="Conteúdo da seção sobre"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="secaoSobre.imagem">URL da Imagem</Label>
                    <Input
                      id="secaoSobre.imagem"
                      value={formData.secaoSobre.imagem}
                      onChange={(e) => handleWidgetChange("secaoSobre", "imagem", e.target.value)}
                      placeholder="URL da imagem da seção sobre"
                    />
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Avançado */}
        <TabsContent value="avancado" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Domínio Personalizado</CardTitle>
              <CardDescription>Configure um domínio personalizado para sua vitrine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="dominio">Domínio</Label>
                <Input
                  id="dominio"
                  name="dominio"
                  value={formData.dominio}
                  onChange={handleChange}
                  placeholder="exemplo.com.br"
                />
                <p className="text-sm text-gray-500 mt-1">Insira apenas o domínio, sem http:// ou www.</p>
              </div>
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Configuração de DNS</AlertTitle>
                <AlertDescription>
                  Após salvar, você precisará configurar os registros DNS do seu domínio. Instruções serão enviadas por
                  email.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </form>
  )
}
