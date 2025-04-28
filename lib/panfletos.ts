import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export async function getPanfletoById(id: string) {
  try {
    const { db } = await connectToDatabase()

    // Converter o ID para ObjectId
    const objectId = new ObjectId(id)

    // Buscar o panfleto
    const panfleto = await db.collection("panfletos").findOne({ _id: objectId })

    if (!panfleto) {
      throw new Error("Panfleto não encontrado")
    }

    // Converter o _id para string e outras datas para ISO string
    return {
      ...panfleto,
      _id: panfleto._id.toString(),
      lojaId: panfleto.lojaId ? panfleto.lojaId.toString() : null,
      usuarioId: panfleto.usuarioId ? panfleto.usuarioId.toString() : null,
      dataCriacao: panfleto.dataCriacao ? panfleto.dataCriacao.toISOString() : null,
      dataAtualizacao: panfleto.dataAtualizacao ? panfleto.dataAtualizacao.toISOString() : null,
      dataInicio: panfleto.dataInicio ? panfleto.dataInicio.toISOString() : null,
      dataFim: panfleto.dataFim ? panfleto.dataFim.toISOString() : null,
    }
  } catch (error) {
    console.error("Erro ao buscar panfleto:", error)
    throw error
  }
}
