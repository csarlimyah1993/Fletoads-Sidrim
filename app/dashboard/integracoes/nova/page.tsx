import type { Metadata } from "next"
import { Header } from "@/components/header"
import NovaIntegracaoPage from "./nova-integracao-page"

export const metadata: Metadata = {
  title: "Nova Integração | FletoAds",
  description: "Adicione uma nova integração à sua loja",
}

export default function NovaIntegracaoPageWrapper() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Nova Integração" />
      <main className="flex-1">
        <div className="container py-6">
          <NovaIntegracaoPage />
        </div>
      </main>
    </div>
  )
}
