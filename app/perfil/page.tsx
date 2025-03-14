import { Header } from "@/components/header"
import { PerfilContent } from "@/components/perfil-content"

export default function PerfilPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <PerfilContent />
      </div>
    </>
  )
}

