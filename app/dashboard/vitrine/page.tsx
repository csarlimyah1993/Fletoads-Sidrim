import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"
import { VitrinePersonalizacaoForm } from "@/components/vitrine/vitrine-personalizacao-form"
import type { Loja } from "@/types/loja"
import { serializeMongoObject } from "@/lib/utils/serialize"

export const metadata = {
  title: "Personalizar Vitrine | FletoAds",
  description: "Personalize a aparência da sua vitrine online",
}

async function getLojaDoUsuario(userId: string): Promise<Loja | null> {
  try {
    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    let loja = null

    try {
      // Tentar com ObjectId
      const objectId = new ObjectId(userId)
      loja = await db.collection("lojas").findOne({
        $or: [{ usuarioId: objectId }, { userId: objectId }, { usuarioId: userId }, { userId: userId }],
      })
    } catch (error) {
      // Se falhar, tentar com string
      loja = await db.collection("lojas").findOne({
        $or: [{ usuarioId: userId }, { userId: userId }],
      })
    }

    if (!loja) return null

    // Buscar o plano do usuário
    let usuario = null
    try {
      if (typeof userId === "string") {
        try {
          const objectId = new ObjectId(userId)
          usuario = await db.collection("usuarios").findOne({
            $or: [{ _id: objectId }, { _id: userId }],
          })
        } catch {
          usuario = await db.collection("usuarios").findOne({ _id: userId })
        }
      } else {
        usuario = await db.collection("usuarios").findOne({ _id: userId })
      }
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
    }

    // Serializar o objeto da loja
    const lojaSerializada = serializeMongoObject<Loja>(loja)

    // Adicionar o planoId como string
    lojaSerializada.planoId = usuario?.plano || usuario?.metodosPagemento?.plano || "gratis"

    return lojaSerializada
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  const loja = await getLojaDoUsuario(userId)

  if (!loja) {
    redirect("/dashboard/perfil-da-loja")
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Personalizar Vitrine</h1>
      <VitrinePersonalizacaoForm loja={loja} />
    </div>
  )
}

