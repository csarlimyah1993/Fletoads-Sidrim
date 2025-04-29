"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Check, Loader2, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { StoreSelector } from "@/components/admin/store-selector"
import { ImageUpload } from "@/components/ui/image-upload"
import { DocumentUpload, type DocumentInfo } from "@/components/ui/documents-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Loja {
  _id: string
  nome: string
  logo?: string
  ativo?: boolean
}

export default function CriarEventoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
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
    documentos: [] as DocumentInfo[],
  })

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

  const handleDocumentsChange = (documents: DocumentInfo[]) => {
    setFormData((prev) => ({ ...prev, documentos: documents }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/novo`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao criar evento")
      }

      toast.success("Evento criado com sucesso!")
      router.push("/admin/eventos")
    } catch (error) {
      console.error("Erro ao criar evento:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar evento")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Criar Novo Evento</h1>
        <Button variant="outline" onClick={() => router.back()}>
          Voltar
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="informacoes" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
                <TabsTrigger value="documentos">Documentos</TabsTrigger>
              </TabsList>

              <TabsContent value="informacoes">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Evento</CardTitle>
                    <CardDescription>Preencha os dados básicos do evento</CardDescription>
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
              </TabsContent>

              <TabsContent value="documentos">
                <Card>
                  <CardHeader>
                    <CardTitle>Documentos do Evento</CardTitle>
                    <CardDescription>
                      Adicione documentos como termos de participação, regulamentos, contratos, etc.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DocumentUpload
                      value={formData.documentos}
                      onChange={handleDocumentsChange}
                      maxFiles={5}
                      allowedTypes={[".pdf", ".doc", ".docx", ".txt"]}
                      maxSize={5}
                    />

                    <div className="mt-4 text-sm text-muted-foreground">
                      <p>Estes documentos estarão disponíveis para download pelos lojistas participantes do evento.</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
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
                  disabled={isLoading || !formData.nome || formData.lojasParticipantes.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Criando...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Criar Evento
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {formData.documentos.length > 0 && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Resumo dos Documentos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{formData.documentos.length} documentos anexados</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}
