"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Check, X, Loader2, Store, Calendar, User } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface ParticipacaoEvento {
  _id: string
  eventoId: string
  eventoNome: string
  lojaId: string
  lojaNome: string
  lojaLogo?: string
  status: "pendente" | "aprovado" | "rejeitado"
  dataSolicitacao: string
  dataResposta?: string
}

interface Evento {
  _id: string
  nome: string
  dataInicio: string
  dataFim: string
}

export function ParticipacaoEventos() {
  const [participacoes, setParticipacoes] = useState<ParticipacaoEvento[]>([])
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [eventoSelecionado, setEventoSelecionado] = useState<string>("todos")
  const [statusFiltro, setStatusFiltro] = useState<string>("pendente")
  const [processando, setProcessando] = useState<Record<string, boolean>>({})

  // Buscar participações e eventos
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Buscar eventos
        const eventosResponse = await fetch("/api/admin/eventos")
        if (eventosResponse.ok) {
          const eventosData = await eventosResponse.json()
          setEventos(eventosData.eventos || [])
        }

        // Buscar participações
        const participacoesResponse = await fetch("/api/admin/participacoes-eventos")
        if (participacoesResponse.ok) {
          const participacoesData = await participacoesResponse.json()
          setParticipacoes(participacoesData.participacoes || [])
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        toast.error("Erro ao carregar dados de participação")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filtrar participações
  const participacoesFiltradas = participacoes.filter((p) => {
    if (eventoSelecionado !== "todos" && p.eventoId !== eventoSelecionado) {
      return false
    }

    if (statusFiltro !== "todos" && p.status !== statusFiltro) {
      return false
    }

    return true
  })

  // Aprovar participação
  const aprovarParticipacao = async (participacaoId: string) => {
    try {
      setProcessando((prev) => ({ ...prev, [participacaoId]: true }))

      const response = await fetch(`/api/admin/participacoes-eventos/${participacaoId}/aprovar`, {
        method: "POST",
      })

      if (response.ok) {
        // Atualizar estado local
        setParticipacoes((prev) =>
          prev.map((p) =>
            p._id === participacaoId ? { ...p, status: "aprovado", dataResposta: new Date().toISOString() } : p,
          ),
        )

        toast.success("Participação aprovada com sucesso")
      } else {
        const data = await response.json()
        throw new Error(data.error || "Erro ao aprovar participação")
      }
    } catch (error) {
      console.error("Erro ao aprovar participação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao aprovar participação")
    } finally {
      setProcessando((prev) => ({ ...prev, [participacaoId]: false }))
    }
  }

  // Rejeitar participação
  const rejeitarParticipacao = async (participacaoId: string) => {
    try {
      setProcessando((prev) => ({ ...prev, [participacaoId]: true }))

      const response = await fetch(`/api/admin/participacoes-eventos/${participacaoId}/rejeitar`, {
        method: "POST",
      })

      if (response.ok) {
        // Atualizar estado local
        setParticipacoes((prev) =>
          prev.map((p) =>
            p._id === participacaoId ? { ...p, status: "rejeitado", dataResposta: new Date().toISOString() } : p,
          ),
        )

        toast.success("Participação rejeitada")
      } else {
        const data = await response.json()
        throw new Error(data.error || "Erro ao rejeitar participação")
      }
    } catch (error) {
      console.error("Erro ao rejeitar participação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao rejeitar participação")
    } finally {
      setProcessando((prev) => ({ ...prev, [participacaoId]: false }))
    }
  }

  // Formatar data
  const formatarData = (dataString: string) => {
    try {
      return format(new Date(dataString), "dd/MM/yyyy HH:mm", { locale: ptBR })
    } catch (error) {
      return "Data inválida"
    }
  }

  // Obter badge de status
  const getBadgeStatus = (status: string) => {
    switch (status) {
      case "pendente":
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
            Pendente
          </Badge>
        )
      case "aprovado":
        return <Badge className="bg-green-100 text-green-800 border-green-300">Aprovado</Badge>
      case "rejeitado":
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
            Rejeitado
          </Badge>
        )
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Solicitações de Participação em Eventos</CardTitle>
        <CardDescription>Gerencie as solicitações de participação de lojas em eventos</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium mb-1 block">Filtrar por Evento</label>
            <select
              className="w-full p-2 border rounded-md bg-background"
              value={eventoSelecionado}
              onChange={(e) => setEventoSelecionado(e.target.value)}
            >
              <option value="todos">Todos os eventos</option>
              {eventos.map((evento) => (
                <option key={evento._id} value={evento._id}>
                  {evento.nome}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Status</label>
            <Tabs value={statusFiltro} onValueChange={setStatusFiltro} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="pendente">Pendentes</TabsTrigger>
                <TabsTrigger value="aprovado">Aprovados</TabsTrigger>
                <TabsTrigger value="rejeitado">Rejeitados</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {participacoesFiltradas.length === 0 ? (
          <div className="text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma solicitação encontrada</h3>
            <p className="text-muted-foreground">
              {statusFiltro === "pendente"
                ? "Não há solicitações pendentes de aprovação"
                : statusFiltro === "aprovado"
                  ? "Não há solicitações aprovadas"
                  : "Não há solicitações rejeitadas"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {participacoesFiltradas.map((participacao) => (
              <div
                key={participacao._id}
                className="border rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    {participacao.lojaLogo ? (
                      <AvatarImage src={participacao.lojaLogo || "/placeholder.svg"} alt={participacao.lojaNome} />
                    ) : null}
                    <AvatarFallback>{participacao.lojaNome.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium">{participacao.lojaNome}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>{participacao.eventoNome}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full md:w-auto">
                  <div className="flex flex-col gap-1 w-full md:w-auto">
                    <div className="flex items-center gap-2">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">
                        Solicitado em {formatarData(participacao.dataSolicitacao)}
                      </span>
                    </div>
                    {participacao.dataResposta && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          Respondido em {formatarData(participacao.dataResposta)}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-auto">
                    {getBadgeStatus(participacao.status)}

                    {participacao.status === "pendente" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:text-green-800"
                          onClick={() => aprovarParticipacao(participacao._id)}
                          disabled={processando[participacao._id]}
                        >
                          {processando[participacao._id] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Check className="h-3 w-3 mr-1" />
                          )}
                          Aprovar
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:text-red-800"
                          onClick={() => rejeitarParticipacao(participacao._id)}
                          disabled={processando[participacao._id]}
                        >
                          {processando[participacao._id] ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          Rejeitar
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
