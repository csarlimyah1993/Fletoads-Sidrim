import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { LojaPerfilForm } from "@/components/perfil/loja-perfil-form"

export default async function CriarLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Criar Loja</h1>
        <p className="text-muted-foreground">Preencha os dados da sua loja</p>
      </div>
      <LojaPerfilForm />
    </main>
  )
}

