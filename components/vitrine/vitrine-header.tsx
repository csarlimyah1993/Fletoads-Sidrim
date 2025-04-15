"use client"

import type React from "react"

import { Users, BadgeCheck, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { signIn, useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AffiliateModal } from "./affiliate-modal"
import type { Loja } from "@/types/loja"

interface VitrineHeaderProps {
  loja: Loja
  isOwner: boolean
}

export default function VitrineHeader({ loja, isOwner }: VitrineHeaderProps) {
  const { data: session } = useSession()
  const [showAffiliateModal, setShowAffiliateModal] = useState(false)
  const [isAffiliated, setIsAffiliated] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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
    if (searchTerm.trim()) {
      window.location.href = `/vitrines/${loja._id}/produtos?search=${encodeURIComponent(searchTerm)}`
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </form>
          </div>

          <div className="flex items-center gap-2">
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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

export { VitrineHeader }
