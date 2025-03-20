"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

// Tipos de recursos disponíveis
export type FeatureKey =
  | "panAssistant"
  | "clientesProximos"
  | "integracoes"
  | "analytics"
  | "multiUsuarios"
  | "exportacao"
  | "suportePrioritario"
  | "personalizado"
  | "produtos"
  | "panfletos"
  | "hotPromos"
  | "campanhas"
  | "clientes"
  | "sinalizacaoVisual"
  | "notificacoes"
  | "vitrine"
  | "vendas"
  | "suporte"

// Interface para os recursos
export interface PlanFeatures {
  panAssistant: boolean
  clientesProximos: boolean
  integracoes: boolean
  analytics: boolean
  multiUsuarios: boolean
  exportacao: boolean
  suportePrioritario: boolean
  personalizado: boolean
  produtos: boolean
  panfletos: boolean
  hotPromos: boolean
  campanhas: boolean
  clientes: boolean
  sinalizacaoVisual: boolean
  notificacoes: boolean
  vitrine: boolean
  vendas: boolean
  suporte: boolean
}

// Configuração dos planos
const planos = {
  free: {
    level: "free",
    name: "Gratuito",
    features: {
      panAssistant: false,
      clientesProximos: false,
      integracoes: false,
      analytics: false,
      multiUsuarios: false,
      exportacao: false,
      suportePrioritario: false,
      personalizado: false,
      produtos: true,
      panfletos: true,
      hotPromos: false,
      campanhas: false,
      clientes: false,
      sinalizacaoVisual: false,
      notificacoes: true,
      vitrine: false,
      vendas: true,
      suporte: false,
    },
  },
  basic: {
    level: "basic",
    name: "Básico",
    features: {
      panAssistant: true,
      clientesProximos: true,
      integracoes: false,
      analytics: false,
      multiUsuarios: false,
      exportacao: false,
      suportePrioritario: false,
      personalizado: false,
      produtos: true,
      panfletos: true,
      hotPromos: true,
      campanhas: true,
      clientes: true,
      sinalizacaoVisual: true,
      notificacoes: true,
      vitrine: true,
      vendas: true,
      suporte: true,
    },
  },
  pro: {
    level: "pro",
    name: "Profissional",
    features: {
      panAssistant: true,
      clientesProximos: true,
      integracoes: true,
      analytics: true,
      multiUsuarios: true,
      exportacao: true,
      suportePrioritario: false,
      personalizado: false,
      produtos: true,
      panfletos: true,
      hotPromos: true,
      campanhas: true,
      clientes: true,
      sinalizacaoVisual: true,
      notificacoes: true,
      vitrine: true,
      vendas: true,
      suporte: true,
    },
  },
  enterprise: {
    level: "enterprise",
    name: "Empresarial",
    features: {
      panAssistant: true,
      clientesProximos: true,
      integracoes: true,
      analytics: true,
      multiUsuarios: true,
      exportacao: true,
      suportePrioritario: true,
      personalizado: true,
      produtos: true,
      panfletos: true,
      hotPromos: true,
      campanhas: true,
      clientes: true,
      sinalizacaoVisual: true,
      notificacoes: true,
      vitrine: true,
      vendas: true,
      suporte: true,
    },
  },
}

export function usePlanFeatures() {
  const { data: session, status } = useSession()
  const [isLoading, setIsLoading] = useState(true)

  // Obtém o plano do usuário da sessão ou usa o plano gratuito como padrão
  const userPlanSlug = session?.user?.plano?.slug || "free"
  const planData = planos[userPlanSlug as keyof typeof planos] || planos.free

  // Verifica se o plano tem um recurso específico
  const hasFeature = (feature: FeatureKey) => {
    return planData.features[feature] || false
  }

  useEffect(() => {
    // Quando o status da sessão não é mais "loading", atualizamos nosso estado
    if (status !== "loading") {
      setIsLoading(false)
    }
  }, [status])

  return {
    planLevel: planData.level,
    planSlug: userPlanSlug,
    planName: planData.name,
    features: planData.features,
    hasFeature,
    isLoading,
  }
}

