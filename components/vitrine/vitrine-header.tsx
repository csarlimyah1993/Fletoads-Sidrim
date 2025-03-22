"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ShoppingBag, Menu, X, Facebook, Instagram, Twitter, Linkedin, Youtube, Search, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "./theme-toggle"
import type { Loja } from "@/types/loja"

interface VitrineHeaderProps {
  loja: Loja
  isOwner?: boolean
}

const fadeInSlideUpKeyframes = `
@keyframes fadeInSlideUp {
  from {
    opacity: 0.7;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`

export function VitrineHeader({ loja, isOwner = false }: VitrineHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [scrollProgress, setScrollProgress] = useState({
    isScrolled: false,
    scrollY: 0,
    opacity: 1,
    scale: 1,
  })
  const [activeCategory, setActiveCategory] = useState<string | null>(null)

  // Verificar se o plano é pago e se há um banner
  const isPlanoPago = loja.plano?.id !== "gratis"
  const hasBanner = !!loja.banner && loja.banner.trim() !== ""

  console.log("Banner URL:", loja.banner)
  console.log("Is plano pago:", isPlanoPago)
  console.log("Has banner:", hasBanner)

  // Garantir que o componente só renderize completamente após a montagem no cliente
  useEffect(() => {
    setMounted(true)

    // Adicionar efeito de scroll
    const handleScroll = () => {
      const scrollY = window.scrollY
      const threshold = 50
      const maxScroll = 200

      // Calcular valores de animação baseados no progresso do scroll
      const isScrolled = scrollY > threshold
      const opacity = scrollY < maxScroll ? 1 - (scrollY / maxScroll) * 0.4 : 0.6
      const scale = scrollY < maxScroll ? 1 - (scrollY / maxScroll) * 0.1 : 0.9

      setScrollProgress({
        isScrolled,
        scrollY,
        opacity,
        scale,
      })
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    // Adicionar keyframes ao documento
    if (typeof document !== "undefined") {
      const style = document.createElement("style")
      style.innerHTML = `
      ${fadeInSlideUpKeyframes}
      
      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 0.98;
        }
      }
      
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
        }
        to {
          transform: translateX(0);
        }
      }
    `
      document.head.appendChild(style)

      return () => {
        document.head.removeChild(style)
      }
    }
  }, [])

  // Definir cores com base no plano
  const corPrimaria = loja.cores?.primaria || "#4f46e5"
  const corSecundaria = loja.cores?.secundaria || "#f9fafb"
  const corTexto = loja.cores?.texto || "#111827"

  // Função para lidar com erros de carregamento de imagem
  const handleImageError = () => {
    console.error("Erro ao carregar imagem do banner:", loja.banner)
    setImageError(true)
  }

  // Categorias da loja (simuladas para o exemplo)
  const categorias = [
    "Promoções",
    "Descontos",
    "Entrega Rápida",
    "Frete Grátis",
    "Produtos Orgânicos",
    "Artesanal",
    "Importados",
    "Exclusivo",
    "Novidades",
    "Outlet",
  ]

  // Redes sociais
  const redesSociais = [
    { icon: Facebook, url: loja.redesSociais?.facebook || "#" },
    { icon: Instagram, url: loja.redesSociais?.instagram || "#" },
    { icon: Twitter, url: loja.redesSociais?.twitter || "#" },
    { icon: Linkedin, url: loja.redesSociais?.linkedin || "#" },
    { icon: Youtube, url: loja.redesSociais?.youtube || "#" },
  ]

  // Função para lidar com o clique na categoria
  const handleCategoryClick = (categoria: string) => {
    setActiveCategory(activeCategory === categoria ? null : categoria)
  }

  return (
    <>
      {/* Barra superior fixa */}
      <div
        className={`w-full bg-gray-900 text-white z-50 ${scrollProgress.isScrolled ? "fixed top-0 shadow-md" : ""}`}
        style={{
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: scrollProgress.isScrolled ? `translateY(0)` : "translateY(0)",
          opacity: scrollProgress.isScrolled ? 1 - ((scrollProgress.scrollY - 50) / 150) * 0.2 : 1,
        }}
      >
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {scrollProgress.isScrolled && (
              <Link href={`/vitrine/${loja._id}`} className="flex items-center gap-2">
                {loja.logo ? (
                  <div className="relative h-8 w-8 overflow-hidden rounded-full">
                    <img src={loja.logo || "/placeholder.svg"} alt={loja.nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-full text-white text-xs font-bold"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    {loja.nome.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <span className="font-medium">{loja.nome}</span>
              </Link>
            )}

            <div className="hidden md:flex gap-4">
              {redesSociais.map((rede, index) => (
                <a
                  key={index}
                  href={rede.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  <rede.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />

            <div className="hidden md:flex items-center gap-3">
              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Search className="h-4 w-4 mr-1" />
                <span className="text-sm">Buscar</span>
              </Button>

              <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                <Heart className="h-4 w-4 mr-1" />
                <span className="text-sm">Favoritos</span>
              </Button>

              {isPlanoPago && (
                <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white">
                  <ShoppingBag className="h-4 w-4 mr-1" />
                  <span className="text-sm">Carrinho (0)</span>
                </Button>
              )}
            </div>

            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="text-white md:hidden">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Banner principal com overlay */}
      {mounted && hasBanner && !imageError && (
        <div className="relative">
          <div
            className="w-full h-[50vh] md:h-[60vh] relative overflow-hidden"
            style={{
              transition: "transform 0.5s ease-out",
              transform: `scale(${1 + scrollProgress.scrollY * 0.0005})`,
            }}
          >
            <img
              src={loja.banner || "/placeholder.svg"}
              alt={`Banner de ${loja.nome}`}
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/30 to-black/70"></div>
          </div>

          {/* Conteúdo sobreposto ao banner */}
          <div
            className="absolute inset-0 flex flex-col justify-center items-center text-center text-white p-4"
            style={{
              transition: "transform 0.5s ease-out, opacity 0.5s ease-out",
              transform: `translateY(${scrollProgress.scrollY * 0.2}px)`,
              opacity: scrollProgress.opacity,
            }}
          >
            <div className="mb-4">
              {loja.logo ? (
                <div className="relative h-24 w-24 mx-auto overflow-hidden rounded-full border-4 border-white shadow-lg">
                  <img src={loja.logo || "/placeholder.svg"} alt={loja.nome} className="w-full h-full object-cover" />
                </div>
              ) : (
                <div
                  className="flex h-24 w-24 mx-auto items-center justify-center rounded-full text-white text-3xl font-bold border-4 border-white shadow-lg"
                  style={{ backgroundColor: corPrimaria }}
                >
                  {loja.nome.substring(0, 2).toUpperCase()}
                </div>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold mb-2 drop-shadow-md">{loja.nome}</h1>

            {loja.descricao && <p className="max-w-2xl text-lg mb-6 text-gray-100 drop-shadow-md">{loja.descricao}</p>}

            <div className="flex flex-wrap justify-center gap-3 mt-4">
              <Link href={`/vitrine/${loja._id}/produtos`}>
                <Button size="lg" className="bg-white text-gray-900 hover:bg-gray-100">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Ver Produtos
                </Button>
              </Link>

              <Link href={`/vitrine/${loja._id}/contato`}>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/20">
                  Contato
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Navegação principal */}
      <div
        className="bg-white dark:bg-gray-900 shadow-md"
        style={{
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          opacity: scrollProgress.isScrolled ? 0.95 : 1,
          borderBottom: scrollProgress.isScrolled ? "1px solid rgba(229, 231, 235, 0.1)" : "none",
        }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            {/* Logo e nome (visível apenas quando não há banner ou em dispositivos pequenos) */}
            {(!hasBanner || imageError) && (
              <Link href={`/vitrine/${loja._id}`} className="flex items-center gap-3">
                {loja.logo ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <img src={loja.logo || "/placeholder.svg"} alt={loja.nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white text-xl font-bold"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    {loja.nome.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl font-bold dark:text-white">{loja.nome}</h1>
                  {loja.descricao && <p className="text-sm text-gray-600 dark:text-gray-400">{loja.descricao}</p>}
                </div>
              </Link>
            )}

            {/* Navegação de categorias */}
            <nav className="hidden lg:flex items-center space-x-6">
              {["Início", "Produtos", "Contato"].map((item, index) => (
                <Link
                  key={item}
                  href={`/vitrine/${loja._id}${item === "Início" ? "" : `/${item.toLowerCase()}`}`}
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-white font-medium relative group"
                  style={{
                    transition: "all 0.3s ease",
                  }}
                >
                  {item}
                  <span
                    className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"
                    style={{ backgroundColor: corPrimaria }}
                  ></span>
                </Link>
              ))}
            </nav>

            {/* Botões de ação em dispositivos pequenos */}
            <div className="lg:hidden flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                <Search className="h-5 w-5" />
              </Button>

              {isPlanoPago && (
                <Button variant="ghost" size="icon" className="text-gray-700 dark:text-gray-300">
                  <ShoppingBag className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de categorias com botões estilizados */}
      <div
        className="bg-gray-900 border-b border-gray-800 sticky top-0 z-40"
        style={{
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: scrollProgress.isScrolled ? "translateY(0)" : "translateY(0)",
          boxShadow: scrollProgress.isScrolled
            ? "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
            : "none",
        }}
      >
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-center overflow-x-auto">
            <div className="flex flex-wrap gap-2 justify-center">
              {categorias.map((categoria, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryClick(categoria)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-medium
                    ${
                      activeCategory === categoria
                        ? "bg-white text-gray-900 shadow-md"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white"
                    }
                  `}
                  style={{
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: activeCategory === categoria ? "scale(1.05)" : "scale(1)",
                    animation:
                      scrollProgress.isScrolled && index < 10
                        ? `fadeInSlideUp 0.5s ease forwards ${index * 0.05}s`
                        : "none",
                  }}
                >
                  {categoria}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu móvel */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-50 bg-gray-900 overflow-y-auto lg:hidden"
          style={{
            animation: "fadeIn 0.3s ease forwards",
            backdropFilter: "blur(5px)",
          }}
        >
          <div
            className="container mx-auto px-4 py-6"
            style={{
              animation: "slideInRight 0.3s ease forwards",
            }}
          >
            <div className="flex justify-between items-center mb-6">
              <Link href={`/vitrine/${loja._id}`} className="flex items-center gap-3">
                {loja.logo ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-full">
                    <img src={loja.logo || "/placeholder.svg"} alt={loja.nome} className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-full text-white text-xl font-bold"
                    style={{ backgroundColor: corPrimaria }}
                  >
                    {loja.nome.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <h1 className="text-xl font-bold text-white">{loja.nome}</h1>
              </Link>

              <Button variant="ghost" size="icon" onClick={() => setMenuOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-xs uppercase text-gray-400 tracking-wider">Navegação</h3>
                <div className="space-y-2">
                  <Link
                    href={`/vitrine/${loja._id}`}
                    className="block text-lg font-medium text-white hover:text-gray-300"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      animation: "fadeInSlideUp 0.5s ease forwards 0.1s",
                      opacity: 0,
                    }}
                  >
                    Início
                  </Link>
                  <Link
                    href={`/vitrine/${loja._id}/produtos`}
                    className="block text-lg font-medium text-white hover:text-gray-300"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      animation: "fadeInSlideUp 0.5s ease forwards 0.2s",
                      opacity: 0,
                    }}
                  >
                    Produtos
                  </Link>
                  <Link
                    href={`/vitrine/${loja._id}/contato`}
                    className="block text-lg font-medium text-white hover:text-gray-300"
                    onClick={() => setMenuOpen(false)}
                    style={{
                      animation: "fadeInSlideUp 0.5s ease forwards 0.3s",
                      opacity: 0,
                    }}
                  >
                    Contato
                  </Link>
                  {isPlanoPago && (
                    <Link
                      href={`/vitrine/${loja._id}/carrinho`}
                      className="block text-lg font-medium text-white hover:text-gray-300"
                      onClick={() => setMenuOpen(false)}
                      style={{
                        animation: "fadeInSlideUp 0.5s ease forwards 0.4s",
                        opacity: 0,
                      }}
                    >
                      Meu Carrinho
                    </Link>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase text-gray-400 tracking-wider">Categorias</h3>
                <div className="flex flex-wrap gap-2">
                  {categorias.map((categoria, index) => (
                    <button
                      key={index}
                      onClick={() => handleCategoryClick(categoria)}
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium transition-all duration-300
                        ${
                          activeCategory === categoria
                            ? "bg-white text-gray-900"
                            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        }
                      `}
                    >
                      {categoria}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs uppercase text-gray-400 tracking-wider">Redes Sociais</h3>
                <div className="flex gap-4">
                  {redesSociais.map((rede, index) => (
                    <a
                      key={index}
                      href={rede.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-300 hover:text-white"
                    >
                      <rede.icon className="h-6 w-6" />
                    </a>
                  ))}
                </div>
              </div>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}

