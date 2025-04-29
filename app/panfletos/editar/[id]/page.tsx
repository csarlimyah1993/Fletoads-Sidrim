import type { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../lib/auth"
import { redirect } from "next/navigation"
import { getPanfletoById } from "@/lib/panfletos"

export const metadata: Metadata = {
  title: "Editar Panfleto | FletoAds",
  description: "Edite seu panfleto digital",
}

interface EditarPanfletoPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function EditarPanfletoPage({ params }: EditarPanfletoPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const unwrappedParams = await params
  const panfleto = await getPanfletoById(unwrappedParams.id)

  if (!panfleto) {
    redirect("/panfletos")
  }

  // Extract lojaId from the panfleto object
  const lojaId = panfleto.lojaId

  // Ensure lojaId exists
  if (!lojaId) {
    console.error("Panfleto não possui lojaId:", panfleto._id)
    redirect("/panfletos")
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Editar Panfleto" />
      <div className="container py-6">
        <PanfletoForm panfleto={panfleto} lojaId={lojaId} />
      </div>
    </div>
  )
}
