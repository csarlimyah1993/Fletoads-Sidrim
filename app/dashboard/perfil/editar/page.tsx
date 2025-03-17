import type { Metadata } from "next"
import PerfilEditorPageClient from "./perfil-editor-page-client"

export const metadata: Metadata = {
  title: "Editar Perfil",
  description: "Edite seu perfil e informações da loja",
}

export default function PerfilEditorPage() {
  return <PerfilEditorPageClient />
}

