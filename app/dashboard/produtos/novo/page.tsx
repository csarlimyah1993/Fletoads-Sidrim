"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { ImageUpload } from "@/components/ui/image-upload"
import { Separator } from "@/components/ui/separator"
import { Info, Tag, Package, Truck, Settings, ArrowLeft, Save, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// Definir o tipo para o produto
interface ProdutoForm {
  nome: string
  descricaoCurta: string
  descricaoCompleta: string
  preco: string
  precoPromocional: string
  estoque: string
  sku: string
  codigoBarras: string
  imagens: string[]
  videoUrl: string
  categoria: string
  subcategoria: string
  tags: string
  marca: string
  modelo: string
  peso: string
  altura: string
  largura: string
  comprimento: string
  tipoFrete: string
  ativo: boolean
  destaque: boolean
  tipoProduto: string
  variacoes: any[]
}

export default function NovoProdutoPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("basic")
  const [isPhysicalProduct, setIsPhysicalProduct] = useState(true)

  // Estado para todos os campos do produto
  const [produto, setProduto] = useState<ProdutoForm>({
    // Informações básicas
    nome: "",
    descricaoCurta: "",
    descricaoCompleta: "",

    // Preço e Estoque
    preco: "",
    precoPromocional: "",
    estoque: "",
    sku: "",
    codigoBarras: "",

    // Mídia
    imagens: [],
    videoUrl: "",

    // Categorização
    categoria: "",
    subcategoria: "",
    tags: "",
    marca: "",
    modelo: "",

    // Informações de envio
    peso: "",
    altura: "",
    largura: "",
    comprimento: "",
    tipoFrete: "padrao",

    // Configurações adicionais
    ativo: true,
    destaque: false,
    tipoProduto: "fisico",
    variacoes: [],
  })

  // Atualizar a visibilidade dos campos de envio quando o tipo de produto mudar
  useEffect(() => {
    setIsPhysicalProduct(produto.tipoProduto === "fisico")
  }, [produto.tipoProduto])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduto((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setProduto((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProduto((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageUpload = (url: string) => {
    setProduto((prev) => ({
      ...prev,
      imagens: [...prev.imagens, url],
    }))
  }

  const handleRemoveImage = (index?: number) => {
    if (index === undefined) return

    setProduto((prev) => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validação básica
      if (!produto.nome || !produto.preco || !produto.estoque) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Nome, preço e estoque são campos obrigatórios.",
        })
        setIsLoading(false)
        return
      }

      // Preparar dados para envio
      const dadosParaEnviar: any = {
        ...produto,
        preco: Number.parseFloat(produto.preco),
        precoPromocional: produto.precoPromocional ? Number.parseFloat(produto.precoPromocional) : undefined,
        estoque: Number.parseInt(produto.estoque),
        tags: produto.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      }

      // Se for produto físico, converter valores numéricos para envio
      if (isPhysicalProduct) {
        dadosParaEnviar.peso = produto.peso ? Number.parseFloat(produto.peso) : undefined
        dadosParaEnviar.altura = produto.altura ? Number.parseFloat(produto.altura) : undefined
        dadosParaEnviar.largura = produto.largura ? Number.parseFloat(produto.largura) : undefined
        dadosParaEnviar.comprimento = produto.comprimento ? Number.parseFloat(produto.comprimento) : undefined
      }

      const response = await fetch("/api/produtos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaEnviar),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar produto")
      }

      const produtoCriado = await response.json()
      toast({
        title: "Produto criado",
        description: "O produto foi criado com sucesso!",
      })

      router.push(`/dashboard/produtos/${produtoCriado._id}`)
    } catch (error: any) {
      console.error("Erro ao criar produto:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o produto.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.push("/dashboard/produtos")} disabled={isLoading}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">Novo Produto</h2>
          </div>
          <p className="text-muted-foreground">Preencha os dados para criar um novo produto</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-5 mb-6">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">Informações Básicas</span>
            </TabsTrigger>
            <TabsTrigger value="price" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Preço e Estoque</span>
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              <span className="hidden sm:inline">Mídia</span>
            </TabsTrigger>
            <TabsTrigger value="category" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span className="hidden sm:inline">Categorização</span>
            </TabsTrigger>
            {isPhysicalProduct && (
              <TabsTrigger value="shipping" className="flex items-center gap-2">
                <Truck className="h-4 w-4" />
                <span className="hidden sm:inline">Envio</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Configurações</span>
            </TabsTrigger>
          </TabsList>

          {/* Informações Básicas */}
          <TabsContent value="basic">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Informe os dados básicos do produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Produto *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={produto.nome}
                    onChange={handleChange}
                    placeholder="Nome do produto"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricaoCurta">Descrição Curta</Label>
                  <Input
                    id="descricaoCurta"
                    name="descricaoCurta"
                    value={produto.descricaoCurta}
                    onChange={handleChange}
                    placeholder="Breve descrição para listagens"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="descricaoCompleta">Descrição Completa</Label>
                  <Textarea
                    id="descricaoCompleta"
                    name="descricaoCompleta"
                    value={produto.descricaoCompleta}
                    onChange={handleChange}
                    placeholder="Descrição detalhada do produto"
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preço e Estoque */}
          <TabsContent value="price">
            <Card>
              <CardHeader>
                <CardTitle>Preço e Estoque</CardTitle>
                <CardDescription>Configure os preços e estoque do produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="preco">Preço *</Label>
                    <Input
                      id="preco"
                      name="preco"
                      type="number"
                      step="0.01"
                      value={produto.preco}
                      onChange={handleChange}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="precoPromocional">Preço Promocional</Label>
                    <Input
                      id="precoPromocional"
                      name="precoPromocional"
                      type="number"
                      step="0.01"
                      value={produto.precoPromocional}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estoque">Quantidade em Estoque *</Label>
                    <Input
                      id="estoque"
                      name="estoque"
                      type="number"
                      value={produto.estoque}
                      onChange={handleChange}
                      placeholder="0"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU (Código do Produto)</Label>
                    <Input id="sku" name="sku" value={produto.sku} onChange={handleChange} placeholder="SKU123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="codigoBarras">Código de Barras / EAN / GTIN</Label>
                  <Input
                    id="codigoBarras"
                    name="codigoBarras"
                    value={produto.codigoBarras}
                    onChange={handleChange}
                    placeholder="7891234567890"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Mídia */}
          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Mídia</CardTitle>
                <CardDescription>Adicione imagens e vídeos do produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Imagens do Produto</Label>
                  <ImageUpload
                    value={produto.imagens}
                    onChange={(urls) =>
                      setProduto((prev) => ({ ...prev, imagens: Array.isArray(urls) ? urls : [urls] }))
                    }
                    onRemove={handleRemoveImage}
                    multiple={true}
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Adicione até 10 imagens. A primeira imagem será a principal.
                  </p>
                </div>
                <div className="space-y-2 mt-4">
                  <Label htmlFor="videoUrl">URL do Vídeo (YouTube, Vimeo, etc.)</Label>
                  <Input
                    id="videoUrl"
                    name="videoUrl"
                    value={produto.videoUrl}
                    onChange={handleChange}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Categorização */}
          <TabsContent value="category">
            <Card>
              <CardHeader>
                <CardTitle>Categorização e Organização</CardTitle>
                <CardDescription>
                  Organize seu produto em categorias e adicione tags para facilitar a busca.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoria">Categoria</Label>
                    <Input
                      id="categoria"
                      name="categoria"
                      value={produto.categoria}
                      onChange={handleChange}
                      placeholder="Ex: Eletrônicos, Roupas, etc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="subcategoria">Subcategoria</Label>
                    <Input
                      id="subcategoria"
                      name="subcategoria"
                      value={produto.subcategoria}
                      onChange={handleChange}
                      placeholder="Ex: Celulares, Camisetas, etc."
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags / Palavras-chave</Label>
                  <Input
                    id="tags"
                    name="tags"
                    value={produto.tags}
                    onChange={handleChange}
                    placeholder="Separe as tags por vírgula (ex: promoção, novidade, destaque)"
                  />
                  <p className="text-sm text-muted-foreground mt-1">Separe as tags por vírgula.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marca">Marca</Label>
                    <Input
                      id="marca"
                      name="marca"
                      value={produto.marca}
                      onChange={handleChange}
                      placeholder="Nome da marca"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="modelo">Modelo</Label>
                    <Input
                      id="modelo"
                      name="modelo"
                      value={produto.modelo}
                      onChange={handleChange}
                      placeholder="Modelo do produto"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Informações de Envio - Apenas para produtos físicos */}
          {isPhysicalProduct && (
            <TabsContent value="shipping">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Envio</CardTitle>
                  <CardDescription>Adicione informações de peso e dimensões para cálculo de frete.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="peso">Peso (kg)</Label>
                    <Input
                      id="peso"
                      name="peso"
                      type="number"
                      step="0.01"
                      value={produto.peso}
                      onChange={handleChange}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="altura">Altura (cm)</Label>
                      <Input
                        id="altura"
                        name="altura"
                        type="number"
                        step="0.1"
                        value={produto.altura}
                        onChange={handleChange}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="largura">Largura (cm)</Label>
                      <Input
                        id="largura"
                        name="largura"
                        type="number"
                        step="0.1"
                        value={produto.largura}
                        onChange={handleChange}
                        placeholder="0.0"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comprimento">Comprimento (cm)</Label>
                      <Input
                        id="comprimento"
                        name="comprimento"
                        type="number"
                        step="0.1"
                        value={produto.comprimento}
                        onChange={handleChange}
                        placeholder="0.0"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tipoFrete">Tipo de Frete</Label>
                    <Select value={produto.tipoFrete} onValueChange={(value) => handleSelectChange("tipoFrete", value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo de frete" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="padrao">Padrão</SelectItem>
                        <SelectItem value="gratis">Frete Grátis</SelectItem>
                        <SelectItem value="fixo">Valor Fixo</SelectItem>
                        <SelectItem value="calculado">Calculado por Distância</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Configurações Adicionais */}
          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle>Configurações Adicionais</CardTitle>
                <CardDescription>Configure opções avançadas para o produto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tipoProduto">Tipo de Produto</Label>
                  <Select
                    value={produto.tipoProduto}
                    onValueChange={(value) => handleSelectChange("tipoProduto", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo de produto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisico">Físico</SelectItem>
                      <SelectItem value="digital">Digital</SelectItem>
                      <SelectItem value="servico">Serviço</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    {produto.tipoProduto === "fisico"
                      ? "Produtos físicos possuem informações de envio e estoque."
                      : produto.tipoProduto === "digital"
                        ? "Produtos digitais são entregues eletronicamente, sem envio físico."
                        : "Serviços são prestados sem envio físico."}
                  </p>
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="ativo">Produto Ativo</Label>
                    <p className="text-sm text-muted-foreground">Produtos inativos não aparecem na loja.</p>
                  </div>
                  <Switch
                    id="ativo"
                    checked={produto.ativo}
                    onCheckedChange={(checked) => handleSwitchChange("ativo", checked)}
                  />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="destaque">Produto em Destaque</Label>
                    <p className="text-sm text-muted-foreground">
                      Produtos em destaque aparecem em seções especiais da loja.
                    </p>
                  </div>
                  <Switch
                    id="destaque"
                    checked={produto.destaque}
                    onCheckedChange={(checked) => handleSwitchChange("destaque", checked)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Produto
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
