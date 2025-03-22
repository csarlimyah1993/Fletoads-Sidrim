"use client"

import type React from "react"
import type { Loja } from "@/types/loja"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Upload, ExternalLink, Info } from "lucide-react"
import { getPlanoDoUsuario } from "@/lib/planos"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface VitrinePersonalizacaoFormProps {
  loja: Loja
}

export function VitrinePersonalizacaoForm({ loja }: VitrinePersonalizacaoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [dbError, setDbError] = useState<boolean>(false)

  // Garantir que planoId seja uma string
  const planoId = typeof loja.planoId === "string" ? loja.planoId : "gratis"
  const plano = getPlanoDoUsuario(planoId)
  const isPlanoPago = plano.id !== "gratis"

  // Garantir que widgets seja sempre um array
  const initialWidgets = Array.isArray(loja.widgets) ? loja.widgets : ["produtos"]

  const [formData, setFormData] = useState({
    banner: loja.banner || "",
    logo: loja.logo || "",
    cores: {
      primaria: loja.cores?.primaria || "#4f46e5",
      secundaria: loja.cores?.secundaria || "#f9fafb",
      texto: loja.cores?.texto || "#111827",
      destaque: loja.cores?.destaque || "#10b981",
    },
    layout: loja.layout || "padrao",
    fonte: loja.fonte || "inter",
    animacoes: loja.animacoes || false,
    widgets: initialWidgets,
  })

  // Verificar a conexão com o banco de dados ao carregar o componente
  useEffect(() => {
    const checkDbConnection = async () => {
      try {
        const response = await fetch("/api/health")
        const data = await response.json()
        setDbError(data.services?.database !== "up")
      } catch (error) {
        console.error("Erro ao verificar conexão com o banco de dados:", error)
        setDbError(true)
      }
    }

    checkDbConnection()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleWidgetToggle = (widget: string) => {
    setFormData((prev) => {
      // Garantir que widgets seja sempre um array
      const currentWidgets = Array.isArray(prev.widgets) ? prev.widgets : []

      if (currentWidgets.includes(widget)) {
        return { ...prev, widgets: currentWidgets.filter((w) => w !== widget) }
      } else {
        // Verificar se já atingiu o limite de widgets
        if (currentWidgets.length >= plano.personalizacaoVitrine.widgets) {
          toast({
            title: "Limite de widgets atingido",
            description: `Seu plano permite apenas ${plano.personalizacaoVitrine.widgets} widget(s).`,
            variant: "destructive",
          })
          return prev
        }
        return { ...prev, widgets: [...currentWidgets, widget] }
      }
    })
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", "banner")
      formData.append("lojaId", loja._id.toString())

      console.log("Enviando banner para upload:", file.name)

      const response = await fetch("/api/upload/loja-imagem", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao fazer upload da imagem")
      }

      const data = await response.json()
      console.log("Upload bem-sucedido, URL:", data.url)

      setFormData((prev) => ({
        ...prev,
        banner: data.url,
      }))

      toast({
        title: "Sucesso",
        description: "Banner enviado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setUploadError("Não foi possível fazer o upload da imagem. Tente novamente.")
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadError(null)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", "logo")
      formData.append("lojaId", loja._id.toString())

      console.log("Enviando logo para upload:", file.name)

      const response = await fetch("/api/upload/loja-imagem", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao fazer upload da imagem")
      }

      const data = await response.json()
      console.log("Upload bem-sucedido, URL:", data.url)

      setFormData((prev) => ({
        ...prev,
        logo: data.url,
      }))

      toast({
        title: "Sucesso",
        description: "Logo enviado com sucesso!",
      })
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setUploadError("Não foi possível fazer o upload da imagem. Tente novamente.")
      toast({
        title: "Erro",
        description: "Não foi possível fazer o upload da imagem. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      console.log("Enviando dados:", formData)

      const response = await fetch("/api/loja/vitrine", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const responseData = await response.json()
        console.error("Erro na resposta:", responseData)
        throw new Error(responseData.error || "Falha ao salvar personalização")
      }

      const responseData = await response.json()
      console.log("Resposta do servidor:", responseData)

      toast({
        title: "Sucesso",
        description: "Personalização da vitrine salva com sucesso!",
      })

      // Forçar um recarregamento completo para garantir que as alterações sejam aplicadas
      window.location.href = `/vitrine/${loja._id}`
    } catch (error) {
      console.error("Erro ao salvar personalização:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar a personalização. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const vitrineUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/vitrine/${loja._id}`

  // Layouts disponíveis com base no plano
  const layoutsDisponiveis = [
    { id: "padrao", nome: "Padrão" },
    { id: "moderno", nome: "Moderno" },
  ]

  // Adicionar layouts extras para planos pagos
  if (plano.personalizacaoVitrine.layouts >= 4) {
    layoutsDisponiveis.push({ id: "elegante", nome: "Elegante" })
    layoutsDisponiveis.push({ id: "minimalista", nome: "Minimalista" })
  }

  if (plano.personalizacaoVitrine.layouts >= 6) {
    layoutsDisponiveis.push({ id: "boutique", nome: "Boutique" })
    layoutsDisponiveis.push({ id: "corporativo", nome: "Corporativo" })
  }

  if (plano.personalizacaoVitrine.layouts >= 8) {
    layoutsDisponiveis.push({ id: "premium", nome: "Premium" })
    layoutsDisponiveis.push({ id: "luxo", nome: "Luxo" })
  }

  // Fontes disponíveis (apenas para planos pagos)
  const fontesDisponiveis = [
    { id: "inter", nome: "Inter (Padrão)" },
    { id: "roboto", nome: "Roboto" },
    { id: "poppins", nome: "Poppins" },
    { id: "montserrat", nome: "Montserrat" },
    { id: "opensans", nome: "Open Sans" },
  ]

  // Widgets disponíveis
  const widgetsDisponiveis = [
    { id: "produtos", nome: "Produtos em Destaque", descricao: "Exibe seus produtos mais populares" },
    { id: "promocoes", nome: "Promoções", descricao: "Destaca suas ofertas especiais" },
    { id: "contato", nome: "Formulário de Contato", descricao: "Permite que clientes entrem em contato facilmente" },
    { id: "mapa", nome: "Mapa de Localização", descricao: "Mostra onde sua loja está localizada" },
    { id: "depoimentos", nome: "Depoimentos", descricao: "Exibe avaliações de clientes", apenasPlanosPagos: true },
    { id: "newsletter", nome: "Newsletter", descricao: "Captura emails para marketing", apenasPlanosPagos: true },
    {
      id: "redesSociais",
      nome: "Redes Sociais",
      descricao: "Integração com suas redes sociais",
      apenasPlanosPagos: true,
    },
    { id: "galeria", nome: "Galeria de Fotos", descricao: "Mostra imagens da sua loja", apenasPlanosPagos: true },
  ]

  // Garantir que widgets seja sempre um array para evitar erros
  const currentWidgets = Array.isArray(formData.widgets) ? formData.widgets : []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personalização da Vitrine</CardTitle>
          <CardDescription>Personalize a aparência da sua vitrine online para atrair mais clientes.</CardDescription>
        </CardHeader>
        <CardContent>
          {dbError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Problema de conexão com o banco de dados. Algumas funcionalidades podem estar indisponíveis. Tente
                novamente mais tarde ou entre em contato com o suporte.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-medium">Sua vitrine online</h3>
              <p className="text-sm text-muted-foreground">Compartilhe sua vitrine com seus clientes</p>
            </div>
            <Button variant="outline" onClick={() => window.open(vitrineUrl, "_blank")}>
              Visualizar Vitrine
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="imagens">
              <TabsList className="mb-4">
                <TabsTrigger value="imagens">Imagens</TabsTrigger>
                <TabsTrigger value="cores">Cores</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="widgets">Widgets</TabsTrigger>
                {isPlanoPago && <TabsTrigger value="avancado">Avançado</TabsTrigger>}
              </TabsList>

              <TabsContent value="imagens" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label>Logo da Loja</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <div className="relative h-20 w-20 overflow-hidden rounded-full border">
                        {formData.logo ? (
                          <Image
                            src={formData.logo || "/placeholder.svg"}
                            alt="Logo da loja"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-primary/10 text-primary text-xl font-bold">
                            {loja.nome.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="logo-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Upload className="h-4 w-4" />
                            {formData.logo ? "Alterar logo" : "Enviar logo"}
                          </div>
                        </Label>
                        <Input
                          id="logo-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleLogoUpload}
                          disabled={isUploading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recomendado: 200x200px, formato quadrado</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label>Banner da Vitrine</Label>
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <div className="relative h-40 w-full bg-gray-100">
                        {formData.banner ? (
                          <Image
                            src={formData.banner || "/placeholder.svg"}
                            alt="Banner da loja"
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500">
                            Nenhum banner enviado
                          </div>
                        )}
                      </div>
                      <div className="p-3 bg-gray-50">
                        <Label htmlFor="banner-upload" className="cursor-pointer">
                          <div className="flex items-center gap-2 text-sm text-primary hover:underline">
                            <Upload className="h-4 w-4" />
                            {formData.banner ? "Alterar banner" : "Enviar banner"}
                          </div>
                        </Label>
                        <Input
                          id="banner-upload"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleBannerUpload}
                          disabled={isUploading}
                        />
                        <p className="text-xs text-muted-foreground mt-1">Recomendado: 1200x400px, formato paisagem</p>
                      </div>
                    </div>
                  </div>

                  {uploadError && (
                    <Alert variant="destructive">
                      <AlertDescription>{uploadError}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cores" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="cores.primaria">Cor Primária</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-10 w-10 rounded-md border"
                        style={{ backgroundColor: formData.cores.primaria }}
                      />
                      <Input
                        id="cores.primaria"
                        name="cores.primaria"
                        type="text"
                        value={formData.cores.primaria}
                        onChange={handleChange}
                        placeholder="#4f46e5"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada para botões, links e elementos de destaque</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cores.secundaria">Cor de Fundo</Label>
                    <div className="flex gap-2">
                      <div
                        className="h-10 w-10 rounded-md border"
                        style={{ backgroundColor: formData.cores.secundaria }}
                      />
                      <Input
                        id="cores.secundaria"
                        name="cores.secundaria"
                        type="text"
                        value={formData.cores.secundaria}
                        onChange={handleChange}
                        placeholder="#f9fafb"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada para o fundo do cabeçalho e rodapé</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="cores.texto">Cor do Texto</Label>
                    <div className="flex gap-2">
                      <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: formData.cores.texto }} />
                      <Input
                        id="cores.texto"
                        name="cores.texto"
                        type="text"
                        value={formData.cores.texto}
                        onChange={handleChange}
                        placeholder="#111827"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">Usada para textos principais</p>
                  </div>

                  {plano.personalizacaoVitrine.cores.destaque && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label htmlFor="cores.destaque">Cor de Destaque</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <Info className="h-4 w-4 text-muted-foreground" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Disponível apenas em planos pagos</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ backgroundColor: formData.cores.destaque }}
                        />
                        <Input
                          id="cores.destaque"
                          name="cores.destaque"
                          type="text"
                          value={formData.cores.destaque}
                          onChange={handleChange}
                          placeholder="#10b981"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Usada para elementos de destaque especiais</p>
                    </div>
                  )}
                </div>

                {!plano.personalizacaoVitrine.cores.destaque && (
                  <div className="flex items-center gap-2 mt-4 p-3 bg-blue-50 text-blue-800 rounded-md">
                    <Info className="h-5 w-5 text-blue-500" />
                    <p className="text-sm">
                      Faça upgrade para um plano pago e tenha acesso a mais opções de cores e personalização.
                    </p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="layout" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="layout">Estilo de Layout</Label>
                    <Select value={formData.layout} onValueChange={(value) => handleSelectChange("layout", value)}>
                      <SelectTrigger className="w-full mt-1">
                        <SelectValue placeholder="Selecione um layout" />
                      </SelectTrigger>
                      <SelectContent>
                        {layoutsDisponiveis.map((layout) => (
                          <SelectItem key={layout.id} value={layout.id}>
                            {layout.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Seu plano permite {plano.personalizacaoVitrine.layouts} layouts
                    </p>
                  </div>

                  {plano.personalizacaoVitrine.fontes && (
                    <div>
                      <Label htmlFor="fonte">Fonte Principal</Label>
                      <Select value={formData.fonte} onValueChange={(value) => handleSelectChange("fonte", value)}>
                        <SelectTrigger className="w-full mt-1">
                          <SelectValue placeholder="Selecione uma fonte" />
                        </SelectTrigger>
                        <SelectContent>
                          {fontesDisponiveis.map((fonte) => (
                            <SelectItem key={fonte.id} value={fonte.id}>
                              {fonte.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground mt-1">
                        Personalização de fontes disponível apenas em planos pagos
                      </p>
                    </div>
                  )}

                  {!plano.personalizacaoVitrine.fontes && (
                    <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-800 rounded-md">
                      <Info className="h-5 w-5 text-blue-500" />
                      <p className="text-sm">
                        Faça upgrade para um plano pago e tenha acesso a personalização de fontes e mais layouts.
                      </p>
                      <Button
                        variant="link"
                        className="h-auto p-0 text-blue-800 underline"
                        onClick={() => router.push("/dashboard/planos")}
                      >
                        Ver planos
                      </Button>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="widgets" className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Widgets da Vitrine</Label>
                    <span className="text-sm text-muted-foreground">
                      {currentWidgets.length}/{plano.personalizacaoVitrine.widgets} widgets
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {widgetsDisponiveis.map((widget) => {
                      // Verificar se o widget está disponível para o plano atual
                      const isAvailable = !(widget.apenasPlanosPagos && !isPlanoPago)
                      const isSelected = currentWidgets.includes(widget.id)

                      return (
                        <div
                          key={widget.id}
                          className={`p-4 border rounded-md ${isSelected ? "border-primary bg-primary/5" : "border-gray-200"} 
                                    ${!isAvailable ? "opacity-60" : ""}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{widget.nome}</h4>
                              <p className="text-sm text-muted-foreground">{widget.descricao}</p>
                            </div>
                            <Switch
                              checked={isSelected}
                              onCheckedChange={() => isAvailable && handleWidgetToggle(widget.id)}
                              disabled={
                                !isAvailable ||
                                (currentWidgets.length >= plano.personalizacaoVitrine.widgets && !isSelected)
                              }
                            />
                          </div>
                          {widget.apenasPlanosPagos && !isPlanoPago && (
                            <p className="text-xs text-amber-600 mt-2">Disponível apenas em planos pagos</p>
                          )}
                        </div>
                      )
                    })}
                  </div>

                  {!isPlanoPago && (
                    <div className="flex items-center gap-2 mt-6 p-3 bg-blue-50 text-blue-800 rounded-md">
                      <Info className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="text-sm">
                          Faça upgrade para um plano pago e tenha acesso a mais widgets e funcionalidades.
                        </p>
                        <Button
                          variant="link"
                          className="h-auto p-0 text-blue-800 underline"
                          onClick={() => router.push("/dashboard/planos")}
                        >
                          Ver planos
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              {isPlanoPago && (
                <TabsContent value="avancado" className="space-y-6">
                  <div className="space-y-4">
                    {plano.personalizacaoVitrine.animacoes && (
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <h4 className="font-medium">Animações</h4>
                          <p className="text-sm text-muted-foreground">Ativar animações e transições na vitrine</p>
                        </div>
                        <Switch
                          checked={formData.animacoes}
                          onCheckedChange={(checked) => handleSwitchChange("animacoes", checked)}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h4 className="font-medium">Modo Escuro</h4>
                        <p className="text-sm text-muted-foreground">
                          Permitir que visitantes alternem entre modo claro e escuro
                        </p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-md">
                      <div>
                        <h4 className="font-medium">SEO Avançado</h4>
                        <p className="text-sm text-muted-foreground">Otimização para mecanismos de busca</p>
                      </div>
                      <Switch checked={true} disabled />
                    </div>

                    {plano.id === "premium" || plano.id === "empresarial" ? (
                      <div className="flex items-center justify-between p-4 border rounded-md">
                        <div>
                          <h4 className="font-medium">CSS Personalizado</h4>
                          <p className="text-sm text-muted-foreground">
                            Adicionar estilos CSS personalizados à sua vitrine
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          Editar CSS
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 border rounded-md opacity-60">
                        <div>
                          <h4 className="font-medium">CSS Personalizado</h4>
                          <p className="text-sm text-muted-foreground">
                            Disponível apenas nos planos Premium e Empresarial
                          </p>
                        </div>
                        <Button variant="outline" size="sm" disabled>
                          Editar CSS
                        </Button>
                      </div>
                    )}
                  </div>
                </TabsContent>
              )}
            </Tabs>

            <div className="mt-6">
              <Button type="submit" disabled={isSaving || isUploading || dbError}>
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar Personalização
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

