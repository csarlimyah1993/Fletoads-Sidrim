import { Metadata } from "next"
import { Header } from "@/components/header"
import { PanfletosList } from "@/components/panfletos/panfletos-list"

export const metadata: Metadata = {
  title: "Panfletos | FletoAds",
  description: "Gerencie seus panfletos digitais",
}

export default function PanfletosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Panfletos" />
      <main className="flex-1">
        <div className="container py-6">
          <PanfletosList />
        </div>
      </main>
    </div>
  )
}