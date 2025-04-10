import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { UsuarioPerfilForm } from "@/components/perfil/usuario-form"
import { connectToDatabase } from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"

export const metadata = {
  title: "Editar Perfil",
  description: "Edite suas informações de perfil",
}

export default async function EditarPerfilPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login?callbackUrl=/perfil-usuario/editar")
  }

  // Buscar dados do usuário diretamente do servidor
  await connectToDatabase()
  const usuario = await Usuario.findById(session.user.id).lean()

  if (!usuario) {
    redirect("/login?callbackUrl=/perfil-usuario/editar&error=user-not-found")
  }

  // Função para converter objetos MongoDB para objetos serializáveis
  function serializeMongoObject(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj
    }

    if (typeof obj === "object") {
      if (obj instanceof Date) {
        return obj.toISOString()
      }

      // Converter ObjectId para string
      if (
        obj._bsontype === "ObjectID" ||
        (obj.toString && typeof obj.toString === "function" && /^[0-9a-fA-F]{24}$/.test(obj.toString()))
      ) {
        return obj.toString()
      }

      // Se for um array, mapear cada item
      if (Array.isArray(obj)) {
        return obj.map((item) => serializeMongoObject(item))
      }

      // Se for um objeto, processar cada propriedade
      const serialized: any = {}
      for (const [key, value] of Object.entries(obj)) {
        serialized[key] = serializeMongoObject(value)
      }
      return serialized
    }

    return obj
  }

  // Converter o objeto do MongoDB para um objeto serializável
  const usuarioData = serializeMongoObject(usuario)

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Editar Perfil</h1>
      <UsuarioPerfilForm initialData={usuarioData} />
    </div>
  )
}
