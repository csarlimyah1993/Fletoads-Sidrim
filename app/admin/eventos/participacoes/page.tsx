"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Check, X, Store, Calendar, User } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Loja {
  _id: string
  nome: string
  logo?: string
}

interface Usuario {
  _id: string
  nome: string
  email: string
}

interface Evento {
  _id: string
  nome: string
}

interface Participacao {
  _id: string
  eventoId: string
  eventoNome: string
  lojaId: string
  usuarioId: string
  status: "pendente" | "aprovada" | "rejeitada"
  dataSolicitacao: string
  dataResposta?: string
  loja?: Loja
  usuario?: Usuario
  evento?: Evento
}

export default function SolicitacoesParticipacaoPage() {
  const router = useRouter()
  const [participacoes, setParticipacoes] = useState<Participacao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("pendentes")

  useEffect(() => {
    fetchParticipacoes()
  }, [])

  const fetchParticipacoes = async () => {
    try {
      setIsLoading(true)
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/participacoes/solicitacoes`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar solicitações: ${response.status}`)
      }

      const data = await response.json()
      setParticipacoes(data.participacoes || [])
    } catch (error) {
      console.error("Erro ao buscar solicitações:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao carregar solicitações")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAprovar = async (participacaoId: string) => {
    try {
      setIsProcessing(participacaoId)
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/participacoes/solicitacoes/${participacaoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "aprovada",
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao aprovar solicitação")
      }

      toast.success("Solicitação aprovada com sucesso")

      // Atualizar a lista de participações
      setParticipacoes(
        participacoes.map((p) =>
          p._id === participacaoId ? { ...p, status: "aprovada", dataResposta: new Date().toISOString() } : p,
        ),
      )
    } catch (error) {
      console.error("Erro ao aprovar solicitação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao aprovar solicitação")
    } finally {
      setIsProcessing(null)
    }
  }

  const handleRejeitar = async (participacaoId: string) => {
    try {
      setIsProcessing(participacaoId)
      const baseUrl = window.location.origin
      const response = await fetch(`${baseUrl}/api/admin/eventos/participacoes/solicitacoes/${participacaoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "rejeitada",
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao rejeitar solicitação")
      }

      toast.success("Solicitação rejeitada com sucesso")

      // Atualizar a lista de participações
      setParticipacoes(
        participacoes.map((p) =>
          p._id === participacaoId ? { ...p, status: "rejeitada", dataResposta: new Date().toISOString() } : p,
        ),
      )
    } catch (error) {
      console.error("Erro ao rejeitar solicitação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao rejeitar solicitação")
    } finally {
      setIsProcessing(null)
    }
  }

  const filteredParticipacoes = participacoes.filter((p) => {
    if (activeTab === "pendentes") return p.status === "pendente"
    if (activeTab === "aprovadas") return p.status === "aprovada"
    if (activeTab === "rejeitadas") return p.status === "rejeitada"
    return true
  })

  if (isLoading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button variant="outline" onClick={() => router.push("/admin/eventos")} className="mb-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar para eventos
          </Button>
          <h1 className="text-2xl font-bold">Solicitações de Participação</h1>
          <p className="text-muted-foreground">Gerencie as solicitações de participação em eventos</p>
        </div>
      </div>

      <Tabs defaultValue="pendentes" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="pendentes">
            Pendentes
            {participacoes.filter((p) => p.status === "pendente").length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {participacoes.filter((p) => p.status === "pendente").length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="aprovadas">Aprovadas</TabsTrigger>
          <TabsTrigger value="rejeitadas">Rejeitadas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendentes" className="mt-0">
          {filteredParticipacoes.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">Nenhuma solicitação pendente encontrada</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredParticipacoes.map((participacao) => (
                <Card key={participacao._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {participacao.loja?.logo ? (
                              <AvatarImage
                                src={participacao.loja.logo || "/placeholder.svg"}
                                alt={participacao.loja?.nome || ""}
                              />
                            ) : (
                              <AvatarFallback>
                                <Store className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{participacao.loja?.nome || "Loja não encontrada"}</h3>
                            <p className="text-sm text-muted-foreground">
                              Solicitado em{" "}
                              {format(new Date(participacao.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{participacao.eventoNome}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {participacao.usuario?.nome || participacao.usuario?.email || "Usuário desconhecido"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 self-end md:self-center">
                        <Button
                          variant="outline"
                          className="border-red-200 hover:bg-red-50 hover:text-red-600"
                          onClick={() => handleRejeitar(participacao._id)}
                          disabled={isProcessing === participacao._id}
                        >
                          {isProcessing === participacao._id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <X className="h-4 w-4 mr-2" />
                          )}
                          Rejeitar
                        </Button>
                        <Button
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleAprovar(participacao._id)}
                          disabled={isProcessing === participacao._id}
                        >
                          {isProcessing === participacao._id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          Aprovar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="aprovadas" className="mt-0">
          {filteredParticipacoes.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">Nenhuma solicitação aprovada encontrada</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredParticipacoes.map((participacao) => (
                <Card key={participacao._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {participacao.loja?.logo ? (
                              <AvatarImage
                                src={participacao.loja.logo || "/placeholder.svg"}
                                alt={participacao.loja?.nome || ""}
                              />
                            ) : (
                              <AvatarFallback>
                                <Store className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{participacao.loja?.nome || "Loja não encontrada"}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                Solicitado em{" "}
                                {format(new Date(participacao.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                Aprovada
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{participacao.eventoNome}</span>
                          </div>
                        </div>
                      </div>
                      <Button variant="outline" onClick={() => router.push(`/admin/eventos/${participacao.eventoId}`)}>
                        Ver Evento
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejeitadas" className="mt-0">
          {filteredParticipacoes.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center">
                  <p className="text-muted-foreground">Nenhuma solicitação rejeitada encontrada</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredParticipacoes.map((participacao) => (
                <Card key={participacao._id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            {participacao.loja?.logo ? (
                              <AvatarImage
                                src={participacao.loja.logo || "/placeholder.svg"}
                                alt={participacao.loja?.nome || ""}
                              />
                            ) : (
                              <AvatarFallback>
                                <Store className="h-4 w-4" />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <h3 className="font-medium">{participacao.loja?.nome || "Loja não encontrada"}</h3>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-muted-foreground">
                                Solicitado em{" "}
                                {format(new Date(participacao.dataSolicitacao), "dd/MM/yyyy", { locale: ptBR })}
                              </p>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                Rejeitada
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{participacao.eventoNome}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
