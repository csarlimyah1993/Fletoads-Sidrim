"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Instagram,
  Mail,
  Facebook,
  FileText,
  Download,
  Check,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { toast } from "sonner"
import { useSession } from "next-auth/react"

interface EventoDetalhesProps {
  id: string
}

interface Documento {
  nome: string
  url: string
  tipo: string
}

interface Evento {
  _id: string
  nome: string
  descricao: string
  imagem: string
  dataInicio: string
  dataFim: string
  ativo: boolean
  documentos: Documento[]
  lojasParticipantes?: string[]
  comercializacao?: {
    title: string
    items: string[]
  }[]
  participacao?: {
    title: string
    items: string[]
  }[]
}

type ParticipacaoStatus = "nao-participando" | "pendente" | "aprovado" | "rejeitado" | "carregando"

export function EventoDetalhes({ id }: EventoDetalhesProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const [evento, setEvento] = useState<Evento | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [infoExpanded, setInfoExpanded] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [docsExpanded, setDocsExpanded] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showParticipacaoModal, setShowParticipacaoModal] = useState(false)
  const [participacaoStatus, setParticipacaoStatus] = useState<ParticipacaoStatus>("carregando")
  const [loadingParticipacao, setLoadingParticipacao] = useState(false)

  // Buscar detalhes do evento
  useEffect(() => {
    async function fetchEvento() {
      try {
        console.log("EventoDetalhes: Buscando evento com ID:", id)
        setLoading(true)
        const response = await fetch(`/api/eventos/${id}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar evento: ${response.status}`)
        }

        const data = await response.json()
        console.log("EventoDetalhes: Evento recebido:", data.evento)
        setEvento(data.evento)

        // Verificar status de participação se o usuário estiver logado
        if (session?.user) {
          await checkParticipacaoStatus(data.evento)
        } else {
          setParticipacaoStatus("nao-participando")
        }
      } catch (error) {
        console.error("Erro ao buscar evento:", error)
        setError(error instanceof Error ? error.message : "Erro ao carregar evento")
      } finally {
        setLoading(false)
      }
    }

    fetchEvento()
  }, [id, session])

  // Verificar status de participação
  const checkParticipacaoStatus = async (eventoData?: Evento) => {
    if (!session?.user) {
      setParticipacaoStatus("nao-participando")
      return
    }

    try {
      console.log("EventoDetalhes: Verificando status de participação")
      const lojaId = session.user.lojaId
      if (!lojaId) {
        console.log("EventoDetalhes: Usuário não tem lojaId")
        setParticipacaoStatus("nao-participando")
        return
      }

      // Verificar se a loja está na lista de participantes do evento
      const eventoAtual = eventoData || evento
      if (eventoAtual?.lojasParticipantes && eventoAtual.lojasParticipantes.includes(lojaId)) {
        console.log("EventoDetalhes: Loja já está participando do evento")
        setParticipacaoStatus("aprovado")
        return
      }

      // Se não estiver na lista, verificar se há uma solicitação pendente
      const response = await fetch(`/api/eventos/${id}/status-participacao?lojaId=${lojaId}`)

      if (!response.ok) {
        throw new Error("Erro ao verificar status de participação")
      }

      const data = await response.json()
      console.log("EventoDetalhes: Status de participação:", data.status)
      setParticipacaoStatus(data.status)
    } catch (error) {
      console.error("Erro ao verificar status de participação:", error)
      setParticipacaoStatus("nao-participando")
    }
  }

  // Solicitar participação no evento
  const handleSolicitarParticipacao = async () => {
    if (!session?.user || !session.user.lojaId) {
      toast.error("Você precisa estar logado e ter uma loja cadastrada para participar")
      return
    }

    setLoadingParticipacao(true)

    try {
      const response = await fetch(`/api/eventos/${id}/participar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lojaId: session.user.lojaId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao solicitar participação")
      }

      toast.success("Solicitação de participação enviada com sucesso!")
      setParticipacaoStatus("pendente")
      setShowParticipacaoModal(false)
    } catch (error) {
      console.error("Erro ao solicitar participação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao solicitar participação")
    } finally {
      setLoadingParticipacao(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handlePrevSlide = () => {
    if (!evento?.imagem) return
    setCurrentSlide((prev) => (prev === 0 ? 0 : prev - 1))
  }

  const handleNextSlide = () => {
    if (!evento?.imagem) return
    setCurrentSlide((prev) => (prev === 0 ? 0 : prev + 1))
  }

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

  const handleParticiparEvento = () => {
    if (!session?.user) {
      toast.error("Você precisa estar logado para participar do evento")
      router.push(`/login?callbackUrl=/eventos/${id}`)
      return
    }

    setShowParticipacaoModal(true)
  }

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="mb-6 overflow-hidden">
          <div className="p-4 flex justify-between">
            <Skeleton className="h-10 w-24" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
          <Skeleton className="h-[300px] md:h-[400px] w-full" />
        </Card>

        <div className="mb-6">
          <Skeleton className="h-8 w-32 mb-2" />
          <Skeleton className="h-10 w-3/4 mb-4" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-full mb-2" />
          <Skeleton className="h-6 w-2/3" />
        </div>

        <Skeleton className="h-[200px] w-full mb-6" />
        <Skeleton className="h-[200px] w-full mb-6" />
      </div>
    )
  }

  // Renderizar mensagem de erro
  if (error || !evento) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold mb-2">Erro ao carregar evento</h2>
            <p className="text-gray-500 mb-4">{error || "Evento não encontrado"}</p>
            <Button onClick={handleBack}>Voltar</Button>
          </div>
        </Card>
      </div>
    )
  }

  // Preparar imagens para o carrossel
  const images = evento.imagem ? [evento.imagem] : ["/placeholder.svg?height=400&width=800"]

  // Formatar período do evento
  const periodo = `${format(new Date(evento.dataInicio), "dd 'de' MMMM", { locale: ptBR })} a ${format(
    new Date(evento.dataFim),
    "dd 'de' MMMM 'de' yyyy",
    { locale: ptBR },
  )}`

  // Preparar descrição para exibição
  const descricaoParagrafos = evento.descricao ? evento.descricao.split("\n").filter((p) => p.trim()) : []

  // Dados de comercialização e participação
  const comercializacao = evento.comercializacao || [
    {
      title: "Informações de Comercialização",
      items: ["Consulte os documentos do evento para detalhes sobre o que pode ser comercializado."],
    },
  ]

  const participacao = evento.participacao || [
    {
      title: "Requisitos para Participação",
      items: [
        "Cadastro completo e aprovado na plataforma.",
        "Aprovação da solicitação pelos organizadores do evento.",
        "Cumprimento dos prazos de cadastro.",
        "Assinatura de pacote ativo.",
      ],
    },
  ]

  // Renderizar botão de participação baseado no status
  const renderBotaoParticipacao = () => {
    if (participacaoStatus === "carregando") {
      return (
        <Button className="bg-gray-400 hover:bg-gray-500" disabled>
          <Skeleton className="h-4 w-24" />
        </Button>
      )
    }

    if (participacaoStatus === "aprovado") {
      return (
        <Button className="bg-green-600 hover:bg-green-700" disabled>
          <Check className="h-4 w-4 mr-2" />
          Participando
        </Button>
      )
    }

    if (participacaoStatus === "pendente") {
      return (
        <Button className="bg-yellow-600 hover:bg-yellow-700" disabled>
          <Clock className="h-4 w-4 mr-2" />
          Solicitação pendente
        </Button>
      )
    }

    if (participacaoStatus === "rejeitado") {
      return (
        <Button className="bg-red-600 hover:bg-red-700" disabled>
          <X className="h-4 w-4 mr-2" />
          Solicitação rejeitada
        </Button>
      )
    }

    return (
      <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleParticiparEvento}>
        Participar do Evento
      </Button>
    )
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Banner Section */}
      <Card className="mb-6 overflow-hidden">
        <div className="p-4 flex justify-between">
          <Button variant="outline" size="sm" className="gap-2" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon" className="rounded-full">
              <Instagram className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Facebook className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full">
              <Mail className="h-5 w-5" />
            </Button>
          </div>
        </div>

        <div className="relative h-[300px] md:h-[400px]">
          <div className="absolute inset-0 transition-opacity duration-500">
            <Image
              src={images[currentSlide] || "/placeholder.svg?height=400&width=800"}
              alt={evento.nome}
              fill
              className="object-cover"
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center"
                onClick={handlePrevSlide}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <button
                className="absolute right-4 top-1/2 transform -translate-y-1/2 h-8 w-8 bg-white/80 rounded-full flex items-center justify-center"
                onClick={handleNextSlide}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {images.length > 1 && (
          <div className="flex justify-center gap-2 p-4">
            {images.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Event Info */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="outline" className="px-3 py-1">
            EVENTO
          </Badge>
          <span className="text-sm text-gray-500">{periodo}</span>
        </div>

        <div className="flex justify-between items-start mb-4">
          <h1 className="text-2xl font-bold">{evento.nome}</h1>

          {/* Status de participação */}
          {participacaoStatus === "aprovado" && (
            <Badge className="bg-green-500 text-white">
              <Check className="h-3 w-3 mr-1" />
              Participando
            </Badge>
          )}

          {participacaoStatus === "pendente" && (
            <Badge variant="outline" className="border-yellow-500 text-yellow-500">
              <Clock className="h-3 w-3 mr-1" />
              Solicitação pendente
            </Badge>
          )}

          {participacaoStatus === "rejeitado" && (
            <Badge variant="outline" className="border-red-500 text-red-500">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Solicitação rejeitada
            </Badge>
          )}
        </div>

        <div className="space-y-4">
          {descricaoParagrafos.map((paragraph, index) => (
            <p key={index} className="text-gray-700">
              {paragraph}
            </p>
          ))}
        </div>
      </div>

      {/* Documentos do Evento */}
      {evento.documentos && evento.documentos.length > 0 && (
        <Card className="p-6 mb-6">
          <button className="flex items-center justify-between w-full" onClick={() => setDocsExpanded(!docsExpanded)}>
            <h2 className="text-xl font-semibold">Documentos do Evento</h2>
            {docsExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>

          {docsExpanded && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {evento.documentos.map((doc, index) => (
                <Card key={index} className="overflow-hidden">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{doc.nome}</p>
                        <p className="text-xs text-gray-500">{doc.tipo || "Documento"}</p>
                      </div>
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center h-8 w-8 rounded-full hover:bg-gray-100"
                        title="Baixar documento"
                      >
                        <Download className="h-4 w-4" />
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* What Can Be Sold */}
      <Card className="p-6 mb-6">
        <button className="flex items-center justify-between w-full" onClick={() => setInfoExpanded(!infoExpanded)}>
          <h2 className="text-xl font-semibold">O Que Pode Ser Comercializado?</h2>
          {infoExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {infoExpanded && (
          <div className="mt-4 space-y-6">
            {comercializacao.map((section, index) => (
              <div key={index}>
                <p className="font-medium mb-2">
                  {index + 1}. {section.title}
                </p>
                <ul className="list-disc pl-8 space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* What Is Needed To Participate */}
      <Card className="p-6 mb-6">
        <button className="flex items-center justify-between w-full" onClick={() => setStatsExpanded(!statsExpanded)}>
          <h2 className="text-xl font-semibold">O Quê É Preciso Para Participar?</h2>
          {statsExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {statsExpanded && (
          <div className="mt-4 space-y-6">
            {participacao.map((section, index) => (
              <div key={index}>
                <p className="font-medium mb-2">
                  {index + 1}. {section.title}
                </p>
                <ul className="list-disc pl-8 space-y-1">
                  {section.items.map((item, itemIndex) => (
                    <li key={itemIndex} className="text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Participate Button */}
      <div className="flex justify-end mb-8">{renderBotaoParticipacao()}</div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>

      {/* Modal de Participação */}
      {showParticipacaoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Participar do Evento</h2>
              <p className="mb-4">
                Você está solicitando participação no evento <strong>{evento.nome}</strong>.
              </p>
              <p className="mb-6">
                Sua solicitação será analisada pelos administradores do evento. Você receberá uma notificação quando sua
                solicitação for aprovada ou rejeitada.
              </p>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowParticipacaoModal(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleSolicitarParticipacao}
                  disabled={loadingParticipacao}
                >
                  {loadingParticipacao ? "Enviando..." : "Confirmar Solicitação"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
