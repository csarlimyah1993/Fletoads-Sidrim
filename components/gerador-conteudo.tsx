"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function GeradorConteudo({ onConteudoGerado }: { onConteudoGerado?: (conteudo: string) => void }) {
  const [titulo, setTitulo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [publico, setPublico] = useState("")
  const [tom, setTom] = useState("profissional")
  const [pontosPrincipais, setPontosPrincipais] = useState("")
  const [conteudoGerado, setConteudoGerado] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const pontosArray = pontosPrincipais
        .split("\n")
        .map((p) => p.trim())
        .filter((p) => p.length > 0)

      const response = await fetch("/api/ai/gerar-conteudo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          categoria,
          publico,
          tom,
          pontosPrincipais: pontosArray,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao gerar conteúdo")
      }

      setConteudoGerado(data.conteudo)

      if (onConteudoGerado) {
        onConteudoGerado(data.conteudo)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao gerar conteúdo")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            Gerador de Conteúdo com IA
          </CardTitle>
          <CardDescription>Preencha os campos abaixo para gerar conteúdo para seu panfleto</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título do Panfleto</Label>
                <Input
                  id="titulo"
                  placeholder="Ex: Promoção de Verão"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="categoria">Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria} required>
                  <SelectTrigger id="categoria">
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="promocional">Promocional</SelectItem>
                    <SelectItem value="institucional">Institucional</SelectItem>
                    <SelectItem value="evento">Evento</SelectItem>
                    <SelectItem value="lancamento">Lançamento de Produto</SelectItem>
                    <SelectItem value="servico">Serviço</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="publico">Público-Alvo</Label>
                <Input
                  id="publico"
                  placeholder="Ex: Jovens adultos de 18-35 anos"
                  value={publico}
                  onChange={(e) => setPublico(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tom">Tom de Comunicação</Label>
                <Select value={tom} onValueChange={setTom}>
                  <SelectTrigger id="tom">
                    <SelectValue placeholder="Selecione um tom" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="profissional">Profissional</SelectItem>
                    <SelectItem value="casual">Casual</SelectItem>
                    <SelectItem value="entusiasmado">Entusiasmado</SelectItem>
                    <SelectItem value="formal">Formal</SelectItem>
                    <SelectItem value="amigavel">Amigável</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pontos">Pontos Principais (um por linha)</Label>
              <Textarea
                id="pontos"
                placeholder="Ex: Desconto de 30% em todos os produtos&#10;Frete grátis para compras acima de R$100&#10;Promoção válida até 31/12"
                value={pontosPrincipais}
                onChange={(e) => setPontosPrincipais(e.target.value)}
                rows={4}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando conteúdo...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar Conteúdo
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

      {conteudoGerado && (
        <Card>
          <CardHeader>
            <CardTitle>Conteúdo Gerado</CardTitle>
            <CardDescription>Conteúdo gerado pela IA para seu panfleto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap bg-muted p-4 rounded-md">{conteudoGerado}</div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(conteudoGerado)
              }}
            >
              Copiar
            </Button>
            <Button
              onClick={() => {
                if (onConteudoGerado) {
                  onConteudoGerado(conteudoGerado)
                }
              }}
            >
              Usar este conteúdo
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}

