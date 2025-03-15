"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Lightbulb } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function SugestorMelhorias({
  conteudoInicial = "",
  metricas = null,
}: { conteudoInicial?: string; metricas?: any }) {
  const [conteudo, setConteudo] = useState(conteudoInicial)
  const [sugestoes, setSugestoes] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/ai/sugerir-melhorias", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conteudo,
          metricas,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao sugerir melhorias")
      }

      setSugestoes(data.sugestoes)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao sugerir melhorias")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5" />
            Sugestões de Melhorias com IA
          </CardTitle>
          <CardDescription>Cole o conteúdo do seu panfleto para receber sugestões de melhorias</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Textarea
                placeholder="Cole aqui o conteúdo do seu panfleto..."
                value={conteudo}
                onChange={(e) => setConteudo(e.target.value)}
                rows={8}
                required
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando sugestões...
                </>
              ) : (
                <>
                  <Lightbulb className="mr-2 h-4 w-4" />
                  Sugerir Melhorias
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

      {sugestoes && (
        <Card>
          <CardHeader>
            <CardTitle>Sugestões de Melhorias</CardTitle>
            <CardDescription>Sugestões geradas pela IA para melhorar seu panfleto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">{sugestoes}</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(sugestoes)
              }}
            >
              Copiar Sugestões
            </Button>
            <Button
              onClick={() => {
                // Extrair a versão revisada do conteúdo
                const match = sugestoes.match(/Versão revisada do conteúdo completo:[\s\S]+/)
                if (match) {
                  const revisedContent = match[0].replace("Versão revisada do conteúdo completo:", "").trim()
                  setConteudo(revisedContent)
                }
              }}
            >
              Aplicar Versão Revisada
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

