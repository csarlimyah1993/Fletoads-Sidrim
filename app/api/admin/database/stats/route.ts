import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

// Definindo uma interface para a coleção
interface Collection {
  name: string
}

// Definindo uma interface para as estatísticas da coleção
interface CollectionStats {
  count: number
  size: number
  avgObjSize: number
  storageSize: number
  nindexes: number
}

export async function GET(request: NextRequest) {
  try {
    // Verificar se o usuário está autenticado e é admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ status: "error", message: "Não autorizado" }, { status: 401 })
    }

    const { db } = await connectToDatabase()

    // Obter estatísticas gerais do banco de dados
    const dbStats = await db.stats()

    // Obter lista de coleções
    const collections = (await db.listCollections().toArray()) as Collection[]

    // Obter estatísticas para cada coleção
    const collectionsStats = await Promise.all(
      collections.map(async (collection: Collection) => {
        const stats = (await db.collection(collection.name).stats()) as CollectionStats
        return {
          name: collection.name,
          count: stats.count,
          size: stats.size,
          avgObjSize: stats.avgObjSize || 0,
          storageSize: stats.storageSize,
          indexes: stats.nindexes,
        }
      }),
    )

    // Ordenar coleções por tamanho (decrescente)
    collectionsStats.sort((a, b) => b.size - a.size)

    return NextResponse.json({
      status: "success",
      data: {
        name: db.databaseName,
        collections: collectionsStats,
        stats: {
          db: db.databaseName,
          collections: dbStats.collections,
          views: dbStats.views || 0,
          objects: dbStats.objects,
          avgObjSize: dbStats.avgObjSize,
          dataSize: dbStats.dataSize,
          storageSize: dbStats.storageSize,
          indexes: dbStats.indexes,
          indexSize: dbStats.indexSize,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching database stats:", error)
    return NextResponse.json(
      { status: "error", message: "Failed to fetch database stats", error: (error as Error).message },
      { status: 500 },
    )
  }
}

