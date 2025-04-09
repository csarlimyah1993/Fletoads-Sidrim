import { redirect } from "next/navigation"

export default function ConfiguracoesPage() {
  // Redirecionar para a página de segurança por padrão
  redirect("/dashboard/configuracoes/seguranca")
}

