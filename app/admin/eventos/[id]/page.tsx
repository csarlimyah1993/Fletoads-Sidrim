"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Check, Loader2, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { StoreSelector } from "@/components/admin/store-selector"
import { ImageUpload } from "@/components/ui/image-upload"

interface Loja {
  _id: string
  nome: string
  logo?: string
  ativo?: boolean
}

interface EventoPageProps {
  params: Promise<{ id: string }>
}

export default function EventoPage({ params }: EventoPageProps) {
  const resolvedParams = use(params)
  const eventoId = resolvedParams.id
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [lojas, setLojas] = useState<Loja[]>([])
  const [lojasLoading, setLojasLoading] = useState(true)
  const [formData, setFormData] = useState({
    nome: "",
    descricao: "",
    imagem: "",
    dataInicio: new Date(),
    dataFim: new Date(),
    ativo: false,
    lojasParticipantes: [] as string[],
  })

  // Remover o useEffect para definir eventoId, já que agora temos o valor diretamente
  // Fetch event data
  useEffect(() => {
    if (!eventoId) return

    const fetchEvento = async () => {
      setIsLoading(true)
      try {
        const baseUrl = window.location.origin
        const response = await fetch(`${baseUrl}/api/admin/eventos/${eventoId}`)
        if (!response.ok) throw new Error("Falha ao buscar evento")

        const data = await response.json()
        const evento = data.evento

        setFormData({
          nome: evento.nome || "",
          descricao: evento.descricao || "",
          imagem: evento.imagem || "",
          dataInicio: new Date(evento.dataInicio),
          dataFim: new Date(evento.dataFim),
          ativo: evento.ativo || false,
          lojasParticipantes: evento.lojasParticipantes || [],
        })
      } catch (error) {
        console.error("Erro ao buscar evento:", error)
        toast.error("Erro ao carregar dados do evento")
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvento()
  }, [eventoId])

  // Fetch available stores
  useEffect(() => {
    const fetchLojas = async () => {
      try {
        const baseUrl = window.location.origin
        const response = await fetch(`${baseUrl}/api/admin/lojas`)
        if (!response.ok) throw new Error("Falha ao buscar lojas")

        const data = await response.json()
        setLojas(data.lojas || [])
      } catch (error) {
        console.error("Erro ao buscar lojas:", error)
        toast.error("Erro ao carregar lojas")
      } finally {
        setLojasLoading(false)
      }
    }

    fetchLojas()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, ativo: checked }))
  }

  const handleDateChange = (field: "dataInicio" | "dataFim", date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, [field]: date }))
    }
  }

  const handleLojaToggle = (lojaId: string, checked: boolean) => {
    setFormData((prev) => {
      if (checked) {
        return { ...prev, lojasParticipantes: [...prev.lojasParticipantes, lojaId] }
      } else {
        return { ...prev, lojasParticipantes: prev.lojasParticipantes.filter((id) => id !== lojaId) }
      }
    })
  }

  const handleImageChange = (value: string | string[]) => {
    setFormData((prev) => ({ ...prev, imagem: typeof value === "string" ? value : value[0] || "" }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!eventoId) return

    setIsSaving(true)

    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/${eventoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao atualizar evento")
      }

      toast.success("Evento atualizado com sucesso!")
    } catch (error) {
      console.error("Erro ao atualizar evento:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar evento")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!eventoId) return

    setIsDeleting(true)

    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/${eventoId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao excluir evento")
      }

      toast.success("Evento excluído com sucesso!")
      router.push("/admin/eventos")
    } catch (error) {
      console.error("Erro ao excluir evento:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao excluir evento")
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Editar Evento</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Voltar
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o evento e todos os dados associados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Excluindo...
                    </>
                  ) : (
                    "Sim, excluir evento"
                  )}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Evento</CardTitle>
                <CardDescription>Edite os dados do evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="nome">Nome do Evento *</Label>
                  <Input
                    id="nome"
                    name="nome"
                    value={formData.nome}
                    onChange={handleInputChange}
                    placeholder="Ex: Feira de Negócios 2023"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea
                    id="descricao"
                    name="descricao"
                    value={formData.descricao}
                    onChange={handleInputChange}
                    placeholder="Descreva o evento..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Imagem do Evento</Label>
                  <ImageUpload value={formData.imagem} onChange={handleImageChange} />
                  <p className="text-sm text-muted-foreground">
                    Imagem de destaque que será exibida na página de registro
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Data de Início *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(formData.dataInicio, "PPP", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dataInicio}
                          onSelect={(date) => handleDateChange("dataInicio", date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="space-y-2">
                    <Label>Data de Término *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(formData.dataFim, "PPP", { locale: ptBR })}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={formData.dataFim}
                          onSelect={(date) => handleDateChange("dataFim", date)}
                          initialFocus
                          disabled={(date) => date < formData.dataInicio}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex items-center space-x-2 pt-2">
                  <Switch id="ativo" checked={formData.ativo} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="ativo">Ativar evento</Label>
                </div>
                {formData.ativo && (
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    Atenção: Ativar este evento irá desativar qualquer outro evento ativo.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Lojas Participantes</CardTitle>
                <CardDescription>Selecione as lojas que participarão do evento</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <StoreSelector selectedStores={formData.lojasParticipantes} onStoreToggle={handleLojaToggle} />

                {formData.lojasParticipantes.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      {formData.lojasParticipantes.length}{" "}
                      {formData.lojasParticipantes.length === 1 ? "loja selecionada" : "lojas selecionadas"}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSaving || !formData.nome || formData.lojasParticipantes.length === 0}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  )
}

