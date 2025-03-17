import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { connectToDatabase } from "@/lib/mongodb"
import Produto from "@/lib/models/produto"
import { notFound, redirect } from "next/navigation"
import mongoose from "mongoose"

async function ProdutoRedirect({ produtoId }: { produtoId: string }) {
  try {
    console.log(`ProdutoRedirect - Redirecionando para: ${produtoId}`)
    await connectToDatabase()

    if (!mongoose.Types.ObjectId.isValid(produtoId)) {
      console.error(`ID de produto inválido: ${produtoId}`)
      notFound()
    }

    // Verificar se o produto existe
    const produto = await Produto.findById(produtoId)
    if (!produto) {
      console.error(`Produto não encontrado: ${produtoId}`)
      notFound()
    }

    // Redirecionar para a URL da vitrine com o ID do produto
    return redirect(`/vitrine/${produtoId}`)
  } catch (error) {
    console.error("Erro ao redirecionar:", error)
    notFound()
  }
}

export default function ProdutoPage({ params }: { params: { produtoId: string } }) {
  return (
    <div className="min-h-screen bg-background">
      <Suspense
        fallback={
          <div className="flex justify-center items-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        }
      >
        <ProdutoRedirect produtoId={params.produtoId} />
      </Suspense>
    </div>
  )
}

