import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { LojaEditForm } from "@/components/perfil/loja-edit-form"

export const metadata = {
  title: "Editar Perfil da Loja | FletoAds",
  description: "Edite as informações da sua loja",
}

async function getLoja(userId: string) {
  try {
    const { db } = await connectToDatabase()

    // Buscar todas as lojas para este usuário
    const lojas = await db
      .collection("lojas")
      .find({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
      .toArray()

    if (lojas.length === 0) {
      return null
    }

    // Usar a primeira loja encontrada
    const loja = lojas[0]

    // Converter o ObjectId para string para serialização
    return {
      ...loja,
      _id: loja._id.toString(),
    }
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export default async function EditarPerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  const loja = await getLoja(userId)

  if (!loja) {
    redirect("/dashboard/perfil-da-loja")
  }

  return <LojaEditForm loja={loja} />
}

