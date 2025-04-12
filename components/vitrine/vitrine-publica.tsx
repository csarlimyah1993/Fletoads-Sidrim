"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Instagram, Facebook, Twitter, Linkedin, Youtube, Mail, MapPin, Phone, ShoppingCart, Search, ChevronRight, ChevronLeft, AlertCircle, Star, Share2 } from 'lucide-react'

// Tipos
interface VitrinePublicaProps {
  slug: string
}

interface Produto {
  _id: string
  nome: string
  descricaoCurta?: string
  preco: number
  precoPromocional?: number
  imagens?: string[]
  destaque?: boolean
  ativo?: boolean
  categorias?: string[]
  estoque?: number
}

interface VitrineConfig {
  titulo: string
  descricao?: string
  corPrimaria: string
  corSecundaria: string
  corTexto: string
  corFundo: string
  corDestaque?: string
  layout: string
  tema: string
  mostrarProdutos: boolean
  mostrarContato: boolean
  mostrarEndereco: boolean
  mostrarHorarios: boolean
  mostrarRedesSociais: boolean
  mostrarBanner: boolean
  mostrarLogo: boolean
  mostrarBusca: boolean
  mostrarCategorias: boolean
  mostrarPrecos: boolean
  mostrarPromocoes: boolean
  mostrarEstoque: boolean
  mostrarAvaliacao: boolean
  mostrarCompartilhar: boolean
  mostrarWhatsapp: boolean
  animacoes?: boolean
  efeitos?: string
  fontePersonalizada?: string
  widgetPromocao?: {
    ativo: boolean
    titulo: string
    descricao: string
    corFundo: string
    corTexto: string
  }
  widgetContador?: {
    ativo: boolean
    titulo: string
    dataFim: string
    corFundo: string
    corTexto: string
  }
  widgetNewsletter?: {
    ativo: boolean
    titulo: string
    descricao: string
    corFundo: string
    corTexto: string
  }
  bannerPrincipal?: string
  bannerSecundario?: string
  logoPersonalizado?: string
  iconePersonalizado?: string
}

// Componente de Card de Produto
interface ProdutoCardProps {
  produto: Produto
  config: VitrineConfig
  onShare: () => void
  animationProps?: any
}

function ProdutoCard({ produto, config, onShare, animationProps = {} }: ProdutoCardProps) {
  return (
    <motion.div {...animationProps}>
      <Card className="h-full flex flex-col overflow-hidden">
        <div className="relative aspect-square overflow-hidden">
          {produto.imagens && produto.imagens.length > 0 ? (
            <Image
              src={produto.imagens[0] || "/placeholder.svg"}
              alt={produto.nome}
              fill
              className="object-cover transition-transform hover:scale-105"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
          )}
          {config.mostrarPromocoes && produto.precoPromocional && produto.precoPromocional < produto.preco && (
            <div
              className="absolute top-2 right-2 px-2 py-1 rounded-md text-sm font-bold"
              style={{ backgroundColor: config.corDestaque || "#f59e0b", color: "#ffffff" }}
            >
              {Math.round(((produto.preco - produto.precoPromocional) / produto.preco) * 100)}% OFF
            </div>
          )}
        </div>
        <CardContent className="flex-1 flex flex-col p-4">
          <h3 className="font-bold text-lg line-clamp-2">{produto.nome}</h3>
          {produto.descricaoCurta && (
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">{produto.descricaoCurta}</p>
          )}

          {config.mostrarPrecos && (
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
                    style={{ color: config.corDestaque || config.corPrimaria || "#f59e0b" }}
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

          {config.mostrarEstoque && produto.estoque !== undefined && (
            <div className="mt-2 text-sm">
              {produto.estoque > 0 ? (
                <span className="text-green-600">Em estoque: {produto.estoque} unidades</span>
              ) : (
                <span className="text-red-600">Fora de estoque</span>
              )}
            </div>
          )}

          {config.mostrarAvaliacao && (
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
                backgroundColor: config.corPrimaria,
                color: config.corTexto,
              }}
            >
              Ver detalhes
            </Button>
            {config.mostrarCompartilhar && (
              <Button variant="outline" size="icon" onClick={onShare}>
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

// Componente principal
export default function VitrinePublica({ slug }: VitrinePublicaProps) {
  const [loja, setLoja] = useState<any>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [config, setConfig] = useState<VitrineConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredProdutos, setFilteredProdutos] = useState<Produto[]>([])
  const [categoriaAtiva, setCategoriaAtiva] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [tempoRestante, setTempoRestante] = useState<{
    dias: number
    horas: number
    minutos: number
    segundos: number
  }>({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  })
  const [newsletterEmail, setNewsletterEmail] = useState("")
  const [newsletterEnviado, setNewsletterEnviado] = useState(false)

  // Efeito para buscar dados da loja e vitrine
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        // Verificar se estamos no navegador antes de fazer a requisição
        if (typeof window === 'undefined') {
          return; // Não executar no servidor
        }
        
        const response = await fetch(`/api/vitrines/${slug}`)

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
  }, [slug])

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }

    if (typeof window !== 'undefined') {
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
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

  // Efeito para contador regressivo
  useEffect(() => {
    if (!config?.widgetContador?.ativo || !config.widgetContador.dataFim) return

    const dataFim = new Date(config.widgetContador.dataFim).getTime()

    const interval = setInterval(() => {
      const agora = new Date().getTime()
      const diferenca = dataFim - agora

      if (diferenca <= 0) {
        clearInterval(interval)
        setTempoRestante({ dias: 0, horas: 0, minutos: 0, segundos: 0 })
        return
      }

      const dias = Math.floor(diferenca / (1000 * 60 * 60 * 24))
      const horas = Math.floor((diferenca % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutos = Math.floor((diferenca % (1000 * 60 * 60)) / (1000 * 60))
      const segundos = Math.floor((diferenca % (1000 * 60)) / 1000)

      setTempoRestante({ dias, horas, minutos, segundos })
    }, 1000)

    return () => clearInterval(interval)
  }, [config?.widgetContador])

  // Função para avançar slide
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % (produtos?.length || 1))
  }

  // Função para voltar slide
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + (produtos?.length || 1)) % (produtos?.length || 1))
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

  // Função para voltar ao topo
  const scrollToTop = () => {
    if (typeof window !== 'undefined') {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      })
    }
  }

  // Função para compartilhar produto
  const compartilharProduto = (produto: Produto) => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({
        title: produto.nome,
        text: produto.descricaoCurta || `Confira ${produto.nome}`,
        url: window.location.href,
      })
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      // Fallback para navegadores que não suportam Web Share API
      navigator.clipboard.writeText(window.location.href)
      alert("Link copiado para a área de transferência!")
    }
  }

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
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Erro ao carregar vitrine</h1>
          <p className="mb-4">{error || "Vitrine não encontrada ou indisponível."}</p>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </div>
      </div>
    )
  }

  // Extrair categorias únicas
  const categorias = produtos ? Array.from(new Set(produtos.flatMap((p) => p.categorias || []))) : []

  // Definir classes CSS com base no layout e tema
  const getLayoutClasses = () => {
    const baseClasses = "min-h-screen flex flex-col"

    if (config.tema === "escuro") {
      return `${baseClasses} bg-gray-900 text-gray-100`
    }

    return `${baseClasses} bg-white text-gray-900`
  }

  // Definir estilos para o cabeçalho com base no layout
  const getHeaderStyle = () => {
    const baseStyle = {
      backgroundColor: config.corPrimaria,
      color: config.corTexto,
    }

    if (config.layout === "moderno") {
      return {
        ...baseStyle,
        clipPath: "polygon(0 0, 100% 0, 100% 85%, 0 100%)",
        paddingBottom: "5rem",
      }
    }

    if (config.layout === "minimalista") {
      return {
        backgroundColor: "transparent",
        color: "#000000",
        borderBottom: `2px solid ${config.corPrimaria}`,
      }
    }

    return baseStyle
  }

  // Definir animações com base nas configurações
  const getAnimationProps = () => {
    if (!config.animacoes) return {}

    const baseProps = {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      transition: { duration: 0.5 },
    }

    if (config.efeitos === "slide") {
      return {
        ...baseProps,
        initial: { opacity: 0, y: 50 },
        animate: { opacity: 1, y: 0 },
      }
    }

    if (config.efeitos === "zoom") {
      return {
        ...baseProps,
        initial: { opacity: 0, scale: 0.9 },
        animate: { opacity: 1, scale: 1 },
      }
    }

    return baseProps
  }

  // Aplicar fonte personalizada
  const getFontStyle = () => {
    if (!config.fontePersonalizada || config.fontePersonalizada === "padrao") {
      return {}
    }

    return {
      fontFamily: config.fontePersonalizada,
    }
  }

  // Renderizar o componente principal
  return (
    <div className={getLayoutClasses()} style={getFontStyle()}>
      {/* Cabeçalho */}
      <header style={getHeaderStyle()} className="py-8 md:py-12 relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {config.mostrarLogo && loja.logo && (
              <div className="w-24 h-24 rounded-full overflow-hidden bg-white p-1 shadow-lg">
                <Image
                  src={config.logoPersonalizado || loja.logo}
                  alt={loja.nome}
                  width={96}
                  height={96}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
            )}

            <div className="text-center md:text-left flex-1">
              <motion.h1 className="text-3xl md:text-4xl font-bold" {...getAnimationProps()}>
                {config.titulo}
              </motion.h1>
              {config.descricao && (
                <motion.p
                  className="mt-2 text-lg opacity-90"
                  {...getAnimationProps()}
                  transition={{
                    delay: 0.2,
                    duration: 0.5,
                  }}
                >
                  {config.descricao}
                </motion.p>
              )}
            </div>

            {config.mostrarBusca && (
              <div className="w-full md:w-auto mt-4 md:mt-0">
                <div className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 w-full md:w-64 bg-white text-gray-900 rounded-full"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Banner Principal */}
      {config.mostrarBanner && (config.bannerPrincipal || loja.banner) && (
        <div className="relative w-full h-48 md:h-64 lg:h-80 overflow-hidden">
          <Image src={config.bannerPrincipal || loja.banner} alt={loja.nome} fill className="object-cover" />
          <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
            <div className="text-center text-white p-4">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Bem-vindo à {loja.nome}</h2>
              <p className="text-lg opacity-90">Conheça nossos produtos e serviços</p>
            </div>
          </div>
        </div>
      )}

      {/* Widget de Promoção */}
      {config.widgetPromocao?.ativo && (
        <div
          className="py-3 px-4 text-center"
          style={{
            backgroundColor: config.widgetPromocao.corFundo,
            color: config.widgetPromocao.corTexto,
          }}
        >
          <h3 className="font-bold text-lg">{config.widgetPromocao.titulo}</h3>
          <p>{config.widgetPromocao.descricao}</p>
        </div>
      )}

      {/* Widget de Contador */}
      {config.widgetContador?.ativo && (
        <div
          className="py-4 px-4 text-center"
          style={{
            backgroundColor: config.widgetContador.corFundo,
            color: config.widgetContador.corTexto,
          }}
        >
          <h3 className="font-bold text-lg mb-2">{config.widgetContador.titulo}</h3>
          <div className="flex justify-center gap-2 md:gap-4">
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3 min-w-[60px]">
              <div className="text-xl md:text-2xl font-bold">{tempoRestante.dias}</div>
              <div className="text-xs md:text-sm">Dias</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3 min-w-[60px]">
              <div className="text-xl md:text-2xl font-bold">{tempoRestante.horas}</div>
              <div className="text-xs md:text-sm">Horas</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3 min-w-[60px]">
              <div className="text-xl md:text-2xl font-bold">{tempoRestante.minutos}</div>
              <div className="text-xs md:text-sm">Min</div>
            </div>
            <div className="bg-white bg-opacity-20 rounded-lg p-2 md:p-3 min-w-[60px]">
              <div className="text-xl md:text-2xl font-bold">{tempoRestante.segundos}</div>
              <div className="text-xs md:text-sm">Seg</div>
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
          </TabsList>

          {/* Produtos */}
          {config.mostrarProdutos && (
            <TabsContent value="produtos" className="space-y-6">
              {/* Categorias */}
              {config.mostrarCategorias && categorias.length > 0 && (
                <div className="mb-6 overflow-x-auto pb-2">
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
                </div>
              )}

              {/* Layout de produtos baseado na configuração */}
              {filteredProdutos.length > 0 ? (
                config.layout === "slider" ? (
                  <div className="relative">
                    <div className="overflow-hidden">
                      <div
                        className="flex transition-transform duration-300"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                      >
                        {filteredProdutos.map((produto) => (
                          <div key={produto._id} className="w-full flex-shrink-0 px-2">
                            <ProdutoCard
                              produto={produto}
                              config={config}
                              onShare={() => compartilharProduto(produto)}
                              animationProps={getAnimationProps()}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute left-0 top-1/2 transform -translate-y-1/2 rounded-full"
                      onClick={prevSlide}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 rounded-full"
                      onClick={nextSlide}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {filteredProdutos.map((produto, index) => (
                      <ProdutoCard
                        key={produto._id}
                        produto={produto}
                        config={config}
                        onShare={() => compartilharProduto(produto)}
                        animationProps={{
                          ...getAnimationProps(),
                          transition: {
                            delay: index * 0.1,
                            duration: 0.5,
                          },
                        }}
                      />
                    ))}
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <ShoppingCart className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                  <p className="text-gray-500">
                    {searchTerm || categoriaAtiva
                      ? "Tente ajustar os filtros de busca"
                      : "Não há produtos disponíveis no momento"}
                  </p>

                  {(searchTerm || categoriaAtiva) && (
                    <Button
                      className="mt-4"
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
              <Card>
                <CardHeader>
                  <CardTitle>Entre em Contato</CardTitle>
                  <CardDescription>Estamos à disposição para atendê-lo</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    {loja.contato?.telefone && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full" style={{ backgroundColor: config.corPrimaria }}>
                          <Phone className="h-5 w-5" style={{ color: config.corTexto }} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Telefone</p>
                          <p className="font-medium">{loja.contato.telefone}</p>
                        </div>
                      </div>
                    )}

                    {loja.contato?.whatsapp && config.mostrarWhatsapp && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full" style={{ backgroundColor: "#25D366" }}>
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
                            className="text-white"
                          >
                            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                            <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">WhatsApp</p>
                          <a
                            href={`https://wa.me/${loja.contato.whatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium hover:underline"
                            style={{ color: config.corPrimaria }}
                          >
                            {loja.contato.whatsapp}
                          </a>
                        </div>
                      </div>
                    )}

                    {loja.contato?.email && (
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-full" style={{ backgroundColor: config.corPrimaria }}>
                          <Mail className="h-5 w-5" style={{ color: config.corTexto }} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Email</p>
                          <a
                            href={`mailto:${loja.contato.email}`}
                            className="font-medium hover:underline"
                            style={{ color: config.corPrimaria }}
                          >
                            {loja.contato.email}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {config.mostrarRedesSociais && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Redes Sociais</h3>
                      <div className="flex gap-3">
                        {loja.redesSociais?.instagram && (
                          <a
                            href={loja.redesSociais.instagram}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: config.corPrimaria }}
                          >
                            <Instagram className="h-5 w-5" style={{ color: config.corTexto }} />
                          </a>
                        )}
                        {loja.redesSociais?.facebook && (
                          <a
                            href={loja.redesSociais.facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: config.corPrimaria }}
                          >
                            <Facebook className="h-5 w-5" style={{ color: config.corTexto }} />
                          </a>
                        )}
                        {loja.redesSociais?.twitter && (
                          <a
                            href={loja.redesSociais.twitter}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: config.corPrimaria }}
                          >
                            <Twitter className="h-5 w-5" style={{ color: config.corTexto }} />
                          </a>
                        )}
                        {loja.redesSociais?.linkedin && (
                          <a
                            href={loja.redesSociais.linkedin}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: config.corPrimaria }}
                          >
                            <Linkedin className="h-5 w-5" style={{ color: config.corTexto }} />
                          </a>
                        )}
                        {loja.redesSociais?.youtube && (
                          <a
                            href={loja.redesSociais.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 rounded-full hover:opacity-80 transition-opacity"
                            style={{ backgroundColor: config.corPrimaria }}
                          >
                            <Youtube className="h-5 w-5" style={{ color: config.corTexto }} />
                          </a>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold mb-3">Envie uma mensagem</h3>
                    <form className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="nome">Nome</Label>
                          <Input id="nome" placeholder="Seu nome" />
                        </div>
                        <div>
                          <Label htmlFor="email">Email</Label>
                          <Input id="email" type="email" placeholder="seu@email.com" />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="assunto">Assunto</Label>
                        <Input id="assunto" placeholder="Assunto da mensagem" />
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
                        Enviar Mensagem
                      </Button>
                    </form>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Endereço */}
          {config.mostrarEndereco && (
            <TabsContent value="endereco" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Localização</CardTitle>
                  <CardDescription>Onde nos encontrar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {loja.endereco ? (
                    <div className="space-y-6">
                      <div className="flex items-start gap-3">
                        <div className="p-3 rounded-full mt-1" style={{ backgroundColor: config.corPrimaria }}>
                          <MapPin className="h-5 w-5" style={{ color: config.corTexto }} />
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Endereço</p>
                          <p className="font-medium">
                            {loja.endereco.logradouro || loja.endereco.rua || ""}
                            {loja.endereco.numero ? `, ${loja.endereco.numero}` : ""}
                            {loja.endereco.complemento ? ` - ${loja.endereco.complemento}` : ""}
                          </p>
                          <p className="text-gray-600">
                            {loja.endereco.bairro || ""}
                            {loja.endereco.bairro && loja.endereco.cidade ? ", " : ""}
                            {loja.endereco.cidade || ""}
                            {loja.endereco.cidade && loja.endereco.estado ? " - " : ""}
                            {loja.endereco.estado || ""}
                          </p>
                          {loja.endereco.cep && <p className="text-gray-500 text-sm">CEP: {loja.endereco.cep}</p>}
                        </div>
                      </div>

                      {/* Mapa (placeholder) */}
                      <div className="w-full h-80 bg-gray-200 rounded-lg overflow-hidden relative">
                        {loja.endereco.latitude && loja.endereco.longitude ? (
                          <iframe
                            title="Mapa da localização"
                            width="100%"
                            height="100%"
                            frameBorder="0"
                            scrolling="no"
                            marginHeight={0}
                            marginWidth={0}
                            src={`https://maps.google.com/maps?q=${loja.endereco.latitude},${loja.endereco.longitude}&z=15&output=embed`}
                          ></iframe>
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-gray-500">Mapa não disponível</p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Endereço não cadastrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* Horários */}
          {config.mostrarHorarios && (
            <TabsContent value="horarios" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Horário de Funcionamento</CardTitle>
                  <CardDescription>Confira nossos horários de atendimento</CardDescription>
                </CardHeader>
                <CardContent>
                  {loja.horarioFuncionamento ? (
                    <div className="space-y-2">
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("segunda") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Segunda-feira</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.segunda)}</span>
                      </div>
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("terca") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Terça-feira</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.terca)}</span>
                      </div>
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("quarta") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Quarta-feira</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.quarta)}</span>
                      </div>
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("quinta") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Quinta-feira</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.quinta)}</span>
                      </div>
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("sexta") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Sexta-feira</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.sexta)}</span>
                      </div>
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("sabado") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Sábado</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.sabado)}</span>
                      </div>
                      <div
                        className={`flex justify-between p-3 rounded-lg ${isDiaAtual("domingo") ? "bg-gray-100" : ""}`}
                      >
                        <span className="font-medium">Domingo</span>
                        <span>{formatarHorario(loja.horarioFuncionamento.domingo)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">Horários não cadastrados</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Widget de Newsletter */}
      {config.widgetNewsletter?.ativo && (
        <div
          className="py-8 px-4"
          style={{
            backgroundColor: config.widgetNewsletter.corFundo,
            color: config.widgetNewsletter.corTexto,
          }}
        >
          <div className="container mx-auto max-w-lg text-center">
            <h3 className="text-xl font-bold mb-2">{config.widgetNewsletter.titulo}</h3>
            <p className="mb-4">{config.widgetNewsletter.descricao}</p>
            {newsletterEnviado ? (
              <div className="bg-white bg-opacity-20 p-4 rounded-lg">
                <p className="font-medium">Obrigado por se inscrever!</p>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2">
                <Input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Seu melhor email"
                  required
                  className="flex-1 bg-white text-gray-900"
                />
                <Button
                  type="submit"
                  style={{
                    backgroundColor: config.corPrimaria,
                    color: config.corTexto,
                  }}
                >
                  Assinar
                </Button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Rodapé */}
      <footer className="py-6 px-4 bg-gray-100">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-600">
                &copy; {new Date().getFullYear()} {loja.nome}. Todos os direitos reservados.
              </p>
            </div>
            <div className="flex gap-4">
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Termos de Uso
              </a>
              <a href="#" className="text-sm text-gray-600 hover:underline">
                Política de Privacidade
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Botão de voltar ao topo */}
      {showScrollTop && (
        <Button
          variant="outline"
          size="icon"
          className="fixed bottom-4 right-4 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ChevronLeft className="h-4 w-4 rotate-90" />
        </Button>
      )}

      {/* Botão de WhatsApp flutuante */}
      {config.mostrarWhatsapp && loja.contato?.whatsapp && (
        <a
          href={`https://wa.me/${loja.contato.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-4 left-4 p-3 rounded-full shadow-lg bg-[#25D366] text-white hover:bg-[#20ba5a] transition-colors"
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
          >
            <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
            <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
            <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
            <path d="M9.5 13.5a.5.5 0 0 0 .5.5h4a.5.5 0 0 0 0-1h-4a.5.5 0 0 0-.5.5Z" />
          </svg>
        </a>
      )}
    </div>
  )
}