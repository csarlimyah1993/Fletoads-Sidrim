"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LojaPerfilContent } from "./loja-perfil-content"
import { useSessionRefresh } from "@/lib/refresh-session"

export function PerfilDaLojaClient() {
  const { data: session } = useSession()
  const { refreshSession } = useSessionRefresh()
  const router = useRouter()
  const [loja, setLoja] = useState<any>(null)
  const [vitrine, setVitrine] = useState<any>(null)
  const [produtos, setProdutos] = useState<any[]>([])
  const [plano, setPlano] = useState<any>(null)
  const [limites, setLimites] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Atualizar a sessão ao montar o componente
    refreshSession()
  }, [refreshSession])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchData = async () => {
      setLoading(true)
      setError(null)

      try {
        // Buscar dados da loja
        const lojaResponse = await fetch(`/api/loja?userId=${session.user.id}`)
        if (!lojaResponse.ok) {
          throw new Error("Falha ao carregar dados da loja")
        }
        const lojaData = await lojaResponse.json()
        setLoja(lojaData.loja || null)

        // Se tiver loja, buscar produtos e vitrine
        if (lojaData.loja?._id) {
          const lojaId = lojaData.loja._id

          // Buscar produtos
          const produtosResponse = await fetch(`/api/produtos?lojaId=${lojaId}&limit=5`)
          if (produtosResponse.ok) {
            const produtosData = await produtosResponse.json()
            setProdutos(produtosData.produtos || [])
          }

          // Buscar configurações da vitrine
          const vitrineResponse = await fetch(`/api/loja/${lojaId}/vitrine/configuracoes`)
          if (vitrineResponse.ok) {
            const vitrineData = await vitrineResponse.json()
            setVitrine(vitrineData || null)
          }
        }

        // Buscar dados do plano
        const planoResponse = await fetch(`/api/usuarios/${session.user.id}/plano`)
        if (planoResponse.ok) {
          const planoData = await planoResponse.json()
          setPlano(planoData || null)
        }

        // Buscar limites de uso
        const limitesResponse = await fetch(`/api/usuarios/${session.user.id}/usage`)
        if (limitesResponse.ok) {
          const limitesData = await limitesResponse.json()
          setLimites(limitesData || null)
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [session])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-48 w-full bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
          <div className="h-64 bg-gray-200 dark:bg-gray-800 animate-pulse rounded-lg" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">Erro ao carregar dados</h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  // Processar os limites para evitar passar objetos diretamente como children
  const processedLimites = limites
    ? {
        panfletos: {
          current: limites.panfletos?.current || 0,
          limit: limites.panfletos?.limit || 0,
          percentage: limites.panfletos?.percentage || 0,
          hasReached: limites.panfletos?.hasReached || false,
        },
        produtos: {
          current: limites.produtos?.current || 0,
          limit: limites.produtos?.limit || 0,
          percentage: limites.produtos?.percentage || 0,
          hasReached: limites.produtos?.hasReached || false,
        },
        integracoes: {
          current: limites.integracoes?.current || 0,
          limit: limites.integracoes?.limit || 0,
          percentage: limites.integracoes?.percentage || 0,
          hasReached: limites.integracoes?.hasReached || false,
        },
      }
    : null

  return (
    <LojaPerfilContent
      loja={loja}
      vitrine={vitrine}
      produtos={Array.isArray(produtos) ? produtos : []}
      plano={plano}
      limites={processedLimites}
    />
  )
}
