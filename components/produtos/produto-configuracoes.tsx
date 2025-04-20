"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import type { Produto } from "@/types/loja"

interface ProdutoConfiguracoesProps {
  produto: Produto
}

export function ProdutoConfiguracoes({ produto }: ProdutoConfiguracoesProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    ativo: produto.ativo !== undefined ? produto.ativo : true,
    destaque: produto.destaque || false,
    sku: produto.sku || "",
    metaTitle: produto.metaTitle || produto.nome || "",
    metaDescription: produto.metaDescription || produto.descricaoCurta || "",
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
    setIsLoading(true)

    try {
      const response = await fetch(`/api/produtos/${produto._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar configurações")
      }

      toast({
        title: "Sucesso",
        description: "Configurações atualizadas com sucesso!",
      })

      router.refresh()
    } catch (error) {
      console.error("Erro ao atualizar configurações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível atualizar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Status do Produto</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="ativo" className="text-base">
                Produto Ativo
              </Label>
              <p className="text-sm text-muted-foreground">Produtos inativos não são exibidos na vitrine</p>
            </div>
            <Switch
              id="ativo"
              checked={formData.ativo}
              onCheckedChange={(checked) => handleSwitchChange("ativo", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="destaque" className="text-base">
                Produto em Destaque
              </Label>
              <p className="text-sm text-muted-foreground">Produtos em destaque aparecem no topo da vitrine</p>
            </div>
            <Switch
              id="destaque"
              checked={formData.destaque}
              onCheckedChange={(checked) => handleSwitchChange("destaque", checked)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações Adicionais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="sku">SKU (Código do Produto)</Label>
            <Input id="sku" name="sku" value={formData.sku} onChange={handleChange} placeholder="Ex: PROD-001" />
            <p className="text-xs text-muted-foreground mt-1">
              Código único para identificação do produto no seu estoque
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="metaTitle">Título SEO</Label>
            <Input
              id="metaTitle"
              name="metaTitle"
              value={formData.metaTitle}
              onChange={handleChange}
              placeholder="Título para SEO"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Título que aparecerá nos resultados de busca (recomendado: até 60 caracteres)
            </p>
          </div>

          <div>
            <Label htmlFor="metaDescription">Descrição SEO</Label>
            <Textarea
              id="metaDescription"
              name="metaDescription"
              value={formData.metaDescription}
              onChange={handleChange}
              placeholder="Descrição para SEO"
              rows={3}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Descrição que aparecerá nos resultados de busca (recomendado: até 160 caracteres)
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push(`/produtos/${produto._id}`)}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Configurações
        </Button>
      </div>
    </form>
  )
}
