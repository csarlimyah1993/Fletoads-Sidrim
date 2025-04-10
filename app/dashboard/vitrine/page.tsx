import type { Metadata } from "next"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/config"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb" // Corrigido: mudado de @/lib/db para @/lib/mongodb
import { VitrineClientPage } from "./VitrineClientPage" // Corrigido: nome do arquivo com case correto

export const metadata: Metadata = {
  title: "Vitrine - Dashboard",
  description: "Gerencie sua vitrine online",
}

async function getLoja(userId: string) {
  const { db } = await connectToDatabase()
  return db.collection("lojas").findOne({ usuarioId: userId })
}

async function getVitrineConfig(lojaId: string) {
  const { db } = await connectToDatabase()
  return db.collection("vitrines").findOne({ lojaId })
}

export default async function VitrinePage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const loja = await getLoja(session.user.id)

  if (!loja) {
    redirect("/dashboard/perfil-da-loja/criar")
  }

  const vitrineConfig = await getVitrineConfig(loja._id.toString())

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Personalização da Vitrine</h1>
      <VitrineClientPage
        loja={JSON.parse(JSON.stringify(loja))}
        vitrineConfig={vitrineConfig ? JSON.parse(JSON.stringify(vitrineConfig)) : null}
      />
    </div>
  )
}
