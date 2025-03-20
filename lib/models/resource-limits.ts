export type PlanType = "free" | "start" | "pro" | "business" | "enterprise"

export interface ResourceLimits {
  panfletos: number
  produtos: number
  campanhas: number
  clientes: number
  integracoes: number
  armazenamento: number // em KB
  panAssistant: boolean
  analytics: boolean
  clientesProximos: boolean
  sinalizacaoVisual: boolean
  notificacoes: boolean
  vitrine: boolean
  hotPromos: boolean
  vendas: boolean
  suporte: boolean
}

// Limites para o plano gratuito
export const FREE_PLAN_LIMITS: ResourceLimits = {
  panfletos: 3,
  produtos: 20,
  campanhas: 1,
  clientes: 5,
  integracoes: 0,
  armazenamento: 5 * 1024, // 5MB
  panAssistant: false,
  analytics: false,
  clientesProximos: false,
  sinalizacaoVisual: false,
  notificacoes: false,
  vitrine: false,
  hotPromos: false,
  vendas: false,
  suporte: false,
}

// Limites para o plano básico
export const BASIC_PLAN_LIMITS: ResourceLimits = {
  panfletos: 10,
  produtos: 50,
  campanhas: 3,
  clientes: 20,
  integracoes: 1,
  armazenamento: 20 * 1024, // 20MB
  panAssistant: true,
  analytics: false,
  clientesProximos: false,
  sinalizacaoVisual: false,
  notificacoes: true,
  vitrine: true,
  hotPromos: false,
  vendas: true,
  suporte: true,
}

// Limites para o plano profissional
export const PRO_PLAN_LIMITS: ResourceLimits = {
  panfletos: 30,
  produtos: 200,
  campanhas: 10,
  clientes: 100,
  integracoes: 3,
  armazenamento: 100 * 1024, // 100MB
  panAssistant: true,
  analytics: true,
  clientesProximos: false,
  sinalizacaoVisual: true,
  notificacoes: true,
  vitrine: true,
  hotPromos: true,
  vendas: true,
  suporte: true,
}

// Limites para o plano empresarial
export const ENTERPRISE_PLAN_LIMITS: ResourceLimits = {
  panfletos: 100,
  produtos: 1000,
  campanhas: 50,
  clientes: 500,
  integracoes: 10,
  armazenamento: 500 * 1024, // 500MB
  panAssistant: true,
  analytics: true,
  clientesProximos: true,
  sinalizacaoVisual: true,
  notificacoes: true,
  vitrine: true,
  hotPromos: true,
  vendas: true,
  suporte: true,
}

// Função para obter os limites com base no plano
export function getResourceLimitsByPlan(planType: PlanType): ResourceLimits {
  switch (planType) {
    case "free":
      return FREE_PLAN_LIMITS
    case "start":
      return BASIC_PLAN_LIMITS
    case "pro":
      return PRO_PLAN_LIMITS
    case "business":
    case "enterprise":
      return ENTERPRISE_PLAN_LIMITS
    default:
      return FREE_PLAN_LIMITS
  }
}

// Função para verificar se um usuário atingiu o limite de um recurso
export function hasReachedLimit(
  limits: ResourceLimits,
  resourceType: keyof ResourceLimits,
  currentUsage: number,
): boolean {
  const limit = limits[resourceType]

  if (typeof limit === "number") {
    return currentUsage >= limit
  }

  return false
}

// Função para calcular a porcentagem de uso de um recurso
export function getUsagePercentage(
  limits: ResourceLimits,
  resourceType: keyof ResourceLimits,
  currentUsage: number,
): number {
  const limit = limits[resourceType]

  if (typeof limit === "number" && limit > 0) {
    return Math.min(Math.round((currentUsage / limit) * 100), 100)
  }

  return 0
}

// Função para obter uma mensagem sobre o limite de um recurso
export function getLimitMessage(
  limits: ResourceLimits,
  resourceType: keyof ResourceLimits,
  currentUsage: number,
): string {
  const limit = limits[resourceType]

  if (typeof limit === "number") {
    const remaining = limit - currentUsage
    const percentage = getUsagePercentage(limits, resourceType, currentUsage)

    if (remaining <= 0) {
      return `Você atingiu o limite de ${limit} ${resourceType}.`
    } else if (percentage >= 80) {
      return `Você está próximo de atingir o limite de ${limit} ${resourceType}.`
    } else {
      return `Você tem ${remaining} ${resourceType} disponíveis.`
    }
  }

  return ""
}

