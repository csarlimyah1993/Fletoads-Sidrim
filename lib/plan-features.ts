// Define the types of features that can be enabled/disabled
export type FeatureKey =
  | "vitrine"
  | "panfletos"
  | "hotPromos"
  | "produtos"
  | "vendas"
  | "panAssistant"
  | "notificacoes"
  | "clientesProximos"
  | "sinalizacaoVisual"
  | "suporte"
  | "analytics"
  | "campanhas"
  | "clientes"
  | "integracoes"

// Define the plan levels
export type PlanLevel = "free" | "start" | "pro" | "business" | "enterprise" | "premium"

// Define the features available for each plan
export const PLAN_FEATURES: Record<PlanLevel, FeatureKey[]> = {
  free: ["vitrine", "panfletos", "produtos", "vendas"],
  start: [
    "vitrine",
    "panfletos",
    "hotPromos",
    "produtos",
    "vendas",
    "panAssistant",
    "notificacoes",
    "clientesProximos",
    "sinalizacaoVisual",
    "integracoes",
  ],
  pro: [
    "vitrine",
    "panfletos",
    "hotPromos",
    "produtos",
    "vendas",
    "panAssistant",
    "notificacoes",
    "clientesProximos",
    "sinalizacaoVisual",
    "suporte",
    "analytics",
    "campanhas",
    "clientes",
    "integracoes",
  ],
  business: [
    "vitrine",
    "panfletos",
    "hotPromos",
    "produtos",
    "vendas",
    "panAssistant",
    "notificacoes",
    "clientesProximos",
    "sinalizacaoVisual",
    "suporte",
    "analytics",
    "campanhas",
    "clientes",
    "integracoes",
  ],
  enterprise: [
    "vitrine",
    "panfletos",
    "hotPromos",
    "produtos",
    "vendas",
    "panAssistant",
    "notificacoes",
    "clientesProximos",
    "sinalizacaoVisual",
    "suporte",
    "analytics",
    "campanhas",
    "clientes",
    "integracoes",
  ],
  premium: [
    "vitrine",
    "panfletos",
    "hotPromos",
    "produtos",
    "vendas",
    "panAssistant",
    "notificacoes",
    "clientesProximos",
    "sinalizacaoVisual",
    "suporte",
    "analytics",
    "campanhas",
    "clientes",
    "integracoes",
  ],
}

// Map plan slugs to plan levels
export const PLAN_SLUG_TO_LEVEL: Record<string, PlanLevel> = {
  free: "free",
  start: "start",
  basico: "start",
  pro: "pro",
  profissional: "pro",
  business: "business",
  enterprise: "enterprise",
  empresarial: "enterprise",
  premium: "premium",
}

// Function to get the plan level from a plan slug
export function getPlanLevelFromSlug(slug?: string): PlanLevel {
  if (!slug) return "free"
  return PLAN_SLUG_TO_LEVEL[slug.toLowerCase()] || "free"
}

// Function to check if a feature is available for a given plan level
export function isFeatureAvailable(planLevel: PlanLevel, feature: FeatureKey): boolean {
  return PLAN_FEATURES[planLevel].includes(feature)
}

// Function to check if a feature is available for a given plan slug
export function isFeatureAvailableForPlan(planSlug: string | undefined, feature: FeatureKey): boolean {
  const planLevel = getPlanLevelFromSlug(planSlug)
  return isFeatureAvailable(planLevel, feature)
}

