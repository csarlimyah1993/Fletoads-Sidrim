"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Save, Trash2, AlertCircle, X } from "lucide-react"
import { toast } from "sonner"
import { ImageUpload } from "@/components/ui/image-upload"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { use } from "react"

export default function ProdutoDetalhesPage({ params }: { params: Promise<{ id: string }> }) {
  // Usar o hook 'use' do React para resolver a Promise de params
  const { id } = use(params)

  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    preco: "",
    precoPromocional: "",
    categoria: "",
    sku: "",
    estoque: "0",
    destaque: false,
    ativo: true,
    imagens: [] as string[],
  })

  // Buscar dados do produto
  useEffect(() => {
    const fetchProduto = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch(`/api/produtos/${id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `Erro ao buscar produto: ${response.status}`)
        }

        const produto = await response.json()

        // Converter valores para string para o formulário
        setFormData({
          nome: produto.nome || "",
          descricao: produto.descricao || "",
          preco: produto.preco?.toString() || "0",
          precoPromocional: produto.precoPromocional ? produto.precoPromocional.toString() : "",
          categoria: produto.categoria || "",
          sku: produto.sku || "",
          estoque: produto.estoque?.toString() || "0",
          destaque: produto.destaque || false,
          ativo: produto.ativo !== undefined ? produto.ativo : true,
          imagens: produto.imagens || [],
        })
      } catch (error) {
        console.error("Erro ao buscar produto:", error)
        setError(error instanceof Error ? error.message : "Erro ao buscar produto")
        toast.error("Erro ao carregar dados do produto")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduto()
  }, [id])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleImageUpload = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      imagens: [...prev.imagens, url],
    }))
  }

  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      imagens: prev.imagens.filter((_, i) => i !== index),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsSaving(true)

      // Validar dados
      if (!formData.nome || !formData.descricao || !formData.preco || !formData.categoria || !formData.sku) {
        toast.error("Preencha todos os campos obrigatórios")
        return
      }

      // Converter valores numéricos
      const dadosParaEnviar = {
        ...formData,
        preco: Number.parseFloat(formData.preco),
        precoPromocional: formData.precoPromocional ? Number.parseFloat(formData.precoPromocional) : undefined,
        estoque: Number.parseInt(formData.estoque),
      }

      // Enviar dados para a API
      const response = await fetch(`/api/produtos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dadosParaEnviar),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Erro ao atualizar produto")
      }

      toast.success("Produto atualizado com sucesso!")

      // Redirecionar para a página de listagem após salvar
      router.push("/dashboard/produtos")
    } catch (error) {
      console.error("Erro ao atualizar produto:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar produto")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/produtos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Erro ao excluir produto")
      }

      toast.success("Produto excluído com sucesso!")
      router.push("/dashboard/produtos")
    } catch (error) {
      console.error("Erro ao excluir produto:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao excluir produto")
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para voltar para a página de listagem de produtos
  const handleVoltar = () => {
    router.push("/dashboard/produtos")
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
            <p className="text-lg font-medium text-center">{error}</p>
            <Button onClick={handleVoltar} className="mt-4">
              Voltar para Produtos
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleVoltar} disabled={isSaving || isDeleting} type="button">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-2xl font-bold tracking-tight">{formData.nome}</h2>
          </div>
          <p className="text-muted-foreground">Edite os dados do produto</p>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" disabled={isSaving || isDeleting}>
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
              Excluir
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. Isso excluirá permanentemente o produto.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Dados principais do produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do Produto *</Label>
                <Input
                  id="nome"
                  name="nome"
                  placeholder="Nome do produto"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="descricao">Descrição *</Label>
                <Textarea
                  id="descricao"
                  name="descricao"
                  placeholder="Descrição do produto"
                  value={formData.descricao}
                  onChange={handleChange}
                  required
                  rows={4}
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="categoria">Categoria *</Label>
                  <Input
                    id="categoria"
                    name="categoria"
                    placeholder="Ex: Eletrônicos, Roupas, etc."
                    value={formData.categoria}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU (Código) *</Label>
                  <Input
                    id="sku"
                    name="sku"
                    placeholder="Código único do produto"
                    value={formData.sku}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Preço e Estoque</CardTitle>
              <CardDescription>Informações de preço e disponibilidade</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="preco">Preço (R$) *</Label>
                <Input
                  id="preco"
                  name="preco"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.preco}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precoPromocional">Preço Promocional (R$)</Label>
                <Input
                  id="precoPromocional"
                  name="precoPromocional"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  value={formData.precoPromocional}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="estoque">Estoque (unidades) *</Label>
                <Input
                  id="estoque"
                  name="estoque"
                  type="number"
                  min="0"
                  placeholder="0"
                  value={formData.estoque}
                  onChange={handleChange}
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card className="col-span-2 md:col-span-1">
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Opções adicionais do produto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ativo">Produto Ativo</Label>
                  <p className="text-sm text-muted-foreground">Produtos inativos não são exibidos para os clientes</p>
                </div>
                <Switch
                  id="ativo"
                  checked={formData.ativo}
                  onCheckedChange={(checked) => handleSwitchChange("ativo", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="destaque">Produto em Destaque</Label>
                  <p className="text-sm text-muted-foreground">
                    Produtos em destaque aparecem em posições privilegiadas
                  </p>
                </div>
                <Switch
                  id="destaque"
                  checked={formData.destaque}
                  onCheckedChange={(checked) => handleSwitchChange("destaque", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Nova seção para imagens */}
          <Card className="col-span-2">
            <CardHeader>
              <CardTitle>Imagens do Produto</CardTitle>
              <CardDescription>Adicione imagens para mostrar seu produto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Galeria de imagens */}
                {formData.imagens.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    {formData.imagens.map((imagem, index) => (
                      <div key={index} className="relative group aspect-square rounded-md overflow-hidden border">
                        <div className="w-full h-full bg-gray-100 dark:bg-gray-800">
                          <img
                            src={imagem || "/placeholder.svg"}
                            alt={`Imagem ${index + 1} do produto`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveImage(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload de nova imagem */}
                <div className="mt-4">
                  <Label>Adicionar Nova Imagem</Label>
                  <ImageUpload value="" onChange={handleImageUpload} tipo="produto" className="mt-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="button" variant="outline" onClick={handleVoltar} className="mr-2" disabled={isSaving}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Salvar Alterações
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}

