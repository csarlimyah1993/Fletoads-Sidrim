"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Loader2, ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

export default function NovoProdutoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setIsLoading(true)

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

      const produto = await response.json()

      toast.success("Produto criado com sucesso!")
      router.push(`/dashboard/produtos/${produto._id}`)
    } catch (error) {
      console.error("Erro ao criar produto:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar produto")
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
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/produtos")}
            className="mr-2"
            disabled={isLoading}
          >
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

