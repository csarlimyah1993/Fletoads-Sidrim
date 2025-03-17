import type React from "react"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { connectToDatabase } from "@/lib/mongodb"
import Loja from "@/lib/models/loja"
import Produto from "@/lib/models/produto"
import mongoose from "mongoose"

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  try {
    await connectToDatabase()

    // Aguardar os parâmetros antes de acessar suas propriedades
    const resolvedParams = await params
    const id = resolvedParams.id

    // Verificar se o ID é de um produto
    if (mongoose.Types.ObjectId.isValid(id)) {
      const produto = await Produto.findById(id)
      if (produto) {
        // Se for um produto, buscar a loja para mostrar informações combinadas
        const loja = await Loja.findById(produto.lojaId)
        if (loja) {
          return {
            title: `${produto.nome} - ${loja.nome}`,
            description: produto.descricao || `Detalhes do produto ${produto.nome} na loja ${loja.nome}`,
          }
        }

        return {
          title: produto.nome,
          description: produto.descricao || `Detalhes do produto ${produto.nome}`,
        }
      }
    }

    // Verificar se o ID é um ObjectId válido
    let query: any = { slug: id }
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = { $or: [{ slug: id }, { _id: id }] }
    }

    // Buscar a loja pelo id ou slug
    const loja = await Loja.findOne(query)

    if (!loja) {
      return {
        title: "Loja não encontrada",
        description: "A loja que você está procurando não foi encontrada.",
      }
    }

    return {
      title: `${loja.nome} - Vitrine`,
      description: loja.descricao || `Conheça a loja ${loja.nome} e seus produtos.`,
    }
  } catch (error) {
    console.error("Erro ao gerar metadata:", error)
    return {
      title: "Vitrine",
      description: "Vitrine online",
    }
  }
}

export default function VitrineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">F</span>
              </div>
              <span className="font-bold">FletoAds</span>
            </div>
          </div>
        </div>
      </header>

      <main>
        <Suspense
          fallback={
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          }
        >
          {children}
        </Suspense>
      </main>

      <footer className="border-t mt-12">
        <div className="container mx-auto py-6 px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} FletoAds. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  )
}

