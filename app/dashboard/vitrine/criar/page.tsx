"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { PlanCardCompact } from "@/components/planos/plano-compact-card"

export default function CriarVitrinePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch("/api/vitrines/criar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar vitrine")
      }

      toast({
        title: "Vitrine criada com sucesso!",
        description: "Sua vitrine foi criada e está pronta para ser personalizada.",
      })

      router.push("/dashboard/vitrine")
      router.refresh()
    } catch (error) {
      console.error("Erro ao criar vitrine:", error)
      toast({
        title: "Erro ao criar vitrine",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao criar sua vitrine.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Criar Vitrine</h1>

      <PlanCardCompact className="mb-6" />

      <Card>
        <CardHeader>
          <CardTitle>Informações da Vitrine</CardTitle>
          <CardDescription>
            Crie sua vitrine online para mostrar seus produtos e serviços. Você poderá personalizar mais detalhes
            depois.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome da Vitrine</Label>
              <Input
                id="nome"
                name="nome"
                placeholder="Ex: Minha Loja Online"
                value={formData.nome}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea
                id="descricao"
                name="descricao"
                placeholder="Descreva sua vitrine em poucas palavras..."
                value={formData.descricao}
                onChange={handleChange}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Criar Vitrine
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
