"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UsageCard } from "./usage-card"
import { FileText, ShoppingBag, Users, Link, Megaphone } from "lucide-react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

interface PlanoData {
  nome: string
  preco: string
  recursos: {
    [key: string]: any
  }
}

interface UsageData {
  panfletos: {
    limit: number | null
    current: number
    hasReached: boolean
    percentage: number
  }
  produtos: {
    limit: number | null
    current: number
    hasReached: boolean
    percentage: number
  }
  clientes: {
    limit: number | null
    current: number
    hasReached: boolean
    percentage: number
  }
  integracoes: {
    limit: number | null
    current: number
    hasReached: boolean
    percentage: number
  }
  campanhas: {
    limit: number | null
    current: number
    hasReached: boolean
    percentage: number
  }
}

export function PlanoInfoCard() {
  const [planoData, setPlanoData] = useState<PlanoData | null>(null)
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const { data: session } = useSession()

  useEffect(() => {
    const fetchPlanoData = async () => {
      if (!session?.user?.id) return

      try {
        // Buscar dados do plano
        const planoResponse = await fetch(`/api/usuarios/${session.user.id}/plano`)

        if (!planoResponse.ok) {
          throw new Error(`Erro ao buscar plano: ${planoResponse.status}`)
        }

        const planoData = await planoResponse.json()
        setPlanoData(planoData)

        // Buscar dados de uso
        const usageResponse = await fetch(`/api/usuarios/${session.user.id}/usage`)

        if (!usageResponse.ok) {
          throw new Error(`Erro ao buscar uso: ${usageResponse.status}`)
        }

        const usageData = await usageResponse.json()
        setUsageData(usageData)
      } catch (error) {
        console.error("Erro ao buscar dados do plano:", error)
        setError("Não foi possível carregar os dados do plano.")
      } finally {
        setLoading(false)
      }
    }

    fetchPlanoData()
  }, [session])

  const handleUpgrade = () => {
    router.push("/planos")
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="skeleton h-6 w-32"></CardTitle>
          <CardDescription className="skeleton h-4 w-24"></CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
            <div className="skeleton h-4 w-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => window.location.reload()}>Tentar novamente</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>{planoData?.nome || "Plano Gratuito"}</CardTitle>
            <CardDescription>{planoData?.preco || "Grátis"}</CardDescription>
          </div>
          <Button onClick={handleUpgrade}>Upgrade</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {usageData && (
            <>
              <UsageCard
                title="Panfletos"
                current={usageData.panfletos.current}
                limit={usageData.panfletos.limit}
                percentage={usageData.panfletos.percentage}
                icon={<FileText className="h-4 w-4" />}
              />
              <UsageCard
                title="Produtos"
                current={usageData.produtos.current}
                limit={usageData.produtos.limit}
                percentage={usageData.produtos.percentage}
                icon={<ShoppingBag className="h-4 w-4" />}
              />
              <UsageCard
                title="Clientes"
                current={usageData.clientes.current}
                limit={usageData.clientes.limit}
                percentage={usageData.clientes.percentage}
                icon={<Users className="h-4 w-4" />}
              />
              <UsageCard
                title="Integrações"
                current={usageData.integracoes.current}
                limit={usageData.integracoes.limit}
                percentage={usageData.integracoes.percentage}
                icon={<Link className="h-4 w-4" />}
              />
              <UsageCard
                title="Campanhas"
                current={usageData.campanhas.current}
                limit={usageData.campanhas.limit}
                percentage={usageData.campanhas.percentage}
                icon={<Megaphone className="h-4 w-4" />}
              />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
