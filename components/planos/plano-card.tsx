"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Crown, CheckCircle, Star, Users, Headphones, Shield, Rocket } from "lucide-react"
import { cn } from "@/lib/utils"

interface PlanCardProps {
  className?: string
}

export function PlanCard({ className }: PlanCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [userPlan, setUserPlan] = useState<string>("carregando")
  const [planExpiresAt, setPlanExpiresAt] = useState<string | undefined>(undefined)

  // Fetch user plan from API
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.plano || "gratuito")
          setPlanExpiresAt(data.detalhes?.proximaCobranca)
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

  // Format expiration date
  const formatExpirationDate = () => {
    if (!planExpiresAt) return "Sem data de expiração"

    try {
      const date = new Date(planExpiresAt)
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    } catch (e) {
      return "Data inválida"
    }
  }

  if (!mounted || userPlan === "carregando") {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
          <CardDescription>Carregando informações do plano...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
          <Badge className={cn("px-2 py-0.5 text-xs", planConfig.badgeGradient)}>
            <Star className="h-3 w-3 mr-1 fill-current" />
            ATIVO
          </Badge>
        </div>
        <CardDescription>Informações do seu plano atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          {planConfig.icon}
          <div>
            <h3 className={cn("text-xl font-bold", planConfig.titleGradient)}>Plano {formattedPlan}</h3>
            <p className="text-sm text-muted-foreground">
              {userPlan.toLowerCase() === "gratuito" ? "Sem expiração" : `Válido até: ${formatExpirationDate()}`}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {planConfig.features.slice(0, 3).map((feature, index) => (
            <div key={index} className="flex items-start">
              <div className="mr-2 mt-0.5">
                <CheckCircle className={cn("h-4 w-4", planConfig.checkColor)} />
              </div>
              <p className="text-sm text-muted-foreground">{feature}</p>
            </div>
          ))}
        </div>

        <div className="pt-2">
          <Button
            className={cn("w-full", planConfig.buttonGradient)}
            onClick={() => (window.location.href = "/planos")}
          >
            {userPlan.toLowerCase() === "gratuito" ? "Fazer Upgrade" : "Gerenciar Plano"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

// Helper function to get plan configuration based on plan type
function getPlanConfig(planType: string) {
  // Default configuration (Gratuito)
  const defaultConfig = {
    showSeal: false,
    sealGradient: "bg-gradient-to-r from-gray-500 to-slate-500",
    sealText: "BÁSICO",
    sealIcon: <Shield className="h-5 w-5 mr-1" />,
    borderGradient: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300",
    bgGradient: "bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950",
    titleGradient: "bg-gradient-to-r from-gray-600 to-gray-500 bg-clip-text text-transparent",
    badgeGradient: "bg-gradient-to-r from-gray-500 to-slate-500 text-white border-0",
    dividerGradient: "bg-gradient-to-r from-gray-300 via-gray-400 to-gray-300",
    buttonGradient:
      "bg-gradient-to-r from-gray-500 to-slate-500 hover:from-gray-600 hover:to-slate-600 text-white border-0",
    icon: <Shield className="h-8 w-8 text-gray-500 mr-3" />,
    checkColor: "text-gray-500",
    description: "Plano básico com recursos limitados para você começar.",
    features: [
      "Acesso básico à plataforma",
      "1 integração disponível",
      "Criação de até 10 panfletos",
      "Suporte por email",
    ],
    benefits: [
      {
        icon: <Users className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
        text: "Recursos Básicos",
        bgColor: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800/30",
        iconBgColor: "bg-gray-100 dark:bg-gray-800/30",
        textColor: "text-gray-800 dark:text-gray-300",
      },
      {
        icon: <Headphones className="h-4 w-4 text-gray-600 dark:text-gray-400" />,
        text: "Suporte Básico",
        bgColor: "bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/20",
        borderColor: "border-gray-200 dark:border-gray-800/30",
        iconBgColor: "bg-gray-100 dark:bg-gray-800/30",
        textColor: "text-gray-800 dark:text-gray-300",
      },
    ],
  }

  // Premium plan configuration
  if (planType.includes("premium")) {
    return {
      ...defaultConfig,
      titleGradient: "bg-gradient-to-r from-amber-600 to-yellow-500 bg-clip-text text-transparent",
      badgeGradient: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white border-0",
      buttonGradient:
        "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white border-0",
      icon: <Crown className="h-8 w-8 text-amber-500 mr-3" />,
      checkColor: "text-green-500",
      features: [
        "Acesso a todas as ferramentas de IA",
        "Criação ilimitada de panfletos",
        "Até 10 integrações simultâneas",
        "Suporte prioritário 24/7",
        "Análise avançada de dados",
        "Recursos exclusivos premium",
      ],
    }
  }

  // Profissional plan configuration
  if (planType.includes("profissional")) {
    return {
      ...defaultConfig,
      titleGradient: "bg-gradient-to-r from-blue-600 to-indigo-500 bg-clip-text text-transparent",
      badgeGradient: "bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0",
      buttonGradient:
        "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white border-0",
      icon: <Rocket className="h-8 w-8 text-blue-500 mr-3" />,
      checkColor: "text-blue-500",
      features: [
        "Acesso a ferramentas de IA principais",
        "Criação de até 50 panfletos",
        "Até 5 integrações simultâneas",
        "Suporte prioritário",
        "Análise de dados básica",
        "Recursos profissionais",
      ],
    }
  }

  // Empresarial plan configuration
  if (planType.includes("empresarial")) {
    return {
      ...defaultConfig,
      titleGradient: "bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent",
      badgeGradient: "bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0",
      buttonGradient:
        "bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white border-0",
      icon: <Shield className="h-8 w-8 text-purple-500 mr-3" />,
      checkColor: "text-purple-500",
      features: [
        "Acesso ilimitado a todas as ferramentas",
        "Criação ilimitada de panfletos",
        "Integrações ilimitadas",
        "Suporte dedicado 24/7",
        "Análise avançada de dados",
        "Recursos personalizados",
        "API de acesso completo",
        "Gerenciamento de equipe",
      ],
    }
  }

  return defaultConfig
}
