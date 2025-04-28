import type { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../lib/auth"
import { redirect } from "next/navigation"
import { connectToDatabase } from "@/lib/mongodb"

export const metadata: Metadata = {
  title: "Novo Panfleto | FletoAds",
  description: "Crie um novo panfleto digital",
}

export default async function NovoPanfletoPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  // Fetch the user's loja
  const { db } = await connectToDatabase()
  const loja = await db.collection("lojas").findOne({ usuarioId: session.user.id })

  // Redirect if the user doesn't have a loja
  if (!loja) {
    redirect("/dashboard/perfil-da-loja")
  }

  // Extract lojaId
  const lojaId = loja._id.toString()

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Novo Panfleto" />
      <div className="container py-6">
        <PanfletoForm lojaId={lojaId} />
      </div>
    </div>
  )
}
