import type { Metadata } from "next"
import { Header } from "@/components/header"
import { EditarPanfletoForm } from "@/components/editar-panfleto-form"

export const metadata: Metadata = {
  title: "Editar Panfleto | FletoAds",
  description: "Edite seu panfleto digital",
}

interface PageParams {
  id: string
}

export default async function EditarPanfletoPage({ params }: { params: Promise<PageParams> }) {
  // Await the params to get the actual id
  const resolvedParams = await params

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Editar Panfleto" />
      <div className="container py-6">
        <EditarPanfletoForm id={resolvedParams.id} />
      </div>
    </div>
  )
}
