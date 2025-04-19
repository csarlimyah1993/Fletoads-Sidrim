import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "../../../lib/auth"
import { connectToDatabase } from "@/lib/mongodb"

// Definindo a interface Panfleto como opcional para todos os campos
interface Panfleto {
  userId?: string
  visualizacoes?: number
  cliques?: number
  [key: string]: any
}

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Falha ao conectar ao banco de dados")
    }

    // Verificar e criar coleções se não existirem
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c: any) => c.name)

    // Dados padrão para retornar se as coleções não existirem
    const defaultData = {
      panfletos: [],
      vendas: [],
      clientes: [],
      estatisticas: {
        totalVisualizacoes: 0,
        totalCliques: 0,
        totalVendas: 0,
        totalClientes: 0,
      },
    }

    // Verificar e criar coleções necessárias
    const requiredCollections = ["panfletos", "vendas", "clientes"]
    for (const collName of requiredCollections) {
      if (!collectionNames.includes(collName)) {
        await db.createCollection(collName)
      }
    }

    // Buscar dados de visualizações e cliques dos panfletos
    const panfletos = collectionNames.includes("panfletos")
      ? ((await db.collection("panfletos").find({ userId: session.user.id }).toArray()) as unknown as Panfleto[])
      : ([] as Panfleto[])

    // Buscar dados de vendas
    const vendas = collectionNames.includes("vendas")
      ? await db.collection("vendas").find({ userId: session.user.id }).sort({ date: -1 }).limit(5).toArray()
      : []

    // Buscar dados de clientes
    const clientes = collectionNames.includes("clientes")
      ? await db.collection("clientes").find({ userId: session.user.id }).sort({ createdAt: -1 }).limit(5).toArray()
      : []

    // Calcular estatísticas
    const totalVisualizacoes = panfletos.reduce((acc: number, p: Panfleto) => acc + (p.visualizacoes || 0), 0)
    const totalCliques = panfletos.reduce((acc: number, p: Panfleto) => acc + (p.cliques || 0), 0)
    const totalVendas = collectionNames.includes("vendas")
      ? await db.collection("vendas").countDocuments({ userId: session.user.id })
      : 0
    const totalClientes = collectionNames.includes("clientes")
      ? await db.collection("clientes").countDocuments({ userId: session.user.id })
      : 0

    return NextResponse.json({
      panfletos,
      vendas,
      clientes,
      estatisticas: {
        totalVisualizacoes,
        totalCliques,
        totalVendas,
        totalClientes,
      },
    })
  } catch (error) {
    console.error("Erro ao buscar dados do dashboard:", error)
    return NextResponse.json({ error: "Erro ao buscar dados do dashboard" }, { status: 500 })
  }
}

