"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Star, Share2, ShoppingCart, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Loja, Produto } from "@/types/loja"
import type { VitrineConfig, Avaliacao } from "@/types/vitrine"
import { VitrineHeader } from "./vitrine-header"
import { VitrineBanner } from "./vitrine-banner"
import { VitrineProdutos } from "./vitrine-produtos"
import { VitrineSobre } from "./vitrine-sobre"
import { VitrineContato } from "./vitrine-contato"
import { VitrineAvaliacoes } from "./vitrine-avaliacoes"
import { VitrineNewsletter } from "./vitrine-newsletter"
import { VitrineFooter } from "./vitrine-footer"
import { BackToTopButton } from "./back-to-up-button"
import { VitrineMetricas } from "./vitrine-metricas"

// Tipos
interface VitrinePublicaProps {
  id?: string
  slug?: string
  layout?: "padrao" | "moderno" | "minimalista" | "magazine"
}

// Interface para o componente ProdutoCard
interface ProdutoCardProps {
  produto: Produto
  config: VitrineConfig
  onShare: (produto: Produto) => void
  onFavorite?: (produto: Produto) => void
  isFavorite?: boolean
  layout?: string
  animationProps?: any
}

// Componente principal
export default function VitrinePublica({ id, slug, layout = "padrao" }: VitrinePublicaProps) {
  const [loja, setLoja] = useState<Loja | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [config, setConfig] = useState<VitrineConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [favoritos, setFavoritos] = useState<string[]>([])
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderFixed, setIsHeaderFixed] = useState(false)
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false)
  const [feedbackRating, setFeedbackRating] = useState(0)
  const [feedbackComment, setFeedbackComment] = useState("")
  const [feedbackName, setFeedbackName] = useState("")
  const [feedbackEmail, setFeedbackEmail] = useState("")
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false)
  const [pageViews, setPageViews] = useState(0)

  // Dados de exemplo para avaliações
  const [feedbacks, setFeedbacks] = useState([
    {
      id: 1,
      nome: "Maria Silva",
      avatar: "/placeholder.svg?height=40&width=40",
      nota: 5,
      comentario: "Ótimos produtos e atendimento excelente! Recomendo muito esta loja.",
      data: "15/04/2023",
    },
    {
      id: 2,
      nome: "João Santos",
      avatar: "/placeholder.svg?height=40&width=40",
      nota: 4,
      comentario: "Produtos de qualidade e entrega rápida. Voltarei a comprar com certeza.",
      data: "03/03/2023",
    },
    {
      id: 3,
      nome: "Ana Oliveira",
      avatar: "/placeholder.svg?height=40&width=40",
      nota: 5,
      comentario: "Superou minhas expectativas! Atendimento personalizado e produtos incríveis.",
      data: "22/02/2023",
    },
  ])

  // Função para registrar visualização
  const registrarVisualizacao = async (identifier: string) => {
    try {
      await fetch(`/api/vitrines/${identifier}/metricas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tipo: "visualizacao" }),
      })
    } catch (error) {
      console.error("Erro ao registrar visualização:", error)
    }
  }

  // Função para carregar avaliações
  const carregarAvaliacoes = async (identifier: string) => {
    try {
      const response = await fetch(`/api/vitrines/${identifier}/avaliacoes`)
      if (response.ok) {
        const data = await response.json()
        return data.avaliacoes || []
      }
      return []
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
      return []
    }
  }

  // Efeito para buscar dados da loja e vitrine
  useEffect(() => {
    async function fetchData() {
      try {
        const identifier = id || slug
        if (!identifier) {
          setError("Identificador da vitrine não fornecido")
          setLoading(false)
          return
        }

        setLoading(true)
        const response = await fetch(`/api/vitrines/${identifier}`)

        if (!response.ok) {
          throw new Error("Erro ao carregar dados da vitrine")
        }

        const data = await response.json()
        console.log("Dados recebidos da API:", data)
        setLoja(data.loja)
        setProdutos(data.produtos || [])
        setFilteredProdutos(data.produtos || [])

        // Configurar a vitrine com valores padrão se necessário
        const vitrineConfig = data.loja.vitrine || {
          titulo: data.loja.nome,
          descricao: data.loja.descricao,
          corPrimaria: "#3b82f6",
          corSecundaria: "#6366f1",
          corTexto: "#ffffff",
          corFundo: "#f8fafc",
          layout: layout || "padrao",
          tema: "claro",
          mostrarProdutos: true,
          mostrarContato: true,
          mostrarEndereco: true,
          mostrarHorarios: true,
          mostrarRedesSociais: true,
          mostrarBanner: true,
          mostrarLogo: true,
          mostrarBusca: true,
          mostrarCategorias: true,
          mostrarPrecos: true,
          mostrarPromocoes: true,
          mostrarEstoque: false,
          mostrarAvaliacao: true,
          mostrarCompartilhar: true,
          mostrarWhatsapp: true,
        }

        setConfig(vitrineConfig)

        // Registrar visualização da página
        if (identifier) {
          registrarVisualizacao(identifier)
        }

        // Carregar avaliações
        const avaliacoesData = await carregarAvaliacoes(identifier)
        setAvaliacoes(avaliacoesData)
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        setError("Não foi possível carregar a vitrine. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, slug, layout])

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Mostrar/esconder botão de voltar ao topo
      setShowScrollTop(currentScrollY > 200)

      if (headerRef.current) {
        const headerPos = headerRef.current.getBoundingClientRect().top
        setIsHeaderFixed(headerPos <= 0)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Efeito para filtrar produtos
  useEffect(() => {
    if (!produtos) return

    let filtered = [...produtos]

    // Filtrar por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (produto) =>
          produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (produto.descricaoCurta?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false),
      )
    }

    // Filtrar por categoria
    if (categoriaAtiva) {
      filtered = filtered.filter((produto) => produto.categorias?.includes(categoriaAtiva))
    }

    console.log(`Filtrando produtos: ${filtered.length} encontrados`)
    setFilteredProdutos(filtered)
  }, [searchTerm, categoriaAtiva, produtos])

  // Função para compartilhar produto
  const compartilharProduto = (produto: Produto) => {
    if (navigator.share) {
      navigator
        .share({
          title: produto.nome,
          text: produto.descricaoCurta || `Confira ${produto.nome}`,
          url: window.location.href,
        })
        .catch((err) => console.error("Erro ao compartilhar:", err))
    } else {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

  // Função para favoritar produto
  const handleToggleFavorito = useCallback((produto: Produto) => {
    setFavoritos((prev) => {
      if (prev.includes(produto._id)) {
        return prev.filter((id) => id !== produto._id)
      } else {
        return [...prev, produto._id]
      }
    })
  }, [])

  // Função para voltar ao topo
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // Função para enviar feedback
  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (feedbackRating === 0) {
      alert("Por favor, selecione uma nota para a loja.")
      return
    }

    // Adicionar novo feedback
    const newFeedback = {
      id: feedbacks.length + 1,
      nome: feedbackName || "Anônimo",
      avatar: "/placeholder.svg?height=40&width=40",
      nota: feedbackRating,
      comentario: feedbackComment,
      data: new Date().toLocaleDateString("pt-BR"),
    }

    setFeedbacks([newFeedback, ...feedbacks])
    setFeedbackSubmitted(true)

    // Resetar formulário após 3 segundos
    setTimeout(() => {
      setFeedbackDialogOpen(false)
      setFeedbackSubmitted(false)
      setFeedbackRating(0)
      setFeedbackComment("")
      setFeedbackName("")
      setFeedbackEmail("")
    }, 3000)
  }

  // Extrair categorias únicas
  const categorias = produtos ? Array.from(new Set(produtos.flatMap((p) => p.categorias || []).filter(Boolean))) : []

  // Renderizar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-blue-500 border-b-blue-700 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">Carregando vitrine...</p>
        </div>
      </div>
    )
  }

  // Renderizar erro
  if (error || !loja || !config) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar vitrine</h1>
          <p className="mb-4">{error || "Vitrine não encontrada ou indisponível."}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("min-h-screen flex flex-col", isDarkMode ? "dark" : "")}>
      {/* Header */}
      <VitrineHeader
        loja={loja}
        config={config}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        favoritos={favoritos}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

      {/* Banner */}
      {config.mostrarBanner && <VitrineBanner loja={loja} config={config} />}

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-background">
        {/* Seção de Produtos */}
        {config.mostrarProdutos && (
          <VitrineProdutos
            loja={loja}
            config={config}
            produtos={filteredProdutos}
            categorias={categorias}
            categoriaAtiva={categoriaAtiva}
            setCategoriaAtiva={setCategoriaAtiva}
            favoritos={favoritos}
            toggleFavorito={handleToggleFavorito}
          />
        )}

        {/* Seção Sobre */}
        {config.secaoSobre?.ativo && <VitrineSobre loja={loja} config={config} />}

        {/* Seção de Contato */}
        {config.mostrarContato && <VitrineContato loja={loja} config={config} />}

        {/* Seção de Avaliações */}
        {config.mostrarAvaliacao && (
          <VitrineAvaliacoes
            loja={loja}
            config={config}
            avaliacoes={avaliacoes}
            onAvaliacaoEnviada={() => {
              const identifier = id || slug
              if (identifier) {
                carregarAvaliacoes(identifier).then(setAvaliacoes)
              }
            }}
          />
        )}

        {/* Seção de Newsletter */}
        <VitrineNewsletter loja={loja} config={config} />

        {/* Seção de Métricas (visível apenas para o proprietário) */}
        <VitrineMetricas loja={loja} />
      </main>

      {/* Footer */}
      <VitrineFooter loja={loja} config={config} />

      {/* Botão de voltar ao topo */}
      <AnimatePresence>{showScrollTop && <BackToTopButton config={config} />}</AnimatePresence>
    </div>
  )
}

// Componente de Card de Produto
function ProdutoCard({
  produto,
  config,
  onShare,
  onFavorite,
  isFavorite = false,
  layout = "padrao",
  animationProps = {},
}: ProdutoCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const router = useRouter()

  const handleClick = () => {
    if (produto._id) {
      // Navegar para a página do produto
      const vitrineId = window.location.pathname.split("/").pop()
      router.push(`/vitrines/${vitrineId}/productId=${produto._id}`)
    }
  }

  return (
    <motion.div {...animationProps}>
      <Card
        className={cn(
          "h-full flex flex-col overflow-hidden border transition-all duration-300",
          isHovered ? "shadow-lg transform translate-y-[-5px]" : "",
          config.tema === "escuro" ? "bg-gray-800 border-gray-700" : "bg-white",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
      >
        <div className="relative aspect-square overflow-hidden">
          {produto.imagens && produto.imagens.length > 0 ? (
            <Image
              src={produto.imagens[0] || "/placeholder.svg"}
              alt={produto.nome}
              fill
              sizes="100vw"
              className={cn("object-cover transition-transform duration-500", isHovered ? "scale-110" : "scale-100")}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
          )}

          {config?.mostrarPromocoes && produto.precoPromocional && produto.precoPromocional < produto.preco && (
            <div
              className="absolute top-2 left-2 px-2 py-1 rounded-md text-sm font-bold"
              style={{ backgroundColor: config?.corDestaque || "#f59e0b", color: "#ffffff" }}
            >
              {Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}% OFF
            </div>
          )}

          {onFavorite && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onFavorite(produto)
              }}
              className="absolute top-2 right-2 bg-white/80 hover:bg-white rounded-full p-1.5 shadow-md transition-all"
            >
              <Heart className={cn("h-4 w-4", isFavorite ? "fill-red-500 text-red-500" : "text-gray-600")} />
            </button>
          )}

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
              >
                <Button className="bg-white text-gray-800 hover:bg-gray-100 shadow-lg" size="sm">
                  Ver detalhes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="font-bold text-lg line-clamp-2">{produto.nome}</h3>

          {produto.descricaoCurta && (
            <p
              className={cn("text-sm mt-1 line-clamp-2", config.tema === "escuro" ? "text-gray-300" : "text-gray-500")}
            >
              {produto.descricaoCurta}
            </p>
          )}

          {config?.mostrarPrecos && (
            <div className="mt-2">
              {produto.precoPromocional && produto.precoPromocional < produto.preco ? (
                <div className="flex items-center gap-2">
                  <span className="text-gray-500 line-through text-sm">
                    {produto.preco.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                  <span
                    className="font-bold text-lg"
                    style={{ color: config?.corDestaque || config?.corPrimaria || "#f59e0b" }}
                  >
                    {produto.precoPromocional.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </span>
                </div>
              ) : (
                <span className="font-bold text-lg">
                  {produto.preco.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </span>
              )}
            </div>
          )}

          {config?.mostrarEstoque && produto.estoque !== undefined && (
            <div className="mt-2 text-sm">
              {produto.estoque > 0 ? (
                <span className="text-green-600">Em estoque: {produto.estoque} unidades</span>
              ) : (
                <span className="text-red-600">Fora de estoque</span>
              )}
            </div>
          )}

          {config?.mostrarAvaliacao && (
            <div className="flex items-center mt-2">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4"
                    fill={star <= 4 ? "#FFD700" : "none"}
                    stroke={star <= 4 ? "#FFD700" : "#CBD5E1"}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500 ml-1">(4.0)</span>
            </div>
          )}

          <div className="mt-auto pt-4 flex gap-2">
            <Button
              className="flex-1"
              style={{
                backgroundColor: config?.corPrimaria || "#3b82f6",
                color: config?.corTexto || "#ffffff",
              }}
              onClick={handleClick}
            >
              Ver detalhes
            </Button>

            {config?.mostrarCompartilhar && (
              <Button
                variant="outline"
                size="icon"
                onClick={(e) => {
                  e.stopPropagation()
                  onShare(produto)
                }}
              >
                <Share2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Função para formatar horário
function formatarHorario(horario: any): string {
  if (!horario) return "Fechado"

  if (typeof horario === "string") return horario

  if (typeof horario === "object") {
    if (!horario.open) return "Fechado"
    return `${horario.abertura || "00:00"} - ${horario.fechamento || "00:00"}`
  }

  return "Horário não disponível"
}

// Função para verificar se é o dia atual
function isDiaAtual(diaSemana: string): boolean {
  const diasDaSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
  const dataAtual = new Date()
  const diaDaSemanaAtual = dataAtual.getDay() // 0 (Domingo) - 6 (Sábado)
  return diasDaSemana[diaDaSemanaAtual] === diaSemana
}

// Função para verificar se o horário está aberto
function isHorarioAberto(horario: any): boolean {
  if (!horario) return false
  if (typeof horario === "string") return horario !== "Fechado"
  if (typeof horario === "object") return !!horario.open
  return false
}
