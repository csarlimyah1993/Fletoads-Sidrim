import { connectToDatabase } from "./mongodb"
import { ObjectId } from "mongodb"

/**
 * Busca a loja associada a um usuário
 * @param userId - ID do usuário
 * @returns Objeto da loja ou null se não encontrada
 */
export async function buscarLojaPorUsuario(userId: string) {
  try {
    const { db } = await connectToDatabase()

    // Primeiro, verificar se o usuário tem lojaId
    const usuario = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

    if (usuario && usuario.lojaId) {
      try {
        // Buscar loja pelo ID
        const loja = await db.collection("lojas").findOne({
          _id: typeof usuario.lojaId === "string" ? new ObjectId(usuario.lojaId) : usuario.lojaId,
        })
        if (loja) return loja
      } catch (error) {
        console.error("Erro ao buscar loja pelo ID:", error)
      }
    }

    // Se não tiver lojaId ou não encontrar a loja, buscar pela proprietarioId ou usuarioId
    const loja = await db.collection("lojas").findOne({
      $or: [
        { proprietarioId: userId },
        { proprietarioId: new ObjectId(userId) },
        { usuarioId: userId },
        { usuarioId: new ObjectId(userId) },
      ],
    })

    // Se encontrou a loja pela proprietarioId/usuarioId, atualizar o usuário com o lojaId
    if (loja && usuario && !usuario.lojaId) {
      await db
        .collection("usuarios")
        .updateOne({ _id: new ObjectId(userId) }, { $set: { lojaId: loja._id.toString() } })
    }

    return loja
  } catch (error) {
    console.error("Erro ao buscar loja do usuário:", error)
    return null
  }
}

/**
 * Associa uma loja a um usuário
 * @param userId - ID do usuário
 * @param lojaId - ID da loja
 * @returns Boolean indicando sucesso
 */
export async function associarLojaAoUsuario(userId: string, lojaId: string) {
  try {
    const { db } = await connectToDatabase()

    await db
      .collection("usuarios")
      .updateOne({ _id: new ObjectId(userId) }, { $set: { lojaId: lojaId, updatedAt: new Date() } })

    return true
  } catch (error) {
    console.error("Erro ao associar loja ao usuário:", error)
    return false
  }
}
