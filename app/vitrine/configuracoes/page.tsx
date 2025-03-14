import { Header } from "@/components/header"
import { ConfiguracoesVitrineContent } from "@/components/configuracoes-vitrine-content"

export default function ConfiguracoesVitrinePage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <ConfiguracoesVitrineContent />
      </div>
    </>
  )
}

