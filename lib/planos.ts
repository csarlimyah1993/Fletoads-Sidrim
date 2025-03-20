import Plano from "@/lib/models/plano"

export async function getPlanoBySlug(slug: string) {
  try {
    const plano = await Plano.findOne({ slug })
    return plano
  } catch (error) {
    console.error("Error fetching plan by slug:", error)
    throw error
  }
}

export async function getAllPlanos() {
  try {
    const planos = await Plano.find({}).sort({ preco: 1 })
    return planos
  } catch (error) {
    console.error("Error fetching all plans:", error)
    throw error
  }
}

