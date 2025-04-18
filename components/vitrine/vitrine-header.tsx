"use client"

import type React from "react"

import { Users, BadgeCheck, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Implementar a lógica de busca
    if (localSearchTerm.trim()) {
      if (setSearchTerm) {
        setSearchTerm(localSearchTerm)
      } else {
        window.location.href = `/vitrines/${loja._id}/produtos?search=${encodeURIComponent(localSearchTerm)}`
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

  // Renderizar o componente original com o botão de afiliação adicionado
  return (
    <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 sticky top-0 z-10 transition-colors duration-200">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {loja.logo ? (
              <img
                src={loja.logo || "/placeholder.svg"}
                alt={`Logo ${loja.nome}`}
                className="w-10 h-10 rounded-full object-cover border dark:border-gray-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <span className="text-gray-500 dark:text-gray-400 font-medium">{loja.nome?.charAt(0) || "L"}</span>
              </div>
            )}
            <h1 className="text-lg font-semibold dark:text-white">{loja.nome}</h1>
          </div>

          <div className="flex-1 mx-4 max-w-md hidden md:block">
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

          <div className="flex items-center gap-2">
            {/* Botão de tema escuro/claro */}
            {setIsDarkMode && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleDarkMode}
                title={isDarkMode ? "Modo claro" : "Modo escuro"}
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
            )}

            {/* Botão de afiliação */}
            {session ? (
              isOwner ? (
                <Button variant="ghost" size="icon" disabled title="Você é o dono desta loja">
                  <Users className="h-5 w-5" />
                </Button>
              ) : isAffiliated ? (
                <Button variant="ghost" size="icon" className="text-primary" title="Você já é afiliado">
                  <BadgeCheck className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAffiliateModal(true)}
                  title="Afiliar-se a esta loja"
                >
                  <Users className="h-5 w-5" />
                </Button>
              )
            ) : (
              <Button variant="ghost" size="icon" onClick={() => signIn()} title="Faça login para se afiliar">
                <Users className="h-5 w-5" />
              </Button>
            )}
          </div>
        </div>

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
    </header>
  )
}
