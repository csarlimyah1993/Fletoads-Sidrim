"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { LojaPerfilContent } from "@/components/perfil/loja-perfil-content"
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
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const previousSession = useRef(session)

  useEffect(() => {
    // Check if the session data has changed
    if (JSON.stringify(session) !== JSON.stringify(previousSession.current)) {
      console.log("Session data changed, refreshing session...")
      refreshSession()
      previousSession.current = session
    }
  }, [session, refreshSession])

  useEffect(() => {
    if (!session?.user?.id) return

    const fetchData = async () => {
      setIsLoading(true)
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
        setIsLoading(false)
      }
    }

    fetchData()
  }, [session])

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
      limites={limites === null ? undefined : limites}
    />
  )
}
