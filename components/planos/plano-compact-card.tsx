"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, Shield, Star } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanCardCompactProps {
  className?: string
}

export function PlanCardCompact({ className }: PlanCardCompactProps) {
  const [mounted, setMounted] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("carregando")

  // Fetch user plan from API
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.plano || "gratuito")
        } else {
          // Fallback to session data if API fails
          const sessionResponse = await fetch("/api/auth/session")
          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json()
            setUserPlan(sessionData?.user?.plano || "gratuito")
          } else {
            setUserPlan("gratuito")
          }
        }
      } catch (error) {
        console.error("Erro ao buscar plano do usuário:", error)
        setUserPlan("gratuito")
      }
    }

    fetchUserPlan()
    setMounted(true)
  }, [])

  // Format plan name to capitalize first letter
  const formattedPlan = userPlan.charAt(0).toUpperCase() + userPlan.slice(1).toLowerCase()

  // Determine plan configuration based on plan type
  const planConfig = getPlanConfig(userPlan.toLowerCase())

  if (!mounted || userPlan === "carregando") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="p-4">
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {planConfig.icon}
            <div>
              <div className="flex items-center gap-2">
                <h3 className={cn("font-medium", planConfig.titleGradient)}>Status do Plano: {formattedPlan}</h3>
                <Badge className={cn("px-2 py-0.5 text-xs", planConfig.badgeGradient)}>
                  <Star className="h-3 w-3 mr-1 fill-current" />
                  ATIVO
                </Badge>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {userPlan.toLowerCase() === "gratuito"
                  ? "Faça upgrade para o plano Premium para desbloquear todos os recursos."
                  : "Você tem acesso a todos os recursos premium da vitrine."}
              </p>
            </div>
          </div>
          {userPlan.toLowerCase() === "gratuito" && (
            <Button
              size="sm"
              className={cn(planConfig.buttonGradient)}
              onClick={() => (window.location.href = "/planos")}
            >
              Upgrade
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get plan configuration based on plan type
function getPlanConfig(planType: string) {
  // Default configuration (Gratuito)
  const defaultConfig = {
    titleGradient: "text-gray-800 dark:text-gray-200",
    badgeGradient: "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0",
    buttonGradient:
      "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white border-0",
    icon: <Shield className="h-6 w-6 text-gray-500" />,
  }

  // Premium plan configuration
  if (planType.includes("premium")) {
    return {
      ...defaultConfig,
      titleGradient: "text-amber-600 dark:text-amber-500",
      badgeGradient: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0",
      buttonGradient:
        "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0",
      icon: <Crown className="h-6 w-6 text-amber-500" />,
    }
  }

  return defaultConfig
}
