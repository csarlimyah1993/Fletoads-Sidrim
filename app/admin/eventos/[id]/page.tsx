"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Loader2, Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { DocumentUpload, type DocumentInfo } from "@/components/ui/documents-upload"
import DatePicker from "@/components/ui/date-picker"

interface Evento {
  _id: string
  nome: string
  descricao: string
  imagem: string
  dataInicio: Date
  dataFim: Date
  ativo: boolean
  lojasParticipantes: string[]
  documentos: DocumentInfo[]
  registrationUrl?: string
}

export default function EventoPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string

  const [evento, setEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form state
  const [nome, setNome] = useState("")
  const [descricao, setDescricao] = useState("")
  const [imagem, setImagem] = useState("")
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined)
  const [dataFim, setDataFim] = useState<Date | undefined>(undefined)
  const [ativo, setAtivo] = useState(false)
  const [documentos, setDocumentos] = useState<DocumentInfo[]>([])
  const [registrationUrl, setRegistrationUrl] = useState("")

  useEffect(() => {
    fetchEvento()
  }, [id])

  const fetchEvento = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/eventos/${id}`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar evento: ${response.status}`)
      }

      const data = await response.json()
      const eventoData = data.evento

      setEvento(eventoData)
      setNome(eventoData.nome || "")
      setDescricao(eventoData.descricao || "")
      setImagem(eventoData.imagem || "")
      setDataInicio(eventoData.dataInicio ? new Date(eventoData.dataInicio) : undefined)
      setDataFim(eventoData.dataFim ? new Date(eventoData.dataFim) : undefined)
      setAtivo(eventoData.ativo || false)
      setDocumentos(eventoData.documentos || [])
      setRegistrationUrl(eventoData.registrationUrl || "")
    } catch (error) {
      console.error("Erro ao buscar evento:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const response = await fetch(`/api/admin/eventos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          descricao,
          imagem,
          dataInicio,
          dataFim,
          ativo,
          documentos,
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar evento")
      }

      const data = await response.json()

      toast.success("Evento salvo com sucesso")

      // If it's a new event, redirect to the edit page
      if (id === "novo" && data.eventoId) {
        router.push(`/admin/eventos/${data.eventoId}`)
      } else {
        // Refresh the data
        fetchEvento()
      }
    } catch (error) {
      console.error("Erro ao salvar evento:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar evento")
    } finally {
      setSaving(false)
    }
  }

  const copyRegistrationUrl = () => {
    if (registrationUrl) {
      navigator.clipboard.writeText(registrationUrl)
      toast.success("URL de registro copiada para a área de transferência")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 dark:text-red-200">Erro ao carregar evento</h3>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button onClick={fetchEvento} className="mt-4">
            Tentar novamente
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{id === "novo" ? "Criar Novo Evento" : "Editar Evento"}</h1>
        <Button variant="outline" onClick={() => router.push("/admin/eventos")}>
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Defina as informações básicas do evento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div>
                  <Label htmlFor="nome">Nome do Evento</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Nome do evento"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descrição do evento"
                    rows={4}
                  />
                </div>

                <div>
                  <Label htmlFor="imagem">URL da Imagem</Label>
                  <Input
                    id="imagem"
                    value={imagem}
                    onChange={(e) => setImagem(e.target.value)}
                    placeholder="https://exemplo.com/imagem.jpg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dataInicio">Data de Início</Label>
                    <DatePicker id="dataInicio" date={dataInicio} onSelect={setDataInicio} />
                  </div>

                  <div>
                    <Label htmlFor="dataFim">Data de Término</Label>
                    <DatePicker id="dataFim" date={dataFim} onSelect={setDataFim} />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="ativo" checked={ativo} onCheckedChange={setAtivo} />
                  <Label htmlFor="ativo">Evento Ativo</Label>
                </div>

                {evento?._id && (
                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Label className="block mb-2">URL de Registro</Label>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-white dark:bg-gray-900 p-2 rounded border text-sm overflow-x-auto">
                        <code className="text-xs md:text-sm">{registrationUrl}</code>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={copyRegistrationUrl}
                        title="Copiar URL"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Compartilhe esta URL para que os usuários possam se registrar diretamente para este evento.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Documentos</CardTitle>
              <CardDescription>Adicione documentos relacionados ao evento</CardDescription>
            </CardHeader>
            <CardContent>
              <DocumentUpload value={documentos} onChange={setDocumentos} />
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/eventos")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Evento"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
