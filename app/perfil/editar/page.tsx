import { Header } from "@/components/header"
import { EditarPerfilContent } from "@/components/editar-perfil-content"

export default function EditarPerfilPage() {
  return (
    <>
      <Header />
      <div className="p-4">
        <EditarPerfilContent />
      </div>
    </>
  )
}

