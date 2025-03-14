import { Header } from "@/components/header"
import { PersonalizacaoContent } from "@/components/personalizacao-content"

export default function PersonalizacaoPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <PersonalizacaoContent />
      </div>
    </>
  )
}

