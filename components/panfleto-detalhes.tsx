"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter, useParams } from "next/navigation"
import { useSession } from "next-auth/react"
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Loader2,
  Facebook,
  Twitter,
  Linkedin,
  Copy,
  PhoneIcon as WhatsApp,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"
import { PanfletosAvaliacoes } from "@/components/panfletos-avaliacoes"

// Define TypeScript interfaces para nossos componentes
interface PanfletoDetalhesProps {
  id?: string
}

interface InfoItemProps {
  label: string
  value: string | number
}

interface StatCardProps {
  value: number
  label: string
  icon: React.ReactNode
}

// Interface que corresponde à estrutura real do banco de dados
interface Panfleto {
  _id: string
  titulo: string
  descricao: string
  conteudo: string
  imagem: string
  categoria: string
  tags: string[]
  preco: number
  precoPromocional: number
  tipo: string
  status: string
  dataInicio: string
  dataFim: string
  lojaId: string
  usuarioId: string
  dataCriacao: string
  dataAtualizacao: string
  visualizacoes: number
  curtidas: number
  compartilhamentos: number
  comentarios: number
  ativo: boolean
  destaque: boolean
  botaoAcao: string
  botaoLink: string
  codigo: string
  loja?: {
    nome?: string
    whatsapp?: string
  }
}

export function PanfletoDetalhes({ id: propId }: PanfletoDetalhesProps) {
  const params = useParams()
  const id = propId || (params?.id as string)
  const router = useRouter()
  const { data: session, status } = useSession()
  const isAuthenticated = status === "authenticated"

  const [infoExpanded, setInfoExpanded] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)
  const [panfleto, setPanfleto] = useState<Panfleto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [curtido, setCurtido] = useState(false)
  const [compartilhamentoAberto, setCompartilhamentoAberto] = useState(false)
  const [visualizacaoRegistrada, setVisualizacaoRegistrada] = useState(false)

  // Verificar se o usuário já curtiu este panfleto
  useEffect(() => {
    if (panfleto?._id) {
      const panfletosCurtidos = localStorage.getItem("panfletos_curtidos") || ""
      setCurtido(panfletosCurtidos.includes(panfleto._id))
    }
  }, [panfleto])

  // Função para redirecionar para login com retorno
  const redirecionarParaLogin = () => {
    // Salvar a URL atual para retornar após o login
    const returnUrl = `/panfletos/${id}`
    router.push(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  // Função para verificar autenticação
  const verificarAutenticacao = () => {
    if (!isAuthenticated) {
      toast.error("Você precisa estar logado para realizar esta ação")
      redirecionarParaLogin()
      return false
    }
    return true
  }

  // Função para registrar visualização
  const registrarVisualizacao = async (panfletoId: string) => {
    // Verificar se já registrou visualização para este panfleto na sessão atual
    const panfletosVisualizados = localStorage.getItem("panfletos_visualizados") || ""

    if (panfletosVisualizados.includes(panfletoId) || visualizacaoRegistrada) {
      console.log("Visualização já registrada para este panfleto")
      return
    }

    try {
      const response = await fetch(`/api/panfletos/${panfletoId}/visualizar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        console.log("Visualização registrada com sucesso")

        // Atualizar o contador local
        setPanfleto((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            visualizacoes: prev.visualizacoes + 1,
          }
        })

        // Marcar como visualizado no localStorage para evitar contagens duplicadas
        localStorage.setItem("panfletos_visualizados", `${panfletosVisualizados},${panfletoId}`)
        setVisualizacaoRegistrada(true)
      }
    } catch (error) {
      console.error("Erro ao registrar visualização:", error)
    }
  }

  // Função para curtir o panfleto
  const curtirPanfleto = async () => {
    if (!panfleto || curtido) return

    // Verificar se o usuário está autenticado
    if (!verificarAutenticacao()) return

    try {
      const response = await fetch(`/api/panfletos/${panfleto._id}/curtir`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        // Marcar como curtido no localStorage para evitar curtidas duplicadas
        const panfletosCurtidos = localStorage.getItem("panfletos_curtidos") || ""
        localStorage.setItem("panfletos_curtidos", `${panfletosCurtidos},${panfleto._id}`)

        setCurtido(true)
        setPanfleto((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            curtidas: prev.curtidas + 1,
          }
        })
        toast.success("Você curtiu este panfleto!")
      }
    } catch (error) {
      console.error("Erro ao curtir panfleto:", error)
      toast.error("Não foi possível curtir este panfleto")
    }
  }

  // Função para registrar compartilhamento
  const registrarCompartilhamento = async (rede: string) => {
    if (!panfleto) return

    // Verificar se o usuário está autenticado
    if (!verificarAutenticacao()) return

    // Verificar se já compartilhou este panfleto nesta rede
    const chaveCompartilhamento = `panfleto_${panfleto._id}_compartilhado_${rede}`
    if (localStorage.getItem(chaveCompartilhamento) === "true") {
      console.log(`Já compartilhou este panfleto no ${rede}`)
      return
    }

    try {
      const response = await fetch(`/api/panfletos/${panfleto._id}/compartilhar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ rede }),
      })

      if (response.ok) {
        // Marcar como compartilhado no localStorage para esta rede
        localStorage.setItem(chaveCompartilhamento, "true")

        setPanfleto((prev) => {
          if (!prev) return prev
          return {
            ...prev,
            compartilhamentos: prev.compartilhamentos + 1,
          }
        })
      }
    } catch (error) {
      console.error("Erro ao registrar compartilhamento:", error)
    }
  }

  // Função para compartilhar nas redes sociais
  const compartilhar = (rede: string) => {
    if (!panfleto) return

    // Verificar se o usuário está autenticado
    if (!verificarAutenticacao()) return

    const url = window.location.href
    const titulo = panfleto.titulo
    let shareUrl = ""

    switch (rede) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(titulo)}&url=${encodeURIComponent(url)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(`${titulo} ${url}`)}`
        break
      case "copy":
        navigator.clipboard.writeText(url)
        toast.success("Link copiado para a área de transferência!")
        registrarCompartilhamento("copy")
        return
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank")
      registrarCompartilhamento(rede)
      setCompartilhamentoAberto(false)
    }
  }

  // Atualizar avaliações
  const handleAvaliacaoEnviada = () => {
    // Recarregar os dados do panfleto para atualizar o contador de comentários
    fetchPanfleto()
  }

  const fetchPanfleto = async () => {
    try {
      setLoading(true)
      // Buscar o panfleto pelo ID
      const response = await fetch(`/api/panfletos/${id}`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar panfleto: ${response.status}`)
      }

      const data = await response.json()
      console.log("Dados do panfleto:", data)

      // Buscar informações da loja
      let lojaData = null
      if (data.lojaId) {
        try {
          const lojaResponse = await fetch(`/api/lojas/${data.lojaId}`)
          if (lojaResponse.ok) {
            lojaData = await lojaResponse.json()
          }
        } catch (err) {
          console.error("Erro ao buscar dados da loja:", err)
        }
      }

      // Adicionar informações da loja ao panfleto
      setPanfleto({
        ...data,
        loja: lojaData
          ? {
              nome: lojaData.nome,
              whatsapp: lojaData.contato?.whatsapp || lojaData.contato?.telefone,
            }
          : undefined,
      })
    } catch (err) {
      console.error("Erro ao buscar dados do panfleto:", err)
      setError("Não foi possível carregar os dados do panfleto. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (id) {
      fetchPanfleto()
    }
  }, [id])

  // Registrar visualização apenas uma vez quando o componente for montado e o panfleto estiver carregado
  useEffect(() => {
    if (panfleto && !visualizacaoRegistrada) {
      registrarVisualizacao(panfleto._id)
    }
  }, [panfleto, visualizacaoRegistrada])

  const handleBack = () => {
    if (panfleto && panfleto.lojaId) {
      // Redirecionar para a página da vitrine usando o ID da loja
      router.push(`/vitrines/${panfleto.lojaId}`)
    } else {
      // Fallback para o comportamento anterior se não tiver lojaId
      router.back()
    }
  }

  const handleWhatsAppClick = () => {
    if (!panfleto || !panfleto.loja?.whatsapp) {
      alert("Número de WhatsApp não disponível")
      return
    }

    // Formatar o número do WhatsApp (remover caracteres não numéricos)
    const whatsappNumber = panfleto.loja.whatsapp.replace(/\D/g, "")

    // Se o número não começar com código do país, adicionar o código do Brasil
    const formattedNumber = whatsappNumber.startsWith("55") ? whatsappNumber : `55${whatsappNumber}`

    // Criar a mensagem pré-formatada
    const message = encodeURIComponent(
      `Olá, me interessei pelo panfleto "${panfleto.titulo}" e gostaria de saber mais sobre.`,
    )

    // Criar o link do WhatsApp
    const whatsappUrl = `https://wa.me/${formattedNumber}?text=${message}`

    // Abrir o link em uma nova aba
    window.open(whatsappUrl, "_blank")
  }

  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("pt-BR")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Carregando detalhes do panfleto...</p>
        </div>
      </div>
    )
  }

  if (error || !panfleto) {
    return (
      <div className="p-4 max-w-6xl mx-auto">
        <Button variant="ghost" size="icon" onClick={handleBack} className="mb-4">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error || "Panfleto não encontrado"}</AlertDescription>
        </Alert>
        <Button onClick={handleBack}>Voltar</Button>
      </div>
    )
  }

  // Período do panfleto formatado
  const period = `${formatDate(panfleto.dataInicio)} - ${formatDate(panfleto.dataFim)}`

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header - Removido o botão de editar */}
      <div className="flex items-center mb-6 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack} className="h-9 w-9 sm:h-10 sm:w-10">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl sm:text-2xl font-bold">Detalhes do Panfleto</h1>
        </div>
      </div>

      {/* Main Content */}
      <Card className="p-4 sm:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden mb-4">
              <Image
                src={panfleto.imagem || "/placeholder.svg?height=500&width=500&query=product"}
                alt={panfleto.titulo || "Imagem do produto"}
                fill
                className="object-cover"
              />
            </div>

            {/* Botões de interação */}
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={`flex items-center gap-1 ${curtido ? "text-red-500 border-red-500" : ""}`}
                  onClick={curtirPanfleto}
                  disabled={curtido}
                >
                  <Heart className={`h-4 w-4 ${curtido ? "fill-red-500" : ""}`} />
                  <span>{panfleto.curtidas}</span>
                </Button>

                <Popover open={compartilhamentoAberto} onOpenChange={setCompartilhamentoAberto}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm" className="flex items-center gap-1">
                      <Share2 className="h-4 w-4" />
                      <span>{panfleto.compartilhamentos}</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-blue-100 text-blue-600"
                        onClick={() => compartilhar("facebook")}
                      >
                        <Facebook className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-sky-100 text-sky-500"
                        onClick={() => compartilhar("twitter")}
                      >
                        <Twitter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-blue-100 text-blue-700"
                        onClick={() => compartilhar("linkedin")}
                      >
                        <Linkedin className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-green-100 text-green-600"
                        onClick={() => compartilhar("whatsapp")}
                      >
                        <WhatsApp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full bg-gray-100 text-gray-600"
                        onClick={() => compartilhar("copy")}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <div className="flex items-center gap-1 text-sm text-gray-500">
                  <Eye className="h-4 w-4" />
                  <span>{panfleto.visualizacoes}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge className="bg-blue-500">{panfleto.categoria.toUpperCase()}</Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{period}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {panfleto.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {tag.toUpperCase()}
                </Badge>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4">{panfleto.titulo}</h2>

            <div className="mb-4">
              {panfleto.preco > panfleto.precoPromocional && (
                <p className="text-sm text-gray-500 line-through">R$ {panfleto.preco.toFixed(2).replace(".", ",")}</p>
              )}
              <p className="text-3xl font-bold text-orange-500">
                R$ {panfleto.precoPromocional.toFixed(2).replace(".", ",")}
              </p>
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700 gap-2" onClick={handleWhatsAppClick}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="white"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5"
              >
                <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                <path d="M9.5 13.5c.5 1 1.5 1 2 1s1.5 0 2-1" />
              </svg>
              {panfleto.botaoAcao || "Comprar pelo WhatsApp"}
            </Button>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Descrição do Produto</h3>
          <p className="text-gray-700">{panfleto.descricao}</p>

          {panfleto.conteudo && (
            <div className="mt-4">
              <h4 className="text-md font-semibold mb-2">Detalhes</h4>
              <p className="text-gray-700">{panfleto.conteudo}</p>
            </div>
          )}
        </div>
      </Card>

      {/* General Information */}
      <Card className="p-4 md:p-6 mb-6">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setInfoExpanded(!infoExpanded)}
          aria-expanded={infoExpanded}
        >
          <h3 className="text-lg font-semibold">Informações Gerais</h3>
          {infoExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {infoExpanded && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Data de Criação:" value={formatDate(panfleto.dataCriacao)} />
            <InfoItem label="Data de Encerramento:" value={formatDate(panfleto.dataFim)} />
            <InfoItem label="Status:" value={panfleto.status === "active" ? "Ativo" : "Inativo"} />
            <InfoItem label="Tipo:" value={panfleto.tipo === "ativo" ? "Panfleto Ativo" : "Panfleto Inativo"} />
            {panfleto.destaque && <InfoItem label="Destaque:" value="Sim" />}
            <InfoItem label="Código:" value={panfleto.codigo || "N/A"} />
          </div>
        )}
      </Card>

      {/* Statistics */}
      <Card className="p-4 md:p-6 mb-6">
        <button
          className="flex items-center justify-between w-full"
          onClick={() => setStatsExpanded(!statsExpanded)}
          aria-expanded={statsExpanded}
        >
          <h3 className="text-lg font-semibold">Estatísticas</h3>
          {statsExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {statsExpanded && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={panfleto.visualizacoes} label="Visitas" icon={<Eye className="h-5 w-5 text-blue-500" />} />
            <StatCard value={panfleto.curtidas} label="Likes" icon={<Heart className="h-5 w-5 text-blue-500" />} />
            <StatCard
              value={panfleto.compartilhamentos}
              label="Compartilhamentos"
              icon={<Share2 className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              value={panfleto.comentarios}
              label="Comentários"
              icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
            />
          </div>
        )}
      </Card>

      {/* Avaliações e Comentários */}
      {panfleto && panfleto.lojaId && (
        <PanfletosAvaliacoes
          panfleto={panfleto}
          onAvaliacaoEnviada={handleAvaliacaoEnviada}
          verificarAutenticacao={verificarAutenticacao}
          isAuthenticated={isAuthenticated}
        />
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </div>
  )
}

// Components
function InfoItem({ label, value }: InfoItemProps) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StatCard({ value, label, icon }: StatCardProps) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
    </Card>
  )
}
