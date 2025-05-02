"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, Store, ExternalLink, Check, Clock } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

interface EventosCarouselProps {
  lojaId?: string
}

interface Evento {
  _id: string
  nome: string
  descricao: string
  imagem: string
  dataInicio: string
  dataFim: string
  ativo: boolean
  lojasParticipantes: string[]
  participacaoAprovada?: boolean
  participacaoPendente?: boolean
  participacaoRejeitada?: boolean
}

export function EventosCarousel({ lojaId }: EventosCarouselProps) {
  const [eventos, setEventos] = useState<Evento[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [participando, setParticipando] = useState<Record<string, boolean>>({})
  const [pendente, setPendente] = useState<Record<string, boolean>>({})
  const [rejeitado, setRejeitado] = useState<Record<string, boolean>>({})
  const [loadingParticipacao, setLoadingParticipacao] = useState<Record<string, boolean>>({})
  const [error, setError] = useState<string | null>(null)

  // Buscar eventos disponíveis
  useEffect(() => {
    async function fetchEventos() {
      if (!lojaId) {
        console.log("EventosCarousel: lojaId não fornecido")
        setLoading(false)
        return
      }

      try {
        console.log("EventosCarousel: Buscando eventos para lojaId:", lojaId)
        setLoading(true)
        const response = await fetch(`/api/eventos/disponiveis?lojaId=${lojaId}`)

        if (!response.ok) {
          console.error("EventosCarousel: Erro na resposta da API:", response.status)
          const text = await response.text()
          console.error("EventosCarousel: Detalhes do erro:", text)
          setError(`Erro ao buscar eventos: ${response.status}`)
          setLoading(false)
          return
        }

        const data = await response.json()
        console.log("EventosCarousel: Eventos recebidos:", data)

        if (data.eventos && data.eventos.length > 0) {
          console.log("EventosCarousel: Eventos encontrados:", data.eventos.length)
          console.log("EventosCarousel: Primeiro evento:", data.eventos[0])

          setEventos(data.eventos)

          // Inicializar estados de participação
          const participandoState: Record<string, boolean> = {}
          const pendenteState: Record<string, boolean> = {}
          const rejeitadoState: Record<string, boolean> = {}

          data.eventos.forEach((evento: Evento) => {
            participandoState[evento._id] = evento.participacaoAprovada || false
            pendenteState[evento._id] = evento.participacaoPendente || false
            rejeitadoState[evento._id] = evento.participacaoRejeitada || false
          })

          setParticipando(participandoState)
          setPendente(pendenteState)
          setRejeitado(rejeitadoState)
        } else {
          console.log("EventosCarousel: Nenhum evento disponível")
        }
      } catch (error) {
        console.error("EventosCarousel: Erro ao buscar eventos:", error)
        setError(`Erro ao buscar eventos: ${error instanceof Error ? error.message : String(error)}`)
      } finally {
        setLoading(false)
      }
    }

    fetchEventos()
  }, [lojaId])

  // Participar do evento
  const handleParticipar = async (eventoId: string) => {
    if (!lojaId) return

    setLoadingParticipacao((prev) => ({ ...prev, [eventoId]: true }))

    try {
      const response = await fetch(`/api/eventos/${eventoId}/participar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lojaId }),
      })

      if (response.ok) {
        setPendente((prev) => ({ ...prev, [eventoId]: true }))
        toast.success("Solicitação de participação enviada com sucesso!")
      } else {
        const data = await response.json()
        toast.error(data.error || "Erro ao solicitar participação no evento")
      }
    } catch (error) {
      console.error("Erro ao participar do evento:", error)
      toast.error("Erro ao solicitar participação no evento")
    } finally {
      setLoadingParticipacao((prev) => ({ ...prev, [eventoId]: false }))
    }
  }

  const nextSlide = () => {
    if (eventos.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex + 1) % eventos.length)
  }

  const prevSlide = () => {
    if (eventos.length <= 1) return
    setCurrentIndex((prevIndex) => (prevIndex - 1 + eventos.length) % eventos.length)
  }

  // Renderização condicional para debugging
  console.log("EventosCarousel: Estado atual:", {
    loading,
    eventosCount: eventos.length,
    lojaId,
    error,
  })

  if (loading) {
    return (
      <section>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Eventos Disponíveis
        </h3>
        <Card className="relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-800 to-gray-900" />
          <CardContent className="relative z-[1] p-6 text-white flex items-center justify-center h-[200px]">
            <div className="animate-pulse flex flex-col items-center">
              <Calendar className="h-10 w-10 mb-4 opacity-50" />
              <div className="h-6 w-48 bg-white/20 rounded mb-2"></div>
              <div className="h-4 w-64 bg-white/10 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  if (error) {
    return (
      <section>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Eventos Disponíveis
        </h3>
        <Card className="relative overflow-hidden mb-6">
          <CardContent className="p-6 flex items-center justify-center h-[200px]">
            <div className="text-center">
              <p className="text-red-500 mb-2">Erro ao carregar eventos</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button onClick={() => window.location.reload()} className="mt-4" variant="outline">
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  // Se não houver eventos, mostra uma mensagem
  if (eventos.length === 0) {
    return (
      <section>
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Eventos Disponíveis
        </h3>
        <Card className="relative overflow-hidden mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-900" />
          <CardContent className="relative z-[1] p-6 flex items-center justify-center h-[200px]">
            <div className="text-center">
              <Calendar className="h-10 w-10 mb-4 mx-auto text-gray-400" />
              <h3 className="text-lg font-medium mb-2">Nenhum evento disponível</h3>
              <p className="text-sm text-muted-foreground">No momento não há eventos disponíveis para participação.</p>
            </div>
          </CardContent>
        </Card>
      </section>
    )
  }

  const currentEvento = eventos[currentIndex]

  return (
    <section>
      <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
        <Calendar className="h-5 w-5 text-primary" />
        Eventos Disponíveis
      </h3>
      <Card
        className="relative overflow-hidden mb-6"
        style={{
          backgroundImage: currentEvento.imagem ? `url(${currentEvento.imagem})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/60" />

        {eventos.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20 rounded-full"
              onClick={prevSlide}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-black/20 rounded-full"
              onClick={nextSlide}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}

        <CardContent className="relative z-[1] p-6 text-white">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            {currentEvento.imagem && (
              <div className="hidden md:block w-24 h-24 relative rounded-lg overflow-hidden border border-white/20">
                <Image
                  src={currentEvento.imagem || "/placeholder.svg"}
                  alt={currentEvento.nome}
                  fill
                  className="object-cover"
                />
              </div>
            )}

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-primary" />
                <span className="text-xs font-medium bg-primary/20 px-2 py-0.5 rounded-full">
                  {format(new Date(currentEvento.dataInicio), "dd MMM", { locale: ptBR })} -
                  {format(new Date(currentEvento.dataFim), "dd MMM, yyyy", { locale: ptBR })}
                </span>
              </div>

              <h3 className="text-xl font-bold mb-1">{currentEvento.nome}</h3>
              <p className="text-sm text-gray-200 mb-4 line-clamp-2">{currentEvento.descricao}</p>

              <div className="flex flex-wrap items-center gap-3">
                {participando[currentEvento._id] ? (
                  <div className="flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                    <Check className="h-4 w-4" />
                    Participando
                  </div>
                ) : pendente[currentEvento._id] ? (
                  <div className="flex items-center gap-2 bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm">
                    <Clock className="h-4 w-4" />
                    Solicitação pendente
                  </div>
                ) : rejeitado[currentEvento._id] ? (
                  <div className="flex items-center gap-2 bg-red-500/20 text-red-300 px-3 py-1 rounded-full text-sm">
                    <Clock className="h-4 w-4" />
                    Solicitação rejeitada
                  </div>
                ) : (
                  <Button
                    onClick={() => handleParticipar(currentEvento._id)}
                    disabled={loadingParticipacao[currentEvento._id]}
                    className="bg-white text-black hover:bg-gray-200"
                  >
                    {loadingParticipacao[currentEvento._id] ? "Processando..." : "Participar"}
                  </Button>
                )}

                <div className="flex items-center gap-1 text-sm text-gray-300">
                  <Store className="h-4 w-4" />
                  <span>{currentEvento.lojasParticipantes?.length || 0} lojas participantes</span>
                </div>

                <Link
                  href={`/eventos/${currentEvento._id}`}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <ExternalLink className="h-3 w-3" />
                  Ver detalhes
                </Link>
              </div>
            </div>
          </div>

          {eventos.length > 1 && (
            <div className="flex justify-center mt-4 gap-1">
              {eventos.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 rounded-full transition-all ${
                    index === currentIndex ? "w-6 bg-white" : "w-2 bg-white/40"
                  }`}
                  onClick={() => setCurrentIndex(index)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  )
}
