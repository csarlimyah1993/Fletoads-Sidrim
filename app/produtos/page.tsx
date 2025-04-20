import type { Metadata } from "next"
import { Header } from "@/components/header"
import { ProdutosList } from "@/components/produtos/produtos-list"

export const metadata: Metadata = {
  title: "Produtos | FletoAds",
  description: "Gerencie seus produtos",
}

export default function ProdutosPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header title="Produtos" />
      <main className="flex-1">
        <div className="container py-6">
          <ProdutosList />
        </div>
      </main>
    </div>
  )
}
