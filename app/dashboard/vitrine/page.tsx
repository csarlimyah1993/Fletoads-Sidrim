import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"
import VitrineClientPage from "./VitrineClientPage"
import { ObjectId } from "mongodb"

export const metadata: Metadata = {
  title: "Vitrine | FletoAds",
  description: "Gerencie sua vitrine online",
}

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { db } = await connectToDatabase()

  // Buscar o usuário
  const usuario = await db.collection("usuarios").findOne({
    email: session.user.email,
  })

  if (!usuario) {
    redirect("/login")
  }

  // Verificar se o usuário tem uma loja
  const loja = await db.collection("lojas").findOne({
    proprietarioId: usuario._id.toString(),
  })

  // Se não tiver loja, redirecionar para criar
  if (!loja) {
    redirect("/dashboard/perfil-da-loja/criar")
  }

  // Verificar se o usuário tem uma vitrine
  const vitrine = await db.collection("vitrines").findOne({
    $or: [
      { lojaId: loja._id.toString() },
      { lojaId: new ObjectId(loja._id) },
      { usuarioId: usuario._id.toString() },
      { usuarioId: new ObjectId(usuario._id) },
    ],
  })

  // Se não tiver vitrine, redirecionar para criar
  if (!vitrine) {
    redirect("/dashboard/vitrine/criar")
  }

  return <VitrineClientPage loja={JSON.parse(JSON.stringify(loja))} vitrine={JSON.parse(JSON.stringify(vitrine))} />
}
