"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, Crown, ShoppingBag, FileText, Zap, Image, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { planos } from "@/lib/planos"

export function PlanoDashboardCard() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [planInfo, setPlanInfo] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/user/plan")

        if (!response.ok) {
          console.error("Erro na resposta da API:", response.status, response.statusText)

          // Usar plano gratuito como fallback
          setPlanInfo({
            planoId: "gratis",
            planoNome: "Grátis",
            isFreeTier: true,
            limitReached: false,
            uso: {
              produtos: { usado: 0, total: planos.gratis.vitrine },
              panfletos: { usado: 0, total: planos.gratis.panfletos },
              imagensPorProduto: planos.gratis.imagensPorProduto,
            },
            planoDetalhes: planos.gratis,
          })

          return
        }

        const data = await response.json()
        setPlanInfo(data)
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
        setError("Não foi possível carregar as informações do plano")

        // Definir plano padrão em caso de erro
        setPlanInfo({
          planoId: "gratis",
          planoNome: "Grátis",
          isFreeTier: true,
          uso: {
            produtos: { usado: 0, total: planos.gratis.vitrine },
            panfletos: { usado: 0, total: planos.gratis.panfletos },
            imagensPorProduto: planos.gratis.imagensPorProduto,
          },
          planoDetalhes: planos.gratis,
        })
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

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Crown className="h-5 w-5 mr-2 text-yellow-500" />
            Seu Plano
          </CardTitle>
          {planInfo.planoDetalhes?.popular && (
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
          <h3 className="text-lg font-medium">{planInfo.planoNome}</h3>
          <p className="text-sm text-muted-foreground">
            {planInfo.isFreeTier
              ? "Plano gratuito com recursos limitados"
              : `R$ ${planInfo.planoDetalhes?.preco.toFixed(2).replace(".", ",")} por mês`}
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <ShoppingBag className="h-4 w-4 mr-1" /> Produtos na Vitrine
              </span>
              <span>
                {planInfo.uso.produtos.usado} / {planInfo.uso.produtos.total}
              </span>
            </div>
            <Progress
              value={(planInfo.uso.produtos.usado / planInfo.uso.produtos.total) * 100}
              className={planInfo.limitReached?.produtos ? "bg-red-200" : ""}
            />
            {planInfo.limitReached?.produtos && <p className="text-xs text-red-500 mt-1">Limite atingido</p>}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <FileText className="h-4 w-4 mr-1" /> Panfletos Digitais
              </span>
              <span>
                {planInfo.uso.panfletos.usado} / {planInfo.uso.panfletos.total || "0"}
              </span>
            </div>
            <Progress
              value={
                planInfo.uso.panfletos.total ? (planInfo.uso.panfletos.usado / planInfo.uso.panfletos.total) * 100 : 0
              }
              className={planInfo.limitReached?.panfletos ? "bg-red-200" : ""}
            />
            {planInfo.uso.panfletos.total === 0 && (
              <p className="text-xs text-muted-foreground mt-1">Não disponível no plano atual</p>
            )}
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="flex items-center">
                <Image className="h-4 w-4 mr-1" /> Imagens por Produto
              </span>
              <span>{planInfo.uso.imagensPorProduto}</span>
            </div>
          </div>

          {planInfo.planoDetalhes?.whatsapp > 0 && (
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="flex items-center">
                  <Zap className="h-4 w-4 mr-1" /> WhatsApp Integrado
                </span>
                <span>
                  {planInfo.planoDetalhes.whatsapp} conta{planInfo.planoDetalhes.whatsapp > 1 ? "s" : ""}
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

