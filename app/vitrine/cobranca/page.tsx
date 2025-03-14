import { Header } from "@/components/header"
import { CobrancaContent } from "@/components/cobranca-content"

export default function CobrancaPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <CobrancaContent />
      </div>
    </>
  )
}

