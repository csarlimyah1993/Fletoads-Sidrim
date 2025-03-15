"use client"

import type React from "react"
import { Sidebar } from "@/components/sidebar"
import { UserNav } from "@/components/user-nav"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const [loja, setLoja] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Buscar dados da loja
  useEffect(() => {
    const fetchLoja = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/loja/perfil")

        if (response.ok) {
          const data = await response.json()
          setLoja(data)
        }
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchLoja()
    } else if (status !== "loading") {
      setIsLoading(false)
    }
  }, [session, status])

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Carregando...</span>
              </div>
            ) : (
              <h1 className="text-xl font-bold">
                {loja ? loja.nome : session?.user?.nome ? `${session.user.nome} - FletoAds` : "FletoAds"}
              </h1>
            )}
            <UserNav />
          </div>
        </header>
        <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </div>
  )
}

