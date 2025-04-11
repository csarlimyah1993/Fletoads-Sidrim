"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

interface VitrineCustomizationProps {
  loja: any
}

export function VitrineCustomization({ loja }: VitrineCustomizationProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    tema: "padrao",
    corPrimaria: "#000000",
    fonte: "Inter",
    exibirCategorias: true,
    produtosPorPagina: 12,
    layoutProdutos: "grade",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch(`/api/vitrines/criar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          lojaId: loja._id,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar configurações")
      }

      toast({
        title: "Vitrine criada com sucesso",
        description: "Sua vitrine online foi configurada e já está disponível.",
      })
    } catch (error) {
      console.error("Erro ao criar vitrine:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a vitrine. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título da Vitrine</Label>
            <Input
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              placeholder="Nome da sua vitrine"
            />
          </div>

          <div className="space-y-2">
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

          <div className="space-y-2">
            <Label htmlFor="corPrimaria">Cor Principal</Label>
            <div className="flex items-center gap-2">
              <Input
                type="color"
                id="corPrimaria"
                name="corPrimaria"
                value={formData.corPrimaria}
                onChange={handleChange}
                className="w-12 h-10 p-1"
              />
              <Input
                type="text"
                value={formData.corPrimaria}
                onChange={handleChange}
                name="corPrimaria"
                className="flex-1"
              />
            </div>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Salvando..." : "Salvar Configurações"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
