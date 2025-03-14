import { VendasContent } from "@/components/vendas-content"
import { Header } from "@/components/header"

export default function VendasPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <VendasContent />
    </div>
  )
}

