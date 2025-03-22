import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { CriarLojaForm } from "@/components/perfil/criar-loja-form"

export const metadata = {
  title: "Criar Loja | FletoAds",
  description: "Crie sua loja para começar a usar todos os recursos do FletoAds",
}

export default async function CriarLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Criar Nova Loja</h1>
      <CriarLojaForm userId={userId} />
    </div>
  )
}

