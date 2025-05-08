import type { Metadata } from "next"
import IntegracoesPage from "./integracoes-page"

export const metadata: Metadata = {
  title: "Integrações | FletoAds",
  description: "Gerencie suas integrações com outras plataformas",
}

export default function IntegracoesPageWrapper() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <div className="container py-6">
          <IntegracoesPage />
        </div>
      </main>
    </div>
  )
}
