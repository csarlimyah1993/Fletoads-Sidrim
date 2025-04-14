"use client"

import { useRef, useState, useEffect } from "react"
import Image from "next/image"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Facebook, Instagram, Twitter, Sun, Moon, Heart } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineHeaderProps {
  loja: Loja
  config: VitrineConfig
  searchTerm: string
  setSearchTerm: (term: string) => void
  favoritos: string[]
  isDarkMode: boolean
  setIsDarkMode: (isDark: boolean) => void
}

export function VitrineHeader({
  loja,
  config,
  searchTerm,
  setSearchTerm,
  favoritos,
  isDarkMode,
  setIsDarkMode,
}: VitrineHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null)
  const [isHeaderFixed, setIsHeaderFixed] = useState(false)
  const [headerOpacity, setHeaderOpacity] = useState(1)
  const [lastScrollY, setLastScrollY] = useState(0)
  const [headerVisible, setHeaderVisible] = useState(true)

  // Efeito para detectar scroll
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Calcular opacidade do header baseado no scroll
      const maxScroll = 200
      const newOpacity = Math.max(1 - currentScrollY / maxScroll, 0.85)
      setHeaderOpacity(newOpacity)

      // Detectar direção do scroll para mostrar/esconder header
      if (currentScrollY > lastScrollY + 10) {
        setHeaderVisible(false)
      } else if (currentScrollY < lastScrollY - 10) {
        setHeaderVisible(true)
      }

      setLastScrollY(currentScrollY)

      if (headerRef.current) {
        const headerPos = headerRef.current.getBoundingClientRect().top
        setIsHeaderFixed(headerPos <= 0)
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [lastScrollY])

  // Determinar o estilo do header com base no layout
  const getHeaderStyle = () => {
    switch (config.layout) {
      case "moderno":
        return "py-4 border-none shadow-md"
      case "minimalista":
        return "py-3 border-none"
      case "magazine":
        return "py-4 border-b-2"
      default:
        return "py-2 border-b"
    }
  }

  return (
    <header
      ref={headerRef}
      className={cn(
        getHeaderStyle(),
        "transition-all duration-300 z-50 bg-background",
        isHeaderFixed ? "sticky top-0 shadow-sm backdrop-blur-md" : "",
      )}
      style={{
        opacity: headerVisible ? headerOpacity : 0,
        transform: headerVisible ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            {config.mostrarLogo && (loja.logo || config.logoPersonalizado) && (
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
            <h1 className="text-lg font-bold">{config.titulo || loja.nome}</h1>
          </div>

          {/* Ícones de Redes Sociais e Ações */}
          <div className="flex items-center gap-2">
            {/* Redes Sociais */}
            {config.mostrarRedesSociais && (
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
            )}

            {/* Busca */}
            {config.mostrarBusca && (
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
            )}

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
  )
}
