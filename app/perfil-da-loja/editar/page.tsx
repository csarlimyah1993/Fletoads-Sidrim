import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Loja } from "@/lib/models/loja"
import { redirect } from "next/navigation"
import { LojaPerfilForm } from "@/components/perfil/loja-perfil-form"

export default async function EditarLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/login")
  }

  await connectToDatabase()

  // Buscar a loja do usuário
  const loja = await Loja.findOne({ usuarioId: session.user.id })

  // Se não houver loja, redirecionar para a página de criação
  if (!loja) {
    redirect("/perfil-da-loja/criar")
  }

  return (
    <main className="container mx-auto py-6 px-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Editar Loja</h1>
        <p className="text-muted-foreground">Atualize os dados da sua loja</p>
      </div>
      <LojaPerfilForm loja={JSON.parse(JSON.stringify(loja))} isEditing={true} />
    </main>
  )
}

