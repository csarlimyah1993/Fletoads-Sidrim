import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

interface PlanLimits {
  panfletos?: number | null
  produtos?: number | null
  clientes?: number | null
  integracoes?: number | null
  campanhas?: number | null
  personalizacaoVitrine?: string
  bannerPersonalizado?: boolean
  layoutsVitrine?: number
  widgets?: number
  animacoes?: boolean
  personalizacaoFonte?: boolean
  imagensPorProduto?: number
  tourVirtual?: string | boolean
  [key: string]: number | null | string | boolean | undefined
}

interface ResourceUsage {
  limit: number | null
  current: number
  hasReached: boolean
  percentage: number
}

export interface ResourceLimits {
  panfletos: ResourceUsage
  produtos: ResourceUsage
  clientes: ResourceUsage
  integracoes: ResourceUsage
  campanhas: ResourceUsage
  [key: string]: ResourceUsage
}

// Definição dos limites de cada plano conforme fornecido
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  gratuito: {
    nome: "Grátis",
    preco: "Grátis",
    produtos: 10,
    personalizacaoVitrine: "básica",
    bannerPersonalizado: true,
    layoutsVitrine: 2,
    widgets: 3,
    animacoes: false,
    personalizacaoFonte: false,
    panfletos: 0,
    campanhas: 0, // promocoesDestaque
    imagensPorProduto: 1,
    integracoes: 0, // integracaoWhatsApp
    tourVirtual: false,
    clientes: 20, // valor padrão para clientes
  },
  start: {
    nome: "Start",
    preco: "R$ 297,00/mês",
    produtos: 30,
    personalizacaoVitrine: "avançada",
    bannerPersonalizado: true,
    layoutsVitrine: 4,
    widgets: 5,
    animacoes: false,
    personalizacaoFonte: true,
    panfletos: 20,
    campanhas: 5, // promocoesDestaque
    imagensPorProduto: 2,
    integracoes: 1, // integracaoWhatsApp
    tourVirtual: false,
    clientes: 50, // valor padrão para clientes
  },
  basico: {
    nome: "Básico",
    preco: "R$ 799,00/mês",
    produtos: 50, // Ajustado de 0 para um valor razoável
    personalizacaoVitrine: "avançada",
    bannerPersonalizado: true,
    layoutsVitrine: 4,
    widgets: 5,
    animacoes: false,
    personalizacaoFonte: true,
    panfletos: 30,
    campanhas: 10, // promocoesDestaque
    imagensPorProduto: 3,
    integracoes: 1, // integracaoWhatsApp
    tourVirtual: false,
    clientes: 100, // valor padrão para clientes
  },
  completo: {
    nome: "Completo",
    preco: "R$ 1599,00/mês",
    produtos: 60,
    personalizacaoVitrine: "avançada",
    bannerPersonalizado: true,
    layoutsVitrine: 6,
    widgets: 7,
    animacoes: true,
    personalizacaoFonte: true,
    panfletos: 50,
    campanhas: 20, // promocoesDestaque
    imagensPorProduto: 3,
    integracoes: 1, // integracaoWhatsApp
    tourVirtual: "Básico",
    clientes: 200, // valor padrão para clientes
  },
  premium: {
    nome: "Premium",
    preco: "R$ 2200,00/mês",
    produtos: 120,
    personalizacaoVitrine: "avançada",
    bannerPersonalizado: true,
    layoutsVitrine: 8,
    widgets: 10,
    animacoes: true,
    personalizacaoFonte: true,
    panfletos: 100,
    campanhas: 50, // promocoesDestaque
    imagensPorProduto: 5,
    integracoes: 2, // integracaoWhatsApp
    tourVirtual: "Completo",
    clientes: 300, // valor padrão para clientes
  },
  empresarial: {
    nome: "Empresarial",
    preco: "Personalizado",
    produtos: 400,
    personalizacaoVitrine: "avançada",
    bannerPersonalizado: true,
    layoutsVitrine: 12,
    widgets: 12,
    animacoes: true,
    personalizacaoFonte: true,
    panfletos: 200,
    campanhas: 100, // promocoesDestaque
    imagensPorProduto: 5,
    integracoes: 4, // integracaoWhatsApp
    tourVirtual: "Premium",
    clientes: 500, // valor padrão para clientes
  },
}

export async function getUserPlanLimits(userId: string): Promise<PlanLimits> {
  try {
    const { db } = await connectToDatabase()

    // Buscar o usuário
    const user = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })
    if (!user) {
      throw new Error("Usuário não encontrado")
    }

    // Buscar o plano do usuário
    const planName = user.plano || "gratuito"

    // Verificar se o plano existe em nossa definição de limites
    if (PLAN_LIMITS[planName]) {
      return PLAN_LIMITS[planName]
    }

    // Buscar o plano do banco de dados como fallback
    const plan = await db.collection("planos").findOne({ nome: planName })

    // Se não encontrar o plano, retorna limites do plano gratuito
    if (!plan) {
      return PLAN_LIMITS.gratuito
    }

    return plan.limites
  } catch (error) {
    console.error("Erro ao buscar limites do plano:", error)
    return PLAN_LIMITS.gratuito
  }
}

export async function checkResourceLimit(userId: string, resource: string): Promise<ResourceUsage> {
  try {
    const { db } = await connectToDatabase()
    const limits = await getUserPlanLimits(userId)

    // Converter o limite para number ou null
    let limit: number | null = null

    if (typeof limits[resource] === "number") {
      limit = limits[resource] as number
      // Se o limite for -1, significa que é ilimitado
      if (limit === -1) {
        limit = null
      }
    }

    // Contar recursos do usuário
    const count = await db.collection(resource).countDocuments({
      usuarioId: new ObjectId(userId),
    })

    // Verificar se atingiu o limite
    // Se o limite for null, significa que é ilimitado
    const hasReached = limit !== null && count >= limit

    // Calcular porcentagem
    const percentage = limit !== null ? Math.min((count / limit) * 100, 100) : 0

    return {
      limit,
      current: count,
      hasReached,
      percentage,
    }
  } catch (error) {
    console.error(`Erro ao verificar limite de ${resource}:`, error)
    return {
      limit: null,
      current: 0,
      hasReached: false,
      percentage: 0,
    }
  }
}

export async function getAllResourceLimits(userId: string): Promise<ResourceLimits> {
  const resources = ["panfletos", "produtos", "clientes", "integracoes", "campanhas"]

  const limits: ResourceLimits = {
    panfletos: { limit: null, current: 0, hasReached: false, percentage: 0 },
    produtos: { limit: null, current: 0, hasReached: false, percentage: 0 },
    clientes: { limit: null, current: 0, hasReached: false, percentage: 0 },
    integracoes: { limit: null, current: 0, hasReached: false, percentage: 0 },
    campanhas: { limit: null, current: 0, hasReached: false, percentage: 0 },
  }

  for (const resource of resources) {
    limits[resource] = await checkResourceLimit(userId, resource)
  }

  return limits
}

// Add the missing function that combines plan limits with actual usage
export async function getUserResourceLimits(userId: string) {
  // Get the user's plan limits
  const planLimits = await getUserPlanLimits(userId)

  // Get the current usage of resources
  const resourceLimits = await getAllResourceLimits(userId)

  // Return combined data
  return {
    plan: {
      name: planLimits.nome || "Desconhecido",
      price: planLimits.preco || "Desconhecido",
      features: {
        personalizacaoVitrine: planLimits.personalizacaoVitrine || "básica",
        bannerPersonalizado: planLimits.bannerPersonalizado || false,
        layoutsVitrine: planLimits.layoutsVitrine || 1,
        widgets: planLimits.widgets || 0,
        animacoes: planLimits.animacoes || false,
        personalizacaoFonte: planLimits.personalizacaoFonte || false,
        imagensPorProduto: planLimits.imagensPorProduto || 1,
        tourVirtual: planLimits.tourVirtual || false,
      },
    },
    limits: {
      panfletos: planLimits.panfletos,
      produtos: planLimits.produtos,
      clientes: planLimits.clientes,
      integracoes: planLimits.integracoes,
      campanhas: planLimits.campanhas,
    },
    usage: resourceLimits,
  }
}
