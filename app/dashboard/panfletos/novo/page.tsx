import { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletoForm } from "@/components/panfletos/panfleto-form"

export const metadata: Metadata = {
  title: "Novo Panfleto | FletoAds",
  description: "Crie um novo panfleto digital",
}

export default function NovoPanfletoPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Novo Panfleto" />
      <main className="flex-1">
        <div className="container py-6">
          <PanfletoForm />
        </div>
      </main>
    </div>
  )
}