import { Header } from "@/components/header"
import { PersonalizarVitrineContent } from "@/components/personalizar-vitrine-content"

export default function PersonalizarVitrinePage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <PersonalizarVitrineContent />
      </div>
    </>
  )
}

