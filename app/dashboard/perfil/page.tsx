import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { LojaPerfilContent } from "@/components/perfil/loja-perfil-content"

export const metadata = {
  title: "Perfil da Loja | FletoAds",
  description: "Visualize e gerencie as informações da sua loja",
}

async function getLoja(userId: string) {
  try {
    const { db } = await connectToDatabase()

    const loja = await db.collection("lojas").findOne({ userId: userId })

    if (!loja) {
      return null
    }

    // Converter o ObjectId para string para serialização
    return {
      ...loja,
      _id: loja._id.toString(),
    }
  } catch (error) {
    console.error("Erro ao buscar loja:", error)
    return null
  }
}

export default async function PerfilDaLojaPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const userId = session.user.id
  const loja = await getLoja(userId)

  // Se não houver loja, podemos mostrar uma mensagem ou redirecionar para criar
  if (!loja) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <h1 className="text-2xl font-bold">Você ainda não possui uma loja cadastrada</h1>
        <p className="text-muted-foreground">Crie sua loja para começar a usar todos os recursos do FletoAds</p>
        <a href="/dashboard/perfil-da-loja/criar" className="text-primary hover:underline">
          Criar minha loja
        </a>
      </div>
    )
  }

  return <LojaPerfilContent loja={loja} />
}

