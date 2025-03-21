import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getPanfletoById(id: string) {
  try {
    const { db } = await connectToDatabase()
    const panfleto = await db.collection("panfletos").findOne({ _id: new ObjectId(id) })

    if (!panfleto) {
      return null
    }

    return {
      ...panfleto,
      _id: panfleto._id.toString(),
    }
  } catch (error) {
    console.error("Erro ao buscar panfleto:", error)
    return null
  }
}

