import { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"
import { getPanfletoById } from "@/lib/panfletos"

interface Params {
  id: string
}

interface EditarPanfletoPageProps {
  params: Promise<Params> // Corrigido para Promise<Params>
}

export const metadata: Metadata = {
  title: "Editar Panfleto | FletoAds",
  description: "Edite seu panfleto digital",
}

export default async function EditarPanfletoPage({ params }: EditarPanfletoPageProps) {
  const { id } = await params  // Aguardamos a resolução do params

  const panfleto = await getPanfletoById(id)

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
