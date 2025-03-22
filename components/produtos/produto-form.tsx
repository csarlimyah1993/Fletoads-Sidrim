"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"
import { ProdutoImagemUpload } from "./produto-imagem-upload"

interface ProdutoFormProps {
  produto?: any
  lojaId: string
}

export function ProdutoForm({ produto, lojaId }: ProdutoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState({
    nome: produto?.nome || "",
    descricao: produto?.descricao || "",
    preco: produto?.preco || "",
    categoria: produto?.categoria || "",
    estoque: produto?.estoque || "",
    imagens: produto?.imagens || [],
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImagesChange = (images: string[]) => {
    setFormData((prev) => ({ ...prev, imagens: images }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const method = produto ? "PUT" : "POST"
      const url = produto ? `/api/produtos/${produto._id}` : "/api/produtos"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lojaId,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar produto")
      }

      toast({
        title: "Sucesso",
        description: produto ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!",
      })

      router.push("/dashboard/produtos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar produto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o produto. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{produto ? "Editar Produto" : "Novo Produto"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome do Produto</Label>
              <Input id="nome" name="nome" value={formData.nome} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                name="preco"
                type="number"
                step="0.01"
                value={formData.preco}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea id="descricao" name="descricao" value={formData.descricao} onChange={handleChange} rows={4} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoria</Label>
              <Input id="categoria" name="categoria" value={formData.categoria} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="estoque">Estoque</Label>
              <Input id="estoque" name="estoque" type="number" value={formData.estoque} onChange={handleChange} />
            </div>
          </div>

          {produto && (
            <ProdutoImagemUpload
              produtoId={produto._id}
              imagensAtuais={formData.imagens}
              onImagesChange={handleImagesChange}
            />
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/produtos")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {produto ? "Atualizar Produto" : "Criar Produto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}

