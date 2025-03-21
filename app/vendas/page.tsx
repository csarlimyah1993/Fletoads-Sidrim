import { Metadata } from "next"
import { Header } from "@/components/header"
import { VendasList } from "@/components/vendas/vendas-list"

export const metadata: Metadata = {
  title: "Vendas | FletoAds",
  description: "Acompanhe suas vendas",
}

export default function VendasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Vendas" />
      <main className="flex-1">
        <div className="container py-6">
          <VendasList />
        </div>
      </main>
    </div>
  )
}