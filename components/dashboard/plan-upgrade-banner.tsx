"use client"

import { useState, useEffect } from "react"
import { AlertCircle, X } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface UserPlan {
  name: string
  isFreeTier: boolean
  daysRemaining?: number
  limitReached?: boolean
}

export function PlanUpgradeBanner() {
  const [plan, setPlan] = useState<UserPlan | null>(null)
  const [isVisible, setIsVisible] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/user/plan")

        if (!response.ok) {
          if (response.status === 404) {
            // Plano não encontrado, provavelmente usuário novo
            setIsVisible(false)
            return
          }
          throw new Error("Falha ao carregar informações do plano")
        }

        const data = await response.json()
        setPlan(data.plan)

        // Só mostrar o banner se for plano gratuito ou com limite atingido
        setIsVisible(
          data.plan.isFreeTier ||
            data.plan.limitReached ||
            (data.plan.daysRemaining !== undefined && data.plan.daysRemaining <= 7),
        )
      } catch (error) {
        console.error("Erro ao buscar plano do usuário:", error)
        setError("Não foi possível carregar as informações do seu plano")
        // Não mostrar o banner em caso de erro
        setIsVisible(false)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserPlan()
  }, [])

  if (isLoading || !isVisible || error) {
    return null
  }

  if (!plan) {
    return null
  }

  let message = ""
  let variant: "default" | "destructive" = "default"

  if (plan.limitReached) {
    message = "Você atingiu o limite do seu plano atual. Atualize para continuar usando todos os recursos."
    variant = "destructive"
  } else if (plan.isFreeTier) {
    message = "Você está usando o plano gratuito. Atualize para desbloquear mais recursos."
  } else if (plan.daysRemaining !== undefined && plan.daysRemaining <= 7) {
    message = `Seu plano ${plan.name} expira em ${plan.daysRemaining} dias. Renove agora para evitar interrupções.`
  }

  return (
    <Alert variant={variant} className="mb-4 relative">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Informações do Plano</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span>{message}</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/planos">Atualizar Plano</a>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsVisible(false)} aria-label="Fechar">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}

