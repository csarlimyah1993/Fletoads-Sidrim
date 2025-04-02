import { Suspense } from "react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import { LojaPerfilForm } from "@/components/perfil/loja-form"
import { Skeleton } from "@/components/ui/skeleton"
import { DatabaseErrorFallback } from "@/components/database-error-fallback"

// Função para serializar objetos MongoDB
function serializeMongoObject(obj: any) {
  if (!obj) return null

  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      // Converter ObjectId para string
      if (key === "_id" && value && typeof value === "object" && value.toString) {
        return value.toString()
      }
      // Converter datas para strings ISO
      if (value instanceof Date) {
        return value.toISOString()
      }
      return value
    }),
  )
}

export default async function EditarPerfilLojaPage() {
  let lojaData = null
  let error = null

  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return <div>Não autorizado. Por favor, faça login para acessar esta página.</div>
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Verificar se a conexão está estabelecida
    const connection = mongoose.connection
    if (!connection || !connection.db) {
      throw new Error("Conexão com o banco de dados não estabelecida")
    }

    // Buscar o usuário pelo email
    const db = connection.db
    const usuariosCollection = db.collection("usuarios")
    const usuario = await usuariosCollection.findOne({ email: session.user.email })

    if (!usuario) {
      throw new Error("Usuário não encontrado")
    }

    // Buscar a loja do usuário
    const lojasCollection = db.collection("lojas")
    const userId = usuario._id.toString()

    const loja = await lojasCollection.findOne({
      $or: [{ usuarioId: userId }, { usuarioId: new mongoose.Types.ObjectId(userId) }],
    })

    if (loja) {
      // Serializar o objeto MongoDB para um objeto JavaScript simples
      lojaData = serializeMongoObject(loja)
      console.log("Loja encontrada e serializada:", lojaData)
    } else {
      console.log("Nenhuma loja encontrada para o usuário:", userId)
    }
  } catch (err) {
    console.error("Erro ao buscar dados da loja:", err)
    error = err instanceof Error ? err.message : "Erro desconhecido"
  }

  if (error) {
    return <DatabaseErrorFallback errorMessage={error} />
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Editar Perfil da Loja</h1>
      <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
        <LojaPerfilForm loja={lojaData} />
      </Suspense>
    </div>
  )
}

