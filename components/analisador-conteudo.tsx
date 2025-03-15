"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Search } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function AnalisadorConteudo() {
  const [conteudo, setConteudo] = useState("")
  const [publico, setPublico] = useState("")
  const [analise, setAnalise] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/analisar-conteudo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conteudo,
          publico,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao analisar conteúdo")
      }

      setAnalise(data.analise)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao analisar conteúdo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Analisador de Conteúdo com IA
          </CardTitle>
          <CardDescription>Cole o conteúdo do seu panfleto para receber uma análise detalhada</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="conteudo">Conteúdo do Panfleto</Label>
              <Textarea
                id="conteudo"
                placeholder="Cole aqui o conteúdo do seu panfleto..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={8}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="publico">Público-Alvo (opcional)</Label>
              <Input
                id="publico"
                placeholder="Ex: Jovens adultos de 18-35 anos"
                value={publico}
                onChange={(e) => setPublico(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analisando conteúdo...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" />
                  Analisar Conteúdo
                </>
              )}
            </Button>
          </form>

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {analise && (
        <Card>
          <CardHeader>
            <CardTitle>Análise do Conteúdo</CardTitle>
            <CardDescription>Análise gerada pela IA para seu panfleto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">{analise}</div>
          </CardContent>
          <CardFooter>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(analise)
              }}
            >
              Copiar Análise
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

