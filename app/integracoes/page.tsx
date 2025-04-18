import type { Metadata } from "next"
import { Header } from "@/components/header"
import { IntegracoesContainer } from "@/components/integracoes/integracoes-container"

export const metadata: Metadata = {
  title: "Integrações | FletoAds",
  description: "Gerencie suas integrações com outras plataformas",
}

export default function IntegracoesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Integrações" />
      <main className="flex-1">
        <div className="container py-6">
          <IntegracoesContainer />
        </div>
      </main>
    </div>
  )
}
