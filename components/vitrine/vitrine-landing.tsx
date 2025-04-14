"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Share2,
  ShoppingCart,
  Heart,
  ChevronRight,
  Instagram,
  Facebook,
  Twitter,
  Sun,
  Moon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Loja, Produto } from "@/types/loja"

// Tipos
interface VitrineLandingProps {
  id?: string
  slug?: string
}

interface VitrineConfig {
  titulo?: string
  descricao?: string
  corPrimaria?: string
  corSecundaria?: string
  corTexto?: string
  corFundo?: string
  corDestaque?: string
  layout?: string
  tema?: string
  mostrarProdutos?: boolean
  mostrarContato?: boolean
  mostrarEndereco?: boolean
  mostrarHorarios?: boolean
  mostrarRedesSociais?: boolean
  mostrarBanner?: boolean
  mostrarLogo?: boolean
  mostrarBusca?: boolean
  mostrarCategorias?: boolean
  mostrarPrecos?: boolean
  mostrarPromocoes?: boolean
  mostrarEstoque?: boolean
  mostrarAvaliacao?: boolean
  mostrarCompartilhar?: boolean
  mostrarWhatsapp?: boolean
  animacoes?: boolean
  efeitos?: string
  fontePersonalizada?: string
  bannerPrincipal?: string
  logoPersonalizado?: string
  secaoSobre?: {
    ativo?: boolean
    titulo?: string
    conteudo?: string
    imagem?: string
  }
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

// Interface para avaliações
interface Avaliacao {
  id: string
  nome: string
  email?: string
  avatar?: string
  nota: number
  comentario: string
  data: Date | string
}

// Interface para métricas
interface Metricas {
  visualizacoes: number
  visitantes: number
  interacoes: number
  conversoes: number
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

// Componente de Avaliação
function AvaliacaoCard({ avaliacao }: { avaliacao: Avaliacao }) {
  return (
    <Card className="mb-4">
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarImage src={avaliacao.avatar || "/placeholder.svg"} alt={avaliacao.nome} />
            <AvatarFallback>{avaliacao.nome.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{avaliacao.nome}</h4>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className="h-4 w-4"
                    fill={star <= avaliacao.nota ? "#FFD700" : "none"}
                    stroke={star <= avaliacao.nota ? "#FFD700" : "#CBD5E1"}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {typeof avaliacao.data === "string"
                ? new Date(avaliacao.data).toLocaleDateString()
                : avaliacao.data.toLocaleDateString()}
            </p>
            <p className="mt-2">{avaliacao.comentario}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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

// Componente principal
export default function VitrineLanding({ id, slug }: VitrineLandingProps) {
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
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterEnviado, setNewsletterEnviado] = useState(false)
  const [avaliacaoNome, setAvaliacaoNome] = useState("")
  const [avaliacaoEmail, setAvaliacaoEmail] = useState("")
  const [avaliacaoNota, setAvaliacaoNota] = useState(5)
  const [avaliacaoComentario, setAvaliacaoComentario] = useState("")
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [metricas, setMetricas] = useState<Metricas>({
    visualizacoes: 0,
    visitantes: 0,
    interacoes: 0,
    conversoes: 0,
  })
  const router = useRouter()
  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderFixed, setIsHeaderFixed] = useState(false)

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
          layout: "padrao",
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

        // Registrar visualização
        registrarVisualizacao(identifier)

        // Carregar avaliações
        carregarAvaliacoes(identifier)
      } catch (err) {
        console.error("Erro ao buscar dados:", err)
        setError("Não foi possível carregar a vitrine. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id, slug])

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)

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
          produto.descricaoCurta?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Filtrar por categoria
    if (categoriaAtiva) {
      filtered = filtered.filter((produto) => produto.categorias?.includes(categoriaAtiva))
    }

    setFilteredProdutos(filtered)
  }, [searchTerm, categoriaAtiva, produtos])

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
        setAvaliacoes(data.avaliacoes || [])
      }
    } catch (error) {
      console.error("Erro ao carregar avaliações:", error)
    }
  }

  // Função para enviar avaliação
  const enviarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!id && !slug) return

    const identifier = id || slug

    try {
      const response = await fetch(`/api/vitrines/${identifier}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: avaliacaoNome,
          email: avaliacaoEmail,
          nota: avaliacaoNota,
          comentario: avaliacaoComentario,
        }),
      })

      if (response.ok) {
        // Limpar formulário
        setAvaliacaoNome("")
        setAvaliacaoEmail("")
        setAvaliacaoNota(5)
        setAvaliacaoComentario("")

        // Recarregar avaliações
        carregarAvaliacoes(identifier)

        alert("Avaliação enviada com sucesso!")
      } else {
        alert("Erro ao enviar avaliação. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      alert("Erro ao enviar avaliação. Tente novamente.")
    }
  }

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
  const toggleFavorito = useCallback((produto: Produto) => {
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

  // Função para enviar newsletter
  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Email cadastrado:", newsletterEmail)
    setNewsletterEnviado(true)
    setNewsletterEmail("")

    // Reset após 3 segundos
    setTimeout(() => {
      setNewsletterEnviado(false)
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
      {/* Header Minimalista */}
      <header
        ref={headerRef}
        className={cn(
          "py-2 border-b transition-all duration-300 z-50 bg-background",
          isHeaderFixed ? "sticky top-0 shadow-sm" : "",
        )}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            {/* Logo e Nome */}
            <div className="flex items-center gap-3">
              {(loja.logo || config.logoPersonalizado) && (
                <div className="w-8 h-8 rounded-full overflow-hidden bg-white">
                  <Image
                    src={config.logoPersonalizado || loja.logo || "/placeholder.svg"}
                    alt={loja.nome}
                    width={32}
                    height={32}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <h1 className="text-lg font-bold">{loja.nome}</h1>
            </div>

            {/* Ícones de Redes Sociais e Ações */}
            <div className="flex items-center gap-2">
              {/* Redes Sociais */}
              <div className="hidden md:flex items-center gap-2 mr-4">
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Facebook className="h-4 w-4" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Instagram className="h-4 w-4" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Twitter className="h-4 w-4" />
                </a>
              </div>

              {/* Busca */}
              <div className="relative hidden md:block">
                <Input
                  type="search"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40 h-8 pl-8 text-sm"
                />
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
              </div>

              {/* Tema */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsDarkMode(!isDarkMode)}
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* Favoritos */}
              <Button variant="ghost" size="icon" className="h-8 w-8 relative" title="Favoritos">
                <Heart className="h-4 w-4" />
                {favoritos.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full text-xs w-4 h-4 flex items-center justify-center">
                    {favoritos.length}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Banner Principal */}
      {config.mostrarBanner && (config.bannerPrincipal || loja.banner) && (
        <div className="relative w-full h-64 md:h-96 lg:h-[500px] overflow-hidden">
          <Image
            src={config.bannerPrincipal || loja.banner || "/placeholder.svg"}
            alt={loja.nome}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 flex items-center justify-center">
            <div className="text-center text-white p-4 max-w-3xl">
              <motion.h2
                className="text-3xl md:text-5xl font-bold mb-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Bem-vindo à {loja.nome}
              </motion.h2>
              <motion.p
                className="text-lg md:text-xl opacity-90 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {config.descricao || loja.descricao || "Conheça nossos produtos e serviços"}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100 shadow-lg">
                  Ver produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 bg-background">
        {/* Seção de Produtos em Destaque */}
        <section className="py-16 px-4">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-bold">Produtos em Destaque</h2>
                <p className="text-muted-foreground mt-2">Conheça nossa seleção especial de produtos</p>
              </div>

              {/* Categorias em desktop */}
              {categorias.length > 0 && (
                <div className="hidden md:flex items-center gap-2 mt-4 md:mt-0">
                  <Button
                    variant={categoriaAtiva === null ? "default" : "outline"}
                    onClick={() => setCategoriaAtiva(null)}
                  >
                    Todos
                  </Button>
                  {categorias.map((categoria) => (
                    <Button
                      key={categoria}
                      variant={categoriaAtiva === categoria ? "default" : "outline"}
                      onClick={() => setCategoriaAtiva(categoria)}
                    >
                      {categoria}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Grid de Produtos */}
            {filteredProdutos.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProdutos.map((produto, index) => (
                  <ProdutoCard
                    key={produto._id}
                    produto={produto}
                    config={config}
                    onShare={compartilharProduto}
                    onFavorite={toggleFavorito}
                    isFavorite={favoritos.includes(produto._id)}
                    animationProps={{
                      initial: { opacity: 0, y: 20 },
                      animate: { opacity: 1, y: 0 },
                      transition: { duration: 0.3, delay: index * 0.05 },
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center">
                <h3 className="text-xl font-semibold">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground">Tente refinar sua busca ou explore outras categorias.</p>
              </div>
            )}
          </div>
        </section>

        {/* Seção Sobre a Loja */}
        {config.secaoSobre?.ativo && (
          <section className="py-16 px-4 bg-secondary-foreground text-secondary">
            <div className="container mx-auto flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2">
                <h2 className="text-3xl font-bold mb-4">{config.secaoSobre.titulo || "Sobre nós"}</h2>
                <p className="text-lg">{config.secaoSobre.conteudo || "Conteúdo sobre a loja"}</p>
              </div>
              <div className="md:w-1/2">
                {config.secaoSobre.imagem && (
                  <div className="relative aspect-w-16 aspect-h-9">
                    <Image
                      src={config.secaoSobre.imagem || "/placeholder.svg"}
                      alt="Imagem sobre a loja"
                      fill
                      className="object-cover rounded-lg shadow-md"
                    />
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Seção de Contato */}
        {config.mostrarContato && (
          <section className="py-16 px-4">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Entre em Contato</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Informações de Contato */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Informações</h3>
                  <ul className="space-y-3">
                    {loja.telefone && (
                      <li className="flex items-center gap-2">
                        <Phone className="h-5 w-5 text-gray-500" />
                        <a href={`tel:${loja.telefone}`} className="hover:text-blue-500 transition-colors">
                          {loja.telefone}
                        </a>
                      </li>
                    )}
                    {loja.email && (
                      <li className="flex items-center gap-2">
                        <Mail className="h-5 w-5 text-gray-500" />
                        <a href={`mailto:${loja.email}`} className="hover:text-blue-500 transition-colors">
                          {loja.email}
                        </a>
                      </li>
                    )}
                    {loja.site && (
                      <li className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-gray-500" />
                        <a
                          href={loja.site}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-blue-500 transition-colors"
                        >
                          {loja.site}
                        </a>
                      </li>
                    )}
                    {config.mostrarEndereco && loja.endereco && (
                      <li className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <p className="font-medium">
                            {loja.endereco.logradouro}, {loja.endereco.numero}
                          </p>
                          <p className="text-gray-500">
                            {loja.endereco.complemento && `${loja.endereco.complemento}, `}
                            {loja.endereco.bairro}, {loja.endereco.cidade} - {loja.endereco.estado}
                          </p>
                        </div>
                      </li>
                    )}
                    {config.mostrarHorarios && loja.horariosFuncionamento && (
                      <>
                        <li className="flex items-center gap-2">
                          <Clock className="h-5 w-5 text-gray-500" /> Horário de Funcionamento:
                        </li>
                        <ul className="ml-7 space-y-1">
                          {Object.entries(loja.horariosFuncionamento).map(([diaSemana, horario]) => (
                            <li key={diaSemana} className="flex items-center gap-2">
                              <span className="capitalize">{diaSemana}:</span>
                              <span>
                                {formatarHorario(horario)}
                                {isDiaAtual(diaSemana) && isHorarioAberto(horario) && (
                                  <Badge className="ml-2">Aberto agora</Badge>
                                )}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                  </ul>
                </div>

                {/* Formulário de Contato */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Envie uma Mensagem</h3>
                  <form className="space-y-4">
                    <div>
                      <Label htmlFor="nome">Nome</Label>
                      <Input type="text" id="nome" placeholder="Seu nome" />
                    </div>
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input type="email" id="email" placeholder="seu@email.com" />
                    </div>
                    <div>
                      <Label htmlFor="mensagem">Mensagem</Label>
                      <Textarea id="mensagem" placeholder="Sua mensagem" rows={4} />
                    </div>
                    <Button>Enviar Mensagem</Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Seção de Avaliações */}
        {config.mostrarAvaliacao && (
          <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
            <div className="container mx-auto">
              <h2 className="text-3xl font-bold mb-8 text-center">Avaliações</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Lista de Avaliações */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">O que dizem sobre nós</h3>
                  {avaliacoes.length > 0 ? (
                    avaliacoes.map((avaliacao) => <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />)
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Ainda não há avaliações. Seja o primeiro a avaliar!
                    </p>
                  )}
                </div>

                {/* Formulário de Avaliação */}
                <div>
                  <h3 className="text-xl font-semibold mb-4">Deixe sua avaliação</h3>
                  <form onSubmit={enviarAvaliacao} className="space-y-4">
                    <div>
                      <Label htmlFor="avaliacaoNome">Nome</Label>
                      <Input
                        type="text"
                        id="avaliacaoNome"
                        placeholder="Seu nome"
                        value={avaliacaoNome}
                        onChange={(e) => setAvaliacaoNome(e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="avaliacaoEmail">Email</Label>
                      <Input
                        type="email"
                        id="avaliacaoEmail"
                        placeholder="seu@email.com (opcional)"
                        value={avaliacaoEmail}
                        onChange={(e) => setAvaliacaoEmail(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="avaliacaoNota">Nota</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((nota) => (
                          <button
                            key={nota}
                            type="button"
                            className={cn(
                              "p-1 rounded-full transition-colors",
                              avaliacaoNota >= nota
                                ? "bg-yellow-500 hover:bg-yellow-400"
                                : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600",
                            )}
                            onClick={() => setAvaliacaoNota(nota)}
                          >
                            <Star className="h-5 w-5 text-white" />
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="avaliacaoComentario">Comentário</Label>
                      <Textarea
                        id="avaliacaoComentario"
                        placeholder="Seu comentário"
                        rows={4}
                        value={avaliacaoComentario}
                        onChange={(e) => setAvaliacaoComentario(e.target.value)}
                        required
                      />
                    </div>
                    <Button type="submit">Enviar Avaliação</Button>
                  </form>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-secondary-foreground text-secondary py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Informações da Loja */}
            <div>
              <h4 className="font-bold text-lg mb-4">{loja.nome}</h4>
              <p>{loja.descricao || "Sua loja online"}</p>
              <div className="flex items-center gap-2 mt-4">
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <Twitter className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold text-lg mb-4">Assine nossa Newsletter</h4>
              <p>Receba novidades e promoções exclusivas.</p>
              <form onSubmit={handleNewsletterSubmit} className="mt-4">
                <div className="flex">
                  <Input
                    type="email"
                    placeholder="Seu email"
                    value={newsletterEmail}
                    onChange={(e) => setNewsletterEmail(e.target.value)}
                    className="flex-1 rounded-r-none"
                  />
                  <Button type="submit" className="rounded-l-none">
                    Inscrever
                  </Button>
                </div>
                {newsletterEnviado && <p className="mt-2 text-green-500">Obrigado por se inscrever!</p>}
              </form>
            </div>

            {/* Links Úteis */}
            <div>
              <h4 className="font-bold text-lg mb-4">Links Úteis</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Sobre nós
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Política de Privacidade
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Termos de Serviço
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-blue-500 transition-colors">
                    Contato
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-8 text-center">
            <p className="text-sm">
              &copy; {new Date().getFullYear()} {loja.nome}. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>

      {/* Botão Voltar ao Topo */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            onClick={scrollToTop}
            className="fixed bottom-8 right-4 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-500 transition-colors z-50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <ChevronRight className="h-6 w-6 rotate-90" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}
