"use client"

import type React from "react"

import { useState, useEffect, useRef, useCallback } from "react"
import { AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import type { Loja, Produto } from "@/types/loja"
import type { VitrineConfig, Avaliacao } from "@/types/vitrine"
import { VitrineHeader } from "./vitrine-header"
import { VitrineBanner } from "./vitrine-banner"
import VitrineProdutos from "./vitrine-produtos"
import { VitrineSobre } from "./vitrine-sobre"
import { VitrineContato } from "./vitrine-contato"
import { VitrineAvaliacoes } from "./vitrine-avaliacoes"
import { VitrineNewsletter } from "./vitrine-newsletter"
import { VitrineFooter } from "./vitrine-footer"
import { BackToTopButton } from "./back-to-up-button" // Fixed import path
import { VitrineMetricas } from "./vitrine-metricas"
import { VitrineValores } from "./vitrine-valores"
import { VitrinePanfletos } from "./vitrine-panfletos"
import { VitrinePromocao } from "./vitrine-promocao"

// Tipos
interface VitrinePublicaProps {
  id?: string
  slug?: string
  layout?: "padrao" | "moderno" | "minimalista" | "magazine"
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

  // Função para registrar visualização
  const registrarVisualizacao = useCallback(async (identifier: string) => {
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
  }, [])

  // Função para carregar avaliações
  const carregarAvaliacoes = useCallback(async (identifier: string) => {
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
  }, [])

  // Função para compartilhar produto
  const compartilharProduto = useCallback((produto: Produto) => {
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
  }, [])

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
  }, [id, slug, layout, registrarVisualizacao, carregarAvaliacoes])

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

  // Aplicar variáveis CSS para as cores personalizadas
  useEffect(() => {
    if (config) {
      document.documentElement.style.setProperty("--color-primary", config.corPrimaria || "#3b82f6")
      document.documentElement.style.setProperty("--color-secondary", config.corSecundaria || "#6366f1")
      document.documentElement.style.setProperty("--color-text", config.corTexto || "#ffffff")
      document.documentElement.style.setProperty("--color-background", config.corFundo || "#f8fafc")
      document.documentElement.style.setProperty("--color-accent", config.corDestaque || "#f59e0b")
    }

    // Adicionar estilo para prevenir scroll horizontal
    document.body.style.overflowX = "hidden"
    document.documentElement.style.overflowX = "hidden"

    return () => {
      // Limpar estilos ao desmontar
      document.body.style.overflowX = ""
      document.documentElement.style.overflowX = ""
    }
  }, [config])

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
      id: Date.now(),
      nome: feedbackName || "Anônimo",
      avatar: "/placeholder.svg?height=40&width=40",
      nota: feedbackRating,
      comentario: feedbackComment,
      data: new Date().toLocaleDateString("pt-BR"),
    }

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
      <div className="min-h-screen w-full flex items-center justify-center overflow-x-hidden">
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
      <div className="min-h-screen w-full flex items-center justify-center p-4 overflow-x-hidden">
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
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.reload()}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col overflow-x-hidden max-w-[100vw]">
      {/* Widget de Promoção */}
      {config.widgetPromocao?.ativo && <VitrinePromocao loja={loja} config={config} />}

      {/* Header */}
      <div ref={headerRef} className="w-full">
        <VitrineHeader
          loja={loja}
          config={config}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          favoritos={favoritos}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
        />
      </div>

      {/* Banner */}
      {config.mostrarBanner && <VitrineBanner loja={loja} config={config} />}

      {/* Conteúdo Principal */}
      <main className="flex-1 w-full bg-background overflow-x-hidden">
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

        {/* Seção de Panfletos - Sempre mostrar, sem condição */}
        <VitrinePanfletos loja={loja} config={config} />

        {/* Seção Sobre */}
        {config.secaoSobre?.ativo && <VitrineSobre loja={loja} config={config} />}

        {/* Seção de Valores */}
        {config.secaoValores?.ativo && <VitrineValores loja={loja} config={config} />}

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
        {config.widgetNewsletter?.ativo && <VitrineNewsletter loja={loja} config={config} />}

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
