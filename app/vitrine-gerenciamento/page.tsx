import { Header } from "@/components/header"
import  VitrineGerenciamentoContent  from "@/components/vitrine-gerenciamento-content"

export default function VitrineGerenciamentoPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <VitrineGerenciamentoContent />
      </div>
    </>
  )
}

