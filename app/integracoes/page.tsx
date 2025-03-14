import { Header } from "@/components/header"
import { IntegracoesContent } from "@/components/integracoes-content"

export default function IntegracoesPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <IntegracoesContent />
      </div>
    </>
  )
}

