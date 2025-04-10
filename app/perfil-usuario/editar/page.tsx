import { Suspense } from "react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Usuario from "@/lib/models/usuario"
import { PerfilForm } from "@/components/perfil/perfil-form"

export default async function EditarPerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.id) {
    redirect("/login")
  }

  // Get the user profile
  const user = await Usuario.findById(session.user.id)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>

      <Suspense fallback={<div>Carregando...</div>}>
        <PerfilForm user={user} />
      </Suspense>
    </div>
  )
}
