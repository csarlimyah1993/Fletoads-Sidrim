"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, ExternalLink, Users, Calendar, FileText } from 'lucide-react'
import { toast } from "sonner"

interface EventoCardProps {
  lojaId?: string
}

interface Evento {
  _id: string
  nome: string
  descricao: string
  imagem: string
  dataInicio: string
  dataFim: string
  documentacao?: string
}

interface Metricas {
  visitantes: number
  conversoes: number
}

export function EventoCard({ lojaId }: EventoCardProps) {
  const [evento, setEvento] = useState<Evento | null>(null)
  const [isParticipando, setIsParticipando] = useState(false)
  const [metricas, setMetricas] = useState<Metricas | null>(null)
  const [loading, setLoading] = useState(false)
  const [fechado, setFechado] = useState(false)
  const [loadingParticipacao, setLoadingParticipacao] = useState(false)

  // Buscar evento ativo
  useEffect(() => {
    async function fetchEventoAtivo() {
      try {
        const response = await fetch("/api/eventos/ativo")
        if (response.ok) {
          const data = await response.json()
          if (data.evento) {
            setEvento(data.evento)
            // Verificar se a loja já está participando
            checkParticipacao(data.evento._id)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar evento ativo:", error)
      }
    }

    if (!fechado && lojaId) {
      fetchEventoAtivo()
    }
  }, [lojaId, fechado])

  // Verificar se a loja já está participando do evento
  const checkParticipacao = async (eventoId: string) => {
    if (!lojaId) return
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}/participacao?lojaId=${lojaId}`)
      if (response.ok) {
        const data = await response.json()
        setIsParticipando(data.participando)
        if (data.participando) {
          fetchMetricas(eventoId)
        }
      }
    } catch (error) {
      console.error("Erro ao verificar participação:", error)
    }
  }

  // Buscar métricas do evento para a loja
  const fetchMetricas = async (eventoId: string) => {
    if (!lojaId) return
    
    try {
      const response = await fetch(`/api/eventos/${eventoId}/metricas?lojaId=${lojaId}`)
      if (response.ok) {
        const data = await response.json()
        setMetricas(data.metricas)
      }
    } catch (error) {
      console.error("Erro ao buscar métricas:", error)
    }
  }

  // Participar do evento
  const handleParticipar = async () => {
    if (!evento || !lojaId) return

    setLoadingParticipacao(true)
    try {
      const response = await fetch(`/api/eventos/${evento._id}/participar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lojaId }),
      })

      if (response.ok) {
        setIsParticipando(true)
        toast.success("Sua loja foi inscrita no evento com sucesso!")
        fetchMetricas(evento._id)
      } else {
        const data = await response.json()
        toast.error(data.error || "Erro ao participar do evento")
      }
    } catch (error) {
      console.error("Erro ao participar do evento:", error)
      toast.error("Erro ao participar do evento")
    } finally {
      setLoadingParticipacao(false)
    }
  }

  if (!evento || fechado) return null

  return (
    <Card
      className="relative overflow-hidden mb-6"
      style={{
        backgroundImage: evento.imagem ? `url(${evento.imagem})` : undefined,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/60" />
      <button
        onClick={() => setFechado(true)}
        className="absolute top-2 right-2 p-1 rounded-full bg-black/20 hover:bg-black/40 text-white z-10"
        aria-label="Fechar"
      >
        <X className="h-4 w-4" />
      </button>
      <CardContent className="relative z-[1] p-6 text-white">
        {isParticipando ? (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{evento.nome}</h3>
              <p className="text-sm text-gray-200 mt-1">Sua loja está participando deste evento</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-200 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="text-xs">Visitantes</span>
                </div>
                <p className="text-xl font-bold">{metricas?.visitantes || 0}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-gray-200 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">Conversões</span>
                </div>
                <p className="text-xl font-bold">{metricas?.conversoes || 0}</p>
              </div>
            </div>
            {evento.documentacao && (
              <a
                href={evento.documentacao}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200 mt-2"
              >
                <FileText className="h-4 w-4" />
                Documentação do evento
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">{evento.nome}</h3>
              <p className="text-sm text-gray-200 mt-1">{evento.descricao}</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={handleParticipar}
                disabled={loadingParticipacao}
                className="bg-white text-black hover:bg-gray-200"
              >
                {loadingParticipacao ? "Processando..." : "Participar"}
              </Button>
              {evento.documentacao && (
                <a
                  href={evento.documentacao}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-300 hover:text-blue-200"
                >
                  <FileText className="h-4 w-4" />
                  Documentação
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}