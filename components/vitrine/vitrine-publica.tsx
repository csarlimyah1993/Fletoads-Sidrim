"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Search,
  ShoppingBag,
  Phone,
  Mail,
  Globe,
  MapPin,
  Clock,
  ArrowRight,
  Star,
  Share2,
  Menu,
  X,
  ShoppingCart,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { Loja, Produto } from "@/types/loja"

// Tipos
interface VitrinePublicaProps {
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
  widgetPromocao?: {
    ativo?: boolean
    titulo?: string
    descricao?: string
    corFundo?: string
    corTexto?: string
  }
  widgetContador?: {
    ativo?: boolean
    titulo?: string
    dataFim?: string
    corFundo?: string
    corTexto?: string
  }
  widgetNewsletter?: {
    ativo?: boolean
    titulo?: string
    descricao?: string
    corFundo?: string
    corTexto?: string
  }
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
  layout?: string
  animationProps?: any
}

// Componente de Card de Produto
function ProdutoCard({ produto, config, onShare, layout = "padrao", animationProps = {} }: ProdutoCardProps) {
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
              className="absolute top-2 right-2 px-2 py-1 rounded-md text-sm font-bold"
              style={{ backgroundColor: config?.corDestaque || "#f59e0b", color: "#ffffff" }}
            >
              {Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}% OFF
            </div>
          )}

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center"
              >
                <Button className="bg-white text-gray-800 hover:bg-gray-100" size="sm">
                  Ver detalhes
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="font-bold text-lg line-clamp-2">{produto.nome}</h3>

          {produto.descricaoCurta && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{produto.descricaoCurta}</p>
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

// Função para obter cores baseadas no tema
function getThemeColors(config: VitrineConfig) {
  const colors = {
    background: config.corFundo || (config.tema === "escuro" ? "#121212" : "#ffffff"),
    text: config.tema === "escuro" ? "#ffffff" : "#1f2937",
    cardBg: config.tema === "escuro" ? "#1f2937" : "#ffffff",
    cardBorder: config.tema === "escuro" ? "#374151" : "#e5e7eb",
    muted: config.tema === "escuro" ? "#6b7280" : "#9ca3af",
  }

  return colors
}

// Componente principal
export default function VitrinePublica({ id, slug }: VitrinePublicaProps) {
  const [loja, setLoja] = useState<Loja | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [config, setConfig] = useState<VitrineConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([])
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterEnviado, setNewsletterEnviado] = useState(false)
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

    window.addEventListener("scroll", handleScroll)
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
    // Aqui você implementaria a lógica para salvar o email
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
    <div
      className={cn(
        "min-h-screen flex flex-col",
        config.tema === "escuro" ? "bg-gray-900 text-white" : "bg-white text-gray-900",
      )}
    >
      {/* Header */}
      <header
        ref={headerRef}
        className={cn(
          "py-4 md:py-6 transition-all duration-300",
          isHeaderFixed ? "sticky top-0 shadow-md z-50" : "",
          config.tema === "escuro" ? "shadow-gray-900" : "",
        )}
        style={{
          backgroundColor: config.corPrimaria || (config.tema === "escuro" ? "#1f2937" : "#3b82f6"),
          color: config.corTexto || "#ffffff",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {config.mostrarLogo && (loja.logo || config.logoPersonalizado) && (
                <div className="w-16 h-16 rounded-full overflow-hidden bg-white p-1 shadow-lg">
                  <Image
                    src={config.logoPersonalizado || loja.logo || "/placeholder.svg"}
                    alt={loja.nome}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover rounded-full"
                  />
                </div>
              )}

              <div className="text-center md:text-left">
                <h1 className="text-3xl md:text-4xl font-bold">{config.titulo || loja.nome}</h1>
                {config.descricao && <p className="mt-2 text-lg opacity-90">{config.descricao}</p>}
              </div>
            </div>

            <div className="flex items-center gap-4">
              {config.mostrarBusca && (
                <div className="relative hidden md:block">
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-64 bg-white text-gray-900 rounded-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              )}

              <Button
                variant="outline"
                className="hidden md:flex items-center gap-2 bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
              >
                <ShoppingBag className="h-4 w-4" />
                <span>Ver produtos</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Menu mobile */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="md:hidden mt-4 overflow-hidden"
              >
                <div className="flex flex-col gap-2 py-2">
                  {config.mostrarBusca && (
                    <div className="relative">
                      <Input
                        type="search"
                        placeholder="Buscar produtos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 w-full bg-white text-gray-900 rounded-full"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    </div>
                  )}

                  <Button
                    variant="outline"
                    className="w-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShoppingBag className="h-4 w-4 mr-2" />
                    <span>Ver produtos</span>
                  </Button>

                  {config.mostrarContato && (
                    <Button
                      variant="outline"
                      className="w-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      <span>Contato</span>
                    </Button>
                  )}

                  {config.mostrarEndereco && (
                    <Button
                      variant="outline"
                      className="w-full bg-white/20 backdrop-blur-sm border-white/30 hover:bg-white/30"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      <span>Endereço</span>
                    </Button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
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
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
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
                {config.descricao || "Conheça nossos produtos e serviços"}
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  Ver produtos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <Tabs defaultValue="produtos" className="w-full">
          <TabsList className="mb-6">
            {config.mostrarProdutos && <TabsTrigger value="produtos">Produtos</TabsTrigger>}
            {config.mostrarContato && <TabsTrigger value="contato">Contato</TabsTrigger>}
            {config.mostrarEndereco && <TabsTrigger value="endereco">Endereço</TabsTrigger>}
            {config.mostrarHorarios && <TabsTrigger value="horarios">Horários</TabsTrigger>}
            {config.secaoSobre?.ativo && <TabsTrigger value="sobre">Sobre</TabsTrigger>}
          </TabsList>

          {/* Produtos */}
          {config.mostrarProdutos && (
            <TabsContent value="produtos" className="space-y-6">
              {/* Categorias */}
              {config.mostrarCategorias && categorias.length > 0 && (
                <ScrollArea className="w-full whitespace-nowrap pb-4">
                  <div className="flex gap-2">
                    <Button
                      variant={categoriaAtiva === null ? "default" : "outline"}
                      onClick={() => setCategoriaAtiva(null)}
                      className="whitespace-nowrap"
                      style={
                        categoriaAtiva === null
                          ? {
                              backgroundColor: config.corPrimaria,
                              color: config.corTexto,
                            }
                          : {}
                      }
                    >
                      Todos
                    </Button>

                    {categorias.map((categoria) => (
                      <Button
                        key={categoria}
                        variant={categoriaAtiva === categoria ? "default" : "outline"}
                        onClick={() => setCategoriaAtiva(categoria)}
                        className="whitespace-nowrap"
                        style={
                          categoriaAtiva === categoria
                            ? {
                                backgroundColor: config.corPrimaria,
                                color: config.corTexto,
                              }
                            : {}
                        }
                      >
                        {categoria}
                      </Button>
                    ))}
                  </div>
                </ScrollArea>
              )}

              {/* Lista de produtos */}
              {filteredProdutos.length > 0 ? (
                <div
                  className={cn(
                    "grid gap-6",
                    config.layout === "grid"
                      ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                      : config.layout === "lista"
                        ? "grid-cols-1"
                        : config.layout === "magazine"
                          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>*:first-child]:md:col-span-2 [&>*:first-child]:md:row-span-2"
                          : "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4", // layout padrão
                  )}
                >
                  {filteredProdutos.map((produto, index) => (
                    <ProdutoCard
                      key={produto._id}
                      produto={produto}
                      config={config}
                      onShare={() => compartilharProduto(produto)}
                      layout={config.layout}
                      animationProps={{
                        initial: { opacity: 0, y: 20 },
                        animate: { opacity: 1, y: 0 },
                        transition: { duration: 0.3, delay: index * 0.05 },
                      }}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <ShoppingBag className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || categoriaAtiva
                      ? "Tente ajustar seus filtros de busca."
                      : "Não há produtos disponíveis no momento."}
                  </p>
                  {(searchTerm || categoriaAtiva) && (
                    <Button
                      onClick={() => {
                        setSearchTerm("")
                        setCategoriaAtiva(null)
                      }}
                    >
                      Limpar filtros
                    </Button>
                  )}
                </div>
              )}
            </TabsContent>
          )}

          {/* Contato */}
          {config.mostrarContato && (
            <TabsContent value="contato" className="space-y-6">
              <Card className={cn(config.tema === "escuro" ? "bg-gray-800 border-gray-700" : "")}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Entre em contato</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div className="flex items-start gap-3">
                        <Phone className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Telefone</h3>
                          <p className="text-gray-600">{loja.contato?.telefone || "Não informado"}</p>
                        </div>
                      </div>

                      {loja.contato?.whatsapp && (
                        <div className="flex items-start gap-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="text-green-500 mt-0.5"
                          >
                            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                            <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
                          </svg>
                          <div>
                            <h3 className="font-medium">WhatsApp</h3>
                            <p className="text-gray-600">{loja.contato.whatsapp}</p>
                            {config.mostrarWhatsapp && (
                              <a
                                href={`https://wa.me/${loja.contato.whatsapp.replace(/\D/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline mt-1"
                              >
                                Enviar mensagem
                                <ArrowRight className="h-3 w-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 text-gray-500 mt-0.5" />
                        <div>
                          <h3 className="font-medium">Email</h3>
                          <p className="text-gray-600">{loja.contato?.email || "Não informado"}</p>
                        </div>
                      </div>

                      {loja.contato?.site && (
                        <div className="flex items-start gap-3">
                          <Globe className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h3 className="font-medium">Site</h3>
                            <a
                              href={
                                loja.contato.site.startsWith("http")
                                  ? loja.contato.site
                                  : `https://${loja.contato.site}`
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {loja.contato.site}
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h3 className="font-medium mb-4">Envie uma mensagem</h3>
                      <form className="space-y-4">
                        <div>
                          <Label htmlFor="nome">Nome</Label>
                          <Input id="nome" placeholder="Seu nome" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="Seu email" />
                        </div>
                        <div>
                          <Label htmlFor="mensagem">Mensagem</Label>
                          <Textarea id="mensagem" placeholder="Sua mensagem" rows={4} />
                        </div>
                        <Button
                          className="w-full"
                          style={{
                            backgroundColor: config.corPrimaria,
                            color: config.corTexto,
                          }}
                        >
                          Enviar mensagem
                        </Button>
                      </form>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Endereço */}
          {config.mostrarEndereco && (
            <TabsContent value="endereco" className="space-y-6">
              <Card className={cn(config.tema === "escuro" ? "bg-gray-800 border-gray-700" : "")}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Localização</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <div className="space-y-4">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div>
                            <h3 className="font-medium">Endereço</h3>
                            <p className="text-gray-600">
                              {loja.endereco?.rua || loja.endereco?.logradouro || ""} {loja.endereco?.numero || ""}
                              {loja.endereco?.complemento ? `, ${loja.endereco.complemento}` : ""}
                            </p>
                            <p className="text-gray-600">
                              {loja.endereco?.bairro || ""} {loja.endereco?.cidade ? `- ${loja.endereco.cidade}` : ""}
                              {loja.endereco?.estado ? `, ${loja.endereco.estado}` : ""}
                            </p>
                            <p className="text-gray-600">{loja.endereco?.cep || ""}</p>
                          </div>
                        </div>
                      </div>

                      {config.mostrarHorarios && loja.horarioFuncionamento && (
                        <div className="mt-6">
                          <h3 className="font-medium mb-3">Horário de Funcionamento</h3>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className={isDiaAtual("segunda") ? "font-medium" : ""}>Segunda-feira</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.segunda)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDiaAtual("terca") ? "font-medium" : ""}>Terça-feira</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.terca)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDiaAtual("quarta") ? "font-medium" : ""}>Quarta-feira</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.quarta)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDiaAtual("quinta") ? "font-medium" : ""}>Quinta-feira</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.quinta)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDiaAtual("sexta") ? "font-medium" : ""}>Sexta-feira</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.sexta)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDiaAtual("sabado") ? "font-medium" : ""}>Sábado</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.sabado)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={isDiaAtual("domingo") ? "font-medium" : ""}>Domingo</span>
                              <span>{formatarHorario(loja.horarioFuncionamento.domingo)}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="h-[400px] bg-gray-200 rounded-lg flex items-center justify-center">
                      <div className="text-center p-4">
                        <MapPin className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                        <p className="text-gray-500">Mapa não disponível</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Horários */}
          {config.mostrarHorarios && (
            <TabsContent value="horarios" className="space-y-6">
              <Card className={cn(config.tema === "escuro" ? "bg-gray-800 border-gray-700" : "")}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">Horário de Funcionamento</h2>
                  <div className="max-w-md mx-auto">
                    {loja.horarioFuncionamento ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("segunda") && loja.horarioFuncionamento.segunda?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("segunda") ? "font-medium" : ""}>Segunda-feira</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.segunda)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("terca") && loja.horarioFuncionamento.terca?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("terca") ? "font-medium" : ""}>Terça-feira</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.terca)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("quarta") && loja.horarioFuncionamento.quarta?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("quarta") ? "font-medium" : ""}>Quarta-feira</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.quarta)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("quinta") && loja.horarioFuncionamento.quinta?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("quinta") ? "font-medium" : ""}>Quinta-feira</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.quinta)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("sexta") && loja.horarioFuncionamento.sexta?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("sexta") ? "font-medium" : ""}>Sexta-feira</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.sexta)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3 border-b">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("sabado") && loja.horarioFuncionamento.sabado?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("sabado") ? "font-medium" : ""}>Sábado</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.sabado)}</span>
                        </div>
                        <div className="flex justify-between items-center py-3">
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-3 h-3 rounded-full ${
                                isDiaAtual("domingo") && loja.horarioFuncionamento.domingo?.open
                                  ? "bg-green-500"
                                  : "bg-gray-300"
                              }`}
                            />
                            <span className={isDiaAtual("domingo") ? "font-medium" : ""}>Domingo</span>
                          </div>
                          <span>{formatarHorario(loja.horarioFuncionamento.domingo)}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Horários não disponíveis</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Sobre */}
          {config.secaoSobre?.ativo && (
            <TabsContent value="sobre" className="space-y-6">
              <Card className={cn(config.tema === "escuro" ? "bg-gray-800 border-gray-700" : "")}>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-6">{config.secaoSobre.titulo || "Sobre nós"}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="prose max-w-none">
                      <div dangerouslySetInnerHTML={{ __html: config.secaoSobre.conteudo || loja.descricao || "" }} />
                    </div>
                    {config.secaoSobre.imagem && (
                      <div className="relative h-64 md:h-full rounded-lg overflow-hidden">
                        <Image
                          src={config.secaoSobre.imagem || "/placeholder.svg"}
                          alt={loja.nome}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Widget Newsletter */}
      {config.widgetNewsletter?.ativo && (
        <section
          className="py-12 px-4"
          style={{
            backgroundColor: config.widgetNewsletter.corFundo || "#dbeafe",
            color: config.widgetNewsletter.corTexto || "#1e40af",
          }}
        >
          <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-3">{config.widgetNewsletter.titulo || "Newsletter"}</h2>
            <p className="mb-6">{config.widgetNewsletter.descricao || "Receba nossas novidades por email"}</p>
            {newsletterEnviado ? (
              <div className="bg-white bg-opacity-20 p-4 rounded-lg inline-block">
                <Check className="h-6 w-6 mx-auto mb-2" />
                <p>Email cadastrado com sucesso!</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
                <Input
                  type="email"
                  placeholder="Seu melhor email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  className="flex-1 bg-white text-gray-900"
                  required
                />
                <Button
                  type="submit"
                  style={{
                    backgroundColor: config.corPrimaria || "#3b82f6",
                    color: config.corTexto || "#ffffff",
                  }}
                >
                  Inscrever-se
                </Button>
              </form>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer
        className={cn(
          "py-8 px-4",
          config.tema === "escuro" ? "bg-gray-800 text-gray-200" : "bg-gray-100 text-gray-800",
        )}
      >
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <h3 className="font-bold text-lg">{loja.nome}</h3>
              <p className="text-gray-600 text-sm">&copy; {new Date().getFullYear()} Todos os direitos reservados</p>
            </div>
            <div className="flex gap-4">
              {config.mostrarRedesSociais && (
                <>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    <span className="sr-only">Facebook</span>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-gray-900">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                    </svg>
                    <span className="sr-only">Instagram</span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Botão de voltar ao topo */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-md bg-white z-50"
          onClick={scrollToTop}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4 w-4"
          >
            <path d="m18 15-6-6-6 6" />
          </svg>
        </Button>
      )}
    </div>
  )
}
