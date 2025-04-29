import type { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

export const metadata: Metadata = {
  title: "Novo Panfleto | FletoAds",
  description: "Crie um novo panfleto digital",
}

export default async function NovoPanfletoPage() {
  // Verificar se o usuário está autenticado
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/dashboard/panfletos/novo")
  }

  // Buscar a loja do usuário
  const { db } = await connectToDatabase()
  const loja = await db.collection("lojas").findOne({
    $or: [{ userId: session.user.id }, { proprietarioId: session.user.id }],
  })

  if (!loja) {
    // Se o usuário não tiver uma loja, redirecionar para criar uma
    redirect("/dashboard/perfil-da-loja?message=Você precisa criar uma loja primeiro")
  }

  const lojaId = loja._id.toString()

  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Novo Panfleto" />
      <main className="flex-1">
        <div className="container py-6">
          <PanfletoForm lojaId={lojaId} />
        </div>
      </main>
    </div>
  )
}
