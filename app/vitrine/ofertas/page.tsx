import { Header } from "@/components/header"
import { OfertasContent } from "@/components/ofertas-content"

export default function OfertasPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <OfertasContent />
      </div>
    </>
  )
}

