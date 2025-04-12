import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { Suspense } from "react"
import { PerfilForm } from "@/components/perfil/perfil-form"
import { connectToDatabase } from "@/lib/mongodb"
import { ObjectId } from "mongodb"

export default async function EditarPerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const { db } = await connectToDatabase()
  const userId = session.user.id

  // Buscar dados do usuário
  const user = await db.collection("usuarios").findOne({ _id: new ObjectId(userId) })

  if (!user) {
    redirect("/dashboard")
  }

  // Converter o documento do MongoDB para um objeto serializável
  const serializableUser = JSON.parse(JSON.stringify({
    ...user,
    _id: user._id.toString(),
    lojaId: user.lojaId ? user.lojaId.toString() : null,
    createdAt: user.createdAt ? user.createdAt.toISOString() : null,
    updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
    ultimoLogin: user.ultimoLogin ? user.ultimoLogin.toISOString() : null,
    dataCriacao: user.dataCriacao ? user.dataCriacao.toISOString() : null,
    dataAtualizacao: user.dataAtualizacao ? user.dataAtualizacao.toISOString() : null,
  }))

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>
      <Suspense fallback={<div>Carregando...</div>}>
        <PerfilForm user={serializableUser} />
      </Suspense>
    </div>
  )
}
