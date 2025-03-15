"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeradorConteudo } from "@/components/gerador-conteudo"
import { SugestorMelhorias } from "@/components/sugestor-melhorias"
import { useRouter } from "next/navigation"
import { Loader2, Save, Sparkles } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function NovoPanfletoPage() {
  const router = useRouter()
  const [titulo, setTitulo] = useState("")
  const [descricao, setDescricao] = useState("")
  const [conteudo, setConteudo] = useState("")
  const [categoria, setCategoria] = useState("")
  const [tags, setTags] = useState("")
  const [imagem, setImagem] = useState("")
  const [status, setStatus] = useState("rascunho")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const tagsArray = tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const response = await fetch("/api/panfletos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          titulo,
          descricao,
          conteudo,
          categoria,
          tags: tagsArray,
          imagem: imagem || `https://source.unsplash.com/random/800x600?${titulo.toLowerCase().replace(/\s+/g, "-")}`,
          status,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar panfleto")
      }

      router.push("/dashboard/panfletos")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao criar panfleto")
    } finally {
      setLoading(false)
    }
  }

  const handleConteudoGerado = (textoGerado: string) => {
    setConteudo(textoGerado)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Novo Panfleto</h2>
      </div>

      <Tabs defaultValue="manual" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual">Criação Manual</TabsTrigger>
          <TabsTrigger value="ia">Assistente de IA</TabsTrigger>
        </TabsList>
        <TabsContent value="manual" className="space-y-4">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Informações do Panfleto</CardTitle>
                <CardDescription>Preencha os campos abaixo para criar um novo panfleto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Erro</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="titulo">Título</Label>
                    <Input
                      id="titulo"
                      placeholder="Título do panfleto"
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
                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    placeholder="Breve descrição do panfleto"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conteudo">Conteúdo</Label>
                  <Textarea
                    id="conteudo"
                    placeholder="Conteúdo detalhado do panfleto"
                    value={conteudo}
                    onChange={(e) => setConteudo(e.target.value)}
                    rows={8}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="tags">Tags (separadas por vírgula)</Label>
                    <Input
                      id="tags"
                      placeholder="Ex: promoção, verão, desconto"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imagem">URL da Imagem (opcional)</Label>
                    <Input
                      id="imagem"
                      placeholder="https://exemplo.com/imagem.jpg"
                      value={imagem}
                      onChange={(e) => setImagem(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Selecione um status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rascunho">Rascunho</SelectItem>
                      <SelectItem value="publicado">Publicado</SelectItem>
                      <SelectItem value="arquivado">Arquivado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/panfletos")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Panfleto
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="ia" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Assistente de IA para Criação de Panfletos
              </CardTitle>
              <CardDescription>Use a inteligência artificial para ajudar na criação do seu panfleto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <GeradorConteudo onConteudoGerado={handleConteudoGerado} />

              {conteudo && (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold mb-2">Refinar o Conteúdo</h3>
                  <SugestorMelhorias conteudoInicial={conteudo} />
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => {
                  if (conteudo) {
                    document.getElementById("manual-tab")?.click()
                  }
                }}
                disabled={!conteudo}
              >
                Continuar para Edição Manual
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

