// app/dashboard/perfil-da-loja/editar/page.tsx
export const dynamic = 'force-dynamic';

import { Suspense } from "react"
import { notFound } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase, ObjectId } from "@/lib/mongodb"
import { Skeleton } from "@/components/ui/skeleton"
import LojaPerfilFormWrapper from "@/components/perfil/loja-perfil-form-wrapper"

// Helper function to ensure all ObjectIds are converted to strings
function serializeData(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj
  }

  if (obj instanceof ObjectId) {
    return obj.toString()
  }

  if (Array.isArray(obj)) {
    return obj.map(serializeData)
  }

  if (typeof obj === "object" && obj !== null) {
    const result: Record<string, any> = {}
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        result[key] = serializeData(obj[key])
      }
    }
    return result
  }

  return obj
}

export default async function EditarPerfilLojaPage() {
  try {
    console.log("Iniciando página de edição de perfil da loja")
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      console.log("Usuário não autenticado")
      notFound()
    }

    console.log(`Usuário autenticado: ${session.user.id}`)
    const { db } = await connectToDatabase()

    // Buscar a loja do usuário
    console.log(`Buscando loja para o usuário: ${session.user.id}`)
    const loja = await db.collection("lojas").findOne({
      $or: [
        { userId: session.user.id },
        { userId: new ObjectId(session.user.id) },
        { usuarioId: session.user.id },
        { usuarioId: new ObjectId(session.user.id) },
      ],
    })

    if (!loja) {
      console.log("Loja não encontrada para o usuário")
      notFound()
    }

    console.log(`Loja encontrada: ${loja._id}`)

    // Serializar todos os dados para garantir que não haja problemas de serialização
    const lojaData = serializeData(loja)

    console.log("Dados da loja serializados com sucesso")

    // Extract the initial values from lojaData
    const initialValues = {
      nomeLoja: lojaData.nome || "",
      descricao: lojaData.descricao || "",
      logoUrl: lojaData.logo || "",
      bannerUrl: lojaData.banner || "",
    }

    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Editar Perfil da Loja</h1>
        <Suspense fallback={<Skeleton className="h-[600px] w-full" />}>
          <LojaPerfilFormWrapper lojaId={lojaData._id} initialValues={initialValues} />
        </Suspense>
      </div>
    )
  } catch (error) {
    console.error("Erro ao renderizar página de edição de perfil:", error)
    throw error // Re-throw to let Next.js handle it with its error boundary
  }
}