"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Crown, ShoppingBag, FileText, Zap, Image, AlertCircle, Infinity } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

// Define default plan values if not available from API
const defaultPlanInfo = {
  planoId: "gratuito",
  planoNome: "Grátis",
  isFreeTier: true,
  limitReached: false,
  uso: {
    produtos: { usado: 0, total: 10 },
    panfletos: { usado: 0, total: 3 },
    imagensPorProduto: 1,
  },
  planoDetalhes: {
    preco: 0,
    popular: false,
    whatsapp: 0,
  },
}

export function PlanoDashboardCard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [planInfo, setPlanInfo] = useState<any>(defaultPlanInfo)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/user/plan")

        if (!response.ok) {
          console.error("Erro na resposta da API:", response.status, response.statusText)
          // Keep using the default plan info that was set in useState
          return
        }

        const data = await response.json()

        // Ensure the data has the expected structure
        if (!data.uso || !data.uso.produtos) {
          console.error("Dados do plano incompletos:", data)
          // Keep using the default plan info
          return
        }

        setPlanInfo(data)
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
        setError("Não foi possível carregar as informações do plano")
        // Default plan info is already set, no need to set it again
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlanInfo()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center min-h-[220px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  // Ensure we have the required data structure
  const uso = planInfo.uso || defaultPlanInfo.uso
  const produtos = uso.produtos || { usado: 0, total: 10 }
  const panfletos = uso.panfletos || { usado: 0, total: 0 }
  const imagensPorProduto = uso.imagensPorProduto || 1
  const planoDetalhes = planInfo.planoDetalhes || defaultPlanInfo.planoDetalhes

  // Helper function to render the usage count
  const renderUsageCount = (usado: number, total: any) => {
    if (total === "Ilimitado" || total === -1) {
      return (
        <span className="flex items-center">
          {usado} / <Infinity className="h-4 w-4 ml-1" />
        </span>
      )
    }
    return `${usado} / ${total}`
  }

  // Helper function to calculate progress percentage
  const calculateProgress = (usado: number, total: any) => {
    if (total === "Ilimitado" || total === -1) {
      return 100 // Full progress for unlimited
    }
    return (usado / Number(total)) * 100
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            Seu Plano
          </CardTitle>
          {planoDetalhes?.popular && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Popular
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="flex items-center text-amber-600 mb-2">
            <AlertCircle className="h-4 w-4 mr-2" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div>
          <h3 className="text-lg font-medium">{planInfo.planoNome || "Grátis"}</h3>
          <p className="text-sm text-muted-foreground">
            {planInfo.isFreeTier
              ? "Plano gratuito com recursos limitados"
              : `R$ ${(planoDetalhes?.preco || 0).toFixed(2).replace(".", ",")} por mês`}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1" /> Produtos na Vitrine
              </span>
              <span>{renderUsageCount(produtos.usado, produtos.total)}</span>
            </div>
            <Progress
              value={calculateProgress(produtos.usado, produtos.total)}
              className={planInfo.limitReached?.produtos ? "bg-red-200" : ""}
            />
            {planInfo.limitReached?.produtos && <p className="text-xs text-red-500 mt-1">Limite atingido</p>}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" /> Panfletos Digitais
              </span>
              <span>{renderUsageCount(panfletos.usado, panfletos.total)}</span>
            </div>
            <Progress
              value={calculateProgress(panfletos.usado, panfletos.total)}
              className={planInfo.limitReached?.panfletos ? "bg-red-200" : ""}
            />
            {panfletos.total === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Não disponível no plano atual</p>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <Image className="h-4 w-4 mr-1" /> Imagens por Produto
              </span>
              <span>{imagensPorProduto}</span>
            </div>
          </div>

          {planoDetalhes?.whatsapp > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" /> WhatsApp Integrado
                </span>
                <span>
                  {planoDetalhes.whatsapp} conta{planoDetalhes.whatsapp > 1 ? "s" : ""}
                </span>
              </div>
            </div>
          )}
        </div>

        <Button className="w-full" onClick={() => router.push("/dashboard/planos")}>
          {planInfo.isFreeTier ? "Fazer Upgrade" : "Gerenciar Plano"}
        </Button>
      </CardContent>
    </Card>
  )
}

