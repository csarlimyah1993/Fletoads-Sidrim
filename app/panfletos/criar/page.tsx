import { redirect } from "next/navigation"

export default function CriarPanfletoRedirect() {
  // Redirecionamento no lado do servidor
  redirect("/panfletos/criar/v7")
}

