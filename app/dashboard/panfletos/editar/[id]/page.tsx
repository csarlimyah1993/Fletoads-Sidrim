import { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"
import { getPanfletoById } from "@/lib/panfletos"

interface EditarPanfletoPageProps {
  params: {
    id: string
  }
}

export const metadata: Metadata = {
  title: "Editar Panfleto | FletoAds",
  description: "Edite seu panfleto digital",
}

export default async function EditarPanfletoPage({ params }: EditarPanfletoPageProps) {
  const panfleto = await getPanfletoById(params.id)
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Editar Panfleto" />
      <main className="flex-1">
        <div className="container py-6">
          <PanfletoForm panfleto={panfleto} />
        </div>
      </main>
    </div>
  )
}