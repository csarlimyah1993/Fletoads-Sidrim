"use client"

import { useEffect, useState } from "react"

// Tipos para os recursos
export interface Resource {
  name: string
  used: number
  limit: number
  unit: string
}

// Tipos para os planos
export interface Plan {
  id: string
  name: string
  level: string
  isFreePlan: boolean
  features: string[]
  resources: Resource[]
  maxIntegracoes: number
  hasAI: boolean
}

// Dados simulados dos planos
const plans: Record<string, Plan> = {
  free: {
    id: "free",
    name: "Gratuito",
    level: "free",
    isFreePlan: true,
    features: ["Até 3 panfletos", "Até 10 produtos", "Suporte básico"],
    resources: [
      { name: "Panfletos", used: 2, limit: 3, unit: "panfletos" },
      { name: "Produtos", used: 5, limit: 10, unit: "produtos" },
      { name: "Armazenamento", used: 5, limit: 50, unit: "MB" },
    ],
    maxIntegracoes: 1,
    hasAI: false,
  },
  basic: {
    id: "basic",
    name: "Básico",
    level: "basic",
    isFreePlan: false,
    features: ["Até 10 panfletos", "Até 50 produtos", "Suporte prioritário", "Análises básicas"],
    resources: [
      { name: "Panfletos", used: 5, limit: 10, unit: "panfletos" },
      { name: "Produtos", used: 20, limit: 50, unit: "produtos" },
      { name: "Armazenamento", used: 100, limit: 500, unit: "MB" },
    ],
    maxIntegracoes: 2,
    hasAI: false,
  },
  pro: {
    id: "pro",
    name: "Profissional",
    level: "pro",
    isFreePlan: false,
    features: ["Panfletos ilimitados", "Até 200 produtos", "Suporte prioritário", "Análises avançadas", "Integrações"],
    resources: [
      { name: "Panfletos", used: 15, limit: 999999, unit: "panfletos" },
      { name: "Produtos", used: 75, limit: 200, unit: "produtos" },
      { name: "Armazenamento", used: 350, limit: 2000, unit: "MB" },
    ],
    maxIntegracoes: 5,
    hasAI: true,
  },
  enterprise: {
    id: "enterprise",
    name: "Empresarial",
    level: "enterprise",
    isFreePlan: false,
    features: [
      "Panfletos ilimitados",
      "Produtos ilimitados",
      "Suporte VIP",
      "Análises avançadas",
      "Integrações",
      "API personalizada",
    ],
    resources: [
      { name: "Panfletos", used: 50, limit: 999999, unit: "panfletos" },
      { name: "Produtos", used: 150, limit: 999999, unit: "produtos" },
      { name: "Armazenamento", used: 1200, limit: 10000, unit: "MB" },
    ],
    maxIntegracoes: 10,
    hasAI: true,
  },
}

export function usePlanFeatures() {
  // Em um ambiente real, você buscaria isso do backend
  const [currentPlan, setCurrentPlan] = useState<Plan>(plans.free)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulando uma chamada de API
    const fetchPlan = async () => {
      setIsLoading(true)
      // Simular atraso de rede
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Em um ambiente real, você buscaria o plano do usuário do backend
      // Por enquanto, vamos usar o plano gratuito
      setCurrentPlan(plans.free)
      setIsLoading(false)
    }

    fetchPlan()
  }, [])

  // Função para verificar se o usuário tem acesso a um recurso específico
  const hasFeature = (featureName: string) => {
    return currentPlan.features.includes(featureName)
  }

  // Propriedades específicas para recursos comuns
  const hasAnalytics = hasFeature("Análises básicas") || hasFeature("Análises avançadas")
  const hasIntegrations = hasFeature("Integrações")
  const hasAPI = hasFeature("API personalizada")
  const hasPrioritySuppport = hasFeature("Suporte prioritário") || hasFeature("Suporte VIP")

  return {
    planId: currentPlan.id,
    planName: currentPlan.name,
    planLevel: currentPlan.level,
    isFreePlan: currentPlan.isFreePlan,
    features: currentPlan.features,
    resources: currentPlan.resources,
    maxIntegracoes: currentPlan.maxIntegracoes,
    hasAI: currentPlan.hasAI,
    isLoading,
    hasFeature,
    // Propriedades específicas
    hasAnalytics,
    hasIntegrations,
    hasAPI,
    hasPrioritySuppport,
  }
}

