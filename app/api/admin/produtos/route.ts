import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    await connectToDatabase()

    // Buscar todos os produtos
    const Produto = mongoose.models.Produto || mongoose.model("Produto", new mongoose.Schema({}, { strict: false }))
    const Loja = mongoose.models.Loja || mongoose.model("Loja", new mongoose.Schema({}, { strict: false }))

    const produtos = await Produto.find({}).lean()

    // Para cada produto, buscar informações da loja
    const produtosComInfo = await Promise.all(
      produtos.map(async (produto: any) => {
        // Buscar loja
        const loja = produto.lojaId ? await Loja.findById(produto.lojaId).select("nome").lean() : null

        return {
          _id: produto._id.toString(),
          nome: produto.nome || "Sem nome",
          preco: produto.preco || 0,
          descricao: produto.descricao || "",
          categoria: produto.categoria || "Sem categoria",
          estoque: produto.estoque || 0,
          loja: loja ? { _id: loja._id.toString(), nome: loja.nome } : null,
          ativo: produto.ativo !== false, // Se não for explicitamente false, considera como true
          createdAt: produto.createdAt ? produto.createdAt.toISOString() : null,
          updatedAt: produto.updatedAt ? produto.updatedAt.toISOString() : null,
        }
      }),
    )

    return NextResponse.json({ produtos: produtosComInfo })
  } catch (error) {
    console.error("Erro ao buscar produtos:", error)
    return NextResponse.json(
      { error: "Erro ao buscar produtos", message: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}

