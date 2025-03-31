"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ArrowUpRight } from "lucide-react"

interface PlanInfo {
  plano: string
  limites: {
    panfletos: number
    clientes: number
    campanhas: number
  }
  utilizacao: {
    panfletos: number
    clientes: number
    campanhas: number
  }
}

export function PlanUpgradeBanner() {
  const router = useRouter()
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchPlanInfo = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setPlanInfo(data)
        }
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlanInfo()
  }, [])

  if (isLoading) {
    return null
  }

  if (!planInfo) {
    return null
  }

  // Verificar se o usuário está próximo dos limites
  const isNearLimit = () => {
    if (!planInfo) return false

    const { limites, utilizacao } = planInfo

    // Se qualquer recurso estiver acima de 80% do limite
    return (
      (limites.panfletos > 0 && utilizacao.panfletos / limites.panfletos > 0.8) ||
      (limites.clientes > 0 && utilizacao.clientes / limites.clientes > 0.8) ||
      (limites.campanhas > 0 && utilizacao.campanhas / limites.campanhas > 0.8)
    )
  }

  // Se o usuário não estiver próximo dos limites, não exibir o banner
  if (!isNearLimit()) {
    return null
  }

  // Calcular porcentagens
  const calcularPorcentagem = (usado: number, limite: number) => {
    if (limite <= 0) return 0 // Ilimitado
    return Math.min(Math.round((usado / limite) * 100), 100)
  }

  const porcentagemPanfletos = calcularPorcentagem(planInfo.utilizacao.panfletos, planInfo.limites.panfletos)

  const porcentagemClientes = calcularPorcentagem(planInfo.utilizacao.clientes, planInfo.limites.clientes)

  const porcentagemCampanhas = calcularPorcentagem(planInfo.utilizacao.campanhas, planInfo.limites.campanhas)

  return (
    <Card className="mb-6 border-amber-200 bg-amber-50 dark:bg-amber-950 dark:border-amber-800">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h3 className="font-medium">Você está chegando ao limite do seu plano {planInfo.plano}</h3>
            <p className="text-sm text-muted-foreground">
              Faça um upgrade para continuar aproveitando todos os recursos do FletoAds.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Panfletos</span>
                  <span>
                    {planInfo.utilizacao.panfletos}/{planInfo.limites.panfletos > 0 ? planInfo.limites.panfletos : "∞"}
                  </span>
                </div>
                <Progress value={porcentagemPanfletos} className="h-2" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Clientes</span>
                  <span>
                    {planInfo.utilizacao.clientes}/{planInfo.limites.clientes > 0 ? planInfo.limites.clientes : "∞"}
                  </span>
                </div>
                <Progress value={porcentagemClientes} className="h-2" />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Campanhas</span>
                  <span>
                    {planInfo.utilizacao.campanhas}/{planInfo.limites.campanhas > 0 ? planInfo.limites.campanhas : "∞"}
                  </span>
                </div>
                <Progress value={porcentagemCampanhas} className="h-2" />
              </div>
            </div>
          </div>

          <Button onClick={() => router.push("/planos")} className="shrink-0">
            <span>Ver Planos</span>
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

