import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { LojaPerfilForm } from "@/components/perfil/loja-form"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"
import { redirect } from "next/navigation"

// Função para serializar objetos MongoDB
function serializeData(data: any) {
  if (!data) return null

  // Converter _id para string
  if (data._id) {
    data._id = data._id.toString()
  }

  // Converter datas para strings
  if (data.dataCriacao) {
    data.dataCriacao = data.dataCriacao instanceof Date ? data.dataCriacao.toISOString() : data.dataCriacao
  }

  if (data.dataAtualizacao) {
    data.dataAtualizacao =
      data.dataAtualizacao instanceof Date ? data.dataAtualizacao.toISOString() : data.dataAtualizacao
  }

  if (data.dataFundacao) {
    data.dataFundacao = data.dataFundacao instanceof Date ? data.dataFundacao.toISOString() : data.dataFundacao
  }

  // Converter usuarioId para string se existir
  if (data.usuarioId) {
    data.usuarioId = data.usuarioId.toString()
  }

  return JSON.parse(JSON.stringify(data))
}

async function getLoja() {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return null
    }

    await connectToDatabase()

    // Verificar se o modelo Usuario existe
    let Usuario
    try {
      Usuario = mongoose.model("Usuario")
    } catch (e) {
      // Se não existir, criar o modelo
      const UsuarioSchema = new mongoose.Schema({
        nome: String,
        email: String,
        senha: String,
        role: String,
        ativo: Boolean,
      })

      Usuario = mongoose.model("Usuario", UsuarioSchema)
    }

    // Buscar o usuário pelo email - corrigindo o erro de TypeScript
    const usuario = await (Usuario.findOne({ email: session.user.email }) as unknown as Promise<any>)

    if (!usuario) {
      return null
    }

    // Ensure we have a database connection
    if (!mongoose.connection || !mongoose.connection.db) {
      console.error("Conexão com o banco de dados não estabelecida")
      await connectToDatabase() // Try to reconnect

      if (!mongoose.connection || !mongoose.connection.db) {
        throw new Error("Não foi possível estabelecer conexão com o banco de dados")
      }
    }

    // Acessar diretamente a coleção "lojas"
    const db = mongoose.connection.db
    const lojasCollection = db.collection("lojas")

    // Buscar a loja do usuário usando o ID como string
    const userId = usuario._id.toString()
    let loja = await lojasCollection.findOne({
      $or: [{ usuarioId: userId }, { usuarioId: new mongoose.Types.ObjectId(userId) }],
    })

    if (!loja) {
      // Se não encontrar, tentar na coleção "vitrines"
      const vitrinesCollection = db.collection("vitrines")
      loja = await vitrinesCollection.findOne({
        $or: [{ usuarioId: userId }, { usuarioId: new mongoose.Types.ObjectId(userId) }],
      })
    }

    // Serializar os dados antes de retornar
    return serializeData(loja)
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export default async function EditarPerfilDaLojaPage() {
  const loja = await getLoja()

  if (!loja) {
    redirect("/dashboard/perfil-da-loja/criar")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Editar Perfil da Loja</h1>
      </div>
      <Suspense fallback={<Skeleton className="h-[500px]" />}>
        <LojaPerfilForm loja={loja} isEditing={true} />
      </Suspense>
    </div>
  )
}

