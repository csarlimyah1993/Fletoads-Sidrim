"use client"

import type React from "react"

import { Users, BadgeCheck, Search, ShoppingBag, Menu, X } from "lucide-react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AffiliateModal } from "./affiliate-modal"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineHeaderProps {
  loja: Loja
  config?: VitrineConfig
  searchTerm?: string
  setSearchTerm?: (term: string) => void
  favoritos?: string[]
  isDarkMode?: boolean
  setIsDarkMode?: (isDark: boolean) => void
  isOwner?: boolean
}

export function VitrineHeader({
  loja,
  isOwner = false,
  config,
  searchTerm = "",
  setSearchTerm,
  favoritos = [],
  isDarkMode = false,
  setIsDarkMode,
}: VitrineHeaderProps) {
  const { data: session } = useSession()
  const [showAffiliateModal, setShowAffiliateModal] = useState(false)
  const [isAffiliated, setIsAffiliated] = useState(false)
  const [localSearchTerm, setLocalSearchTerm] = useState(searchTerm)
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (session?.user?.id && loja?._id) {
      // Verificar se o usuário já é afiliado
      const checkAffiliation = async () => {
        try {
          const response = await fetch(`/api/affiliates/check?vitrineId=${loja._id}`)
          const data = await response.json()
          setIsAffiliated(data.isAffiliated)
        } catch (error) {
          console.error("Erro ao verificar afiliação:", error)
        }
      }

      checkAffiliation()
    }
  }, [session, loja])

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY
      if (offset > 50) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => {
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar a lógica de busca
    if (localSearchTerm.trim()) {
      if (setSearchTerm) {
        setSearchTerm(localSearchTerm)
      } else {
        // Scroll to products section
        const productsSection = document.getElementById("produtos")
        if (productsSection) {
          productsSection.scrollIntoView({ behavior: "smooth" })
        }
      }
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalSearchTerm(value)
    if (setSearchTerm) {
      setSearchTerm(value)
    }
  }

  const handleToggleDarkMode = () => {
    if (setIsDarkMode) {
      setIsDarkMode(!isDarkMode)
    }
  }

  const headerBgColor = config?.corPrimaria || "#3b82f6"
  const headerTextColor = config?.corTexto || "#ffffff"

  return (
    <motion.header
      className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? "py-2 shadow-md" : "py-4"}`}
      style={{
        backgroundColor: scrolled ? headerBgColor : "rgba(255, 255, 255, 0.9)",
        backdropFilter: scrolled ? "none" : "blur(10px)",
        color: scrolled ? headerTextColor : "inherit",
      }}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 15 }}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            {loja.logo ? (
              <motion.img
                src={loja.logo || "/placeholder.svg"}
                alt={`Logo ${loja.nome}`}
                className={`w-10 h-10 rounded-full object-cover border ${scrolled ? "border-white/20" : "border-gray-200"}`}
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              />
            ) : (
              <motion.div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  scrolled ? "bg-white/20 text-white" : "bg-gray-200 text-gray-500"
                }`}
                whileHover={{ rotate: 10 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
              >
                <span className="font-medium">{loja.nome?.charAt(0) || "L"}</span>
              </motion.div>
            )}
            <motion.h1
              className={`text-lg font-semibold ${scrolled ? "text-white" : "text-gray-900 dark:text-white"}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              {loja.nome}
            </motion.h1>
          </motion.div>

          <div className="flex-1 mx-4 max-w-md hidden md:block">
            <motion.form
              onSubmit={handleSearch}
              className="relative"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Input
                type="search"
                placeholder="Buscar produtos..."
                className={`w-full pl-10 ${
                  scrolled
                    ? "bg-white/20 border-white/10 placeholder-white/70 text-white"
                    : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                }`}
                value={localSearchTerm}
                onChange={handleSearchChange}
              />
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  scrolled ? "text-white/70" : "text-gray-400"
                }`}
              />
            </motion.form>
          </div>

          {/* Desktop Navigation */}
          <motion.div
            className="hidden md:flex items-center gap-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            {/* Botão de tema escuro/claro */}
            {setIsDarkMode && (
              <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant={scrolled ? "outline" : "ghost"}
                  size="icon"
                  onClick={handleToggleDarkMode}
                  title={isDarkMode ? "Modo claro" : "Modo escuro"}
                  className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                >
                  {isDarkMode ? (
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
                      className="h-5 w-5"
                    >
                      <circle cx="12" cy="12" r="5"></circle>
                      <line x1="12" y1="1" x2="12" y2="3"></line>
                      <line x1="12" y1="21" x2="12" y2="23"></line>
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                      <line x1="1" y1="12" x2="3" y2="12"></line>
                      <line x1="21" y1="12" x2="23" y2="12"></line>
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                  ) : (
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
                      className="h-5 w-5"
                    >
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                  )}
                </Button>
              </motion.div>
            )}

            {/* Botão de carrinho */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant={scrolled ? "outline" : "ghost"}
                size="icon"
                className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                onClick={() => {
                  // Implement cart functionality
                }}
              >
                <ShoppingBag className="h-5 w-5" />
              </Button>
            </motion.div>

            {/* Botão de afiliação */}
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              {session ? (
                isOwner ? (
                  <Button
                    variant={scrolled ? "outline" : "ghost"}
                    size="icon"
                    disabled
                    title="Você é o dono desta loja"
                    className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                ) : isAffiliated ? (
                  <Button
                    variant={scrolled ? "outline" : "ghost"}
                    size="icon"
                    className={`text-primary ${scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}`}
                    title="Você já é afiliado"
                  >
                    <BadgeCheck className="h-5 w-5" />
                  </Button>
                ) : (
                  <Button
                    variant={scrolled ? "outline" : "ghost"}
                    size="icon"
                    onClick={() => setShowAffiliateModal(true)}
                    title="Afiliar-se a esta loja"
                    className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                  >
                    <Users className="h-5 w-5" />
                  </Button>
                )
              ) : (
                <Button
                  variant={scrolled ? "outline" : "ghost"}
                  size="icon"
                  onClick={() => signIn()}
                  title="Faça login para se afiliar"
                  className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                >
                  <Users className="h-5 w-5" />
                </Button>
              )}
            </motion.div>
          </motion.div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant={scrolled ? "outline" : "ghost"}
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 overflow-hidden"
            >
              <div className="flex flex-col gap-3 py-2">
                <form onSubmit={handleSearch} className="relative">
                  <Input
                    type="search"
                    placeholder="Buscar produtos..."
                    className={`w-full pl-10 ${
                      scrolled
                        ? "bg-white/20 border-white/10 placeholder-white/70 text-white"
                        : "bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                    }`}
                    value={localSearchTerm}
                    onChange={handleSearchChange}
                  />
                  <Search
                    className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                      scrolled ? "text-white/70" : "text-gray-400"
                    }`}
                  />
                </form>

                <div className="flex gap-2">
                  {setIsDarkMode && (
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      className={`flex-1 ${scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}`}
                      onClick={handleToggleDarkMode}
                    >
                      {isDarkMode ? "Modo Claro" : "Modo Escuro"}
                    </Button>
                  )}

                  <Button
                    variant={scrolled ? "outline" : "ghost"}
                    className={`flex-1 ${scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}`}
                    onClick={() => {
                      // Implement cart functionality
                    }}
                  >
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Carrinho
                  </Button>
                </div>

                {session ? (
                  isOwner ? (
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      disabled
                      className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Você é o dono desta loja
                    </Button>
                  ) : isAffiliated ? (
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      className={`text-primary ${scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}`}
                    >
                      <BadgeCheck className="h-5 w-5 mr-2" />
                      Você já é afiliado
                    </Button>
                  ) : (
                    <Button
                      variant={scrolled ? "outline" : "ghost"}
                      onClick={() => setShowAffiliateModal(true)}
                      className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Afiliar-se a esta loja
                    </Button>
                  )
                ) : (
                  <Button
                    variant={scrolled ? "outline" : "ghost"}
                    onClick={() => signIn()}
                    className={scrolled ? "border-white/20 text-white hover:bg-white/10" : ""}
                  >
                    <Users className="h-5 w-5 mr-2" />
                    Faça login para se afiliar
                  </Button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Barra de pesquisa móvel */}
        <div className="mt-2 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Input
              type="search"
              placeholder="Buscar produtos..."
              className="w-full pl-10"
              value={localSearchTerm}
              onChange={handleSearchChange}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </form>
        </div>

        {showAffiliateModal && (
          <AffiliateModal
            vitrineId={loja._id}
            vitrineName={loja.nome}
            onClose={() => setShowAffiliateModal(false)}
            onSuccess={() => {
              setIsAffiliated(true)
              setShowAffiliateModal(false)
            }}
          />
        )}
      </div>
    </motion.header>
  )
}
