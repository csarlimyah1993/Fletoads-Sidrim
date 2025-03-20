import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { FREE_PLAN_LIMITS, type ResourceLimits } from "@/lib/models/resource-limits"
import { Usuario } from "@/lib/models/usuario"

// Default limits for users without a plan
const DEFAULT_LIMITS = {
  panfletos: 3,
  campanhas: 1,
  clientes: 5,
  produtos: 20,
}

export type ResourceType = "panfletos" | "campanhas" | "clientes" | "produtos"

export interface ResourceLimit {
  current: number
  limit: number
  canCreate: boolean
  remaining: number
  percentUsed: number
}

/**
 * Check if a user can create more of a specific resource based on their plan limits
 */
// export async function checkResourceLimit(userId: string, resourceType: ResourceType): Promise<ResourceLimit> {
//   await connectToDatabase()

//   // Get user with their plan
//   const user = await Usuario.findById(userId).populate("plano")

//   // Get the plan limits (or use defaults if no plan)
//   const planLimits = user?.plano?.limites || DEFAULT_LIMITS

//   // Get current count of resources
//   let currentCount = 0

//   switch (resourceType) {
//     case "panfletos":
//       currentCount = await Panfleto.countDocuments({ usuario: userId })
//       break
//     case "campanhas":
//       currentCount = await Campanha.countDocuments({ usuario: userId })
//       break
//     case "clientes":
//       currentCount = await Cliente.countDocuments({ usuario: userId })
//       break
//     case "produtos":
//       currentCount = await Produto.countDocuments({ usuario: userId })
//       break
//   }

//   // Get the limit for this resource type
//   const limit = planLimits[resourceType] || DEFAULT_LIMITS[resourceType]

//   // Calculate if user can create more
//   const canCreate = currentCount < limit
//   const remaining = Math.max(0, limit - currentCount)
//   const percentUsed = (currentCount / limit) * 100

//   return {
//     current: currentCount,
//     limit,
//     canCreate,
//     remaining,
//     percentUsed,
//   }
// }

// Função para verificar o limite de um recurso específico
export async function checkResourceLimit(
  userId: string,
  resourceType: keyof ResourceLimits,
  currentCount: number,
): Promise<{
  limit: number
  current: number
  hasReached: boolean
  percentage: number
}> {
  try {
    // Get user with their plan
    const user = await Usuario.findById(userId).populate("plano")

    // Get the plan limits (or use defaults if no plan)
    const planLimits = user?.plano?.limites || FREE_PLAN_LIMITS

    // Get the specific limit for the requested resource
    const limit = planLimits[resourceType] as number

    // Check if the limit has been reached
    const hasReached = typeof limit === "number" && currentCount >= limit

    // Calculate percentage of usage
    const percentage = typeof limit === "number" ? Math.min(Math.round((currentCount / limit) * 100), 100) : 0

    return {
      limit,
      current: currentCount,
      hasReached,
      percentage,
    }
  } catch (error) {
    console.error(`Error checking resource limit for ${resourceType}:`, error)

    // Return default values in case of error
    const defaultLimit = FREE_PLAN_LIMITS[resourceType] as number
    return {
      limit: defaultLimit,
      current: currentCount,
      hasReached: typeof defaultLimit === "number" && currentCount >= defaultLimit,
      percentage: typeof defaultLimit === "number" ? Math.min(Math.round((currentCount / defaultLimit) * 100), 100) : 0,
    }
  }
}

/**
 * Get all resource limits for a user
 */
// export async function getUserResourceLimits(userId: string): Promise<Record<ResourceType, ResourceLimit>> {
//   const resourceTypes: ResourceType[] = ["panfletos", "campanhas", "clientes", "produtos"]

//   const limits: Record<ResourceType, ResourceLimit> = {} as Record<ResourceType, ResourceLimit>

//   for (const type of resourceTypes) {
//     limits[type] = await checkResourceLimit(userId, type)
//   }

//   return limits
// }

// Função para obter todos os limites de recursos do usuário
export async function getUserResourceLimits(userId: string): Promise<ResourceLimits & { usage: Record<string, any> }> {
  try {
    // Get user with their plan
    const user = await Usuario.findById(userId).populate("plano")

    // Get the plan limits (or use defaults if no plan)
    const planLimits = user?.plano?.limites || FREE_PLAN_LIMITS

    // TODO: Get actual usage counts from database
    // For now, we'll use dummy values
    const usage = {
      panfletos: 0,
      produtos: 0,
      integracoes: 0,
      armazenamento: 0,
    }

    return {
      ...planLimits,
      usage,
    }
  } catch (error) {
    console.error("Error getting user resource limits:", error)

    // Return default values in case of error
    return {
      ...FREE_PLAN_LIMITS,
      usage: {
        panfletos: 0,
        produtos: 0,
        integracoes: 0,
        armazenamento: 0,
      },
    }
  }
}

/**
 * Check if the current user can create more of a specific resource
 * Returns null if not authenticated
 */
export async function checkCurrentUserResourceLimit(
  req: Request,
  resourceType: ResourceType,
): Promise<ResourceLimit | null> {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    return null
  }

  // return checkResourceLimit(session.user.id, resourceType)
  return null
}

