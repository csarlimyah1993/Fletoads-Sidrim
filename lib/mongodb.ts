import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ""
const MONGODB_DB = process.env.MONGODB_DB || "fletoads"

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase() {
  // Se já temos uma conexão, retorne-a
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Conectar ao MongoDB
  try {
    const client = await MongoClient.connect(MONGODB_URI)
    const db = client.db(MONGODB_DB)

    cachedClient = client
    cachedDb = db

    console.log("Conectado ao MongoDB com sucesso")
    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    throw new Error("Falha ao conectar ao banco de dados")
  }
}

export async function isConnected() {
  try {
    const { client } = await connectToDatabase()
    await client.db().admin().ping()
    return true
  } catch (error) {
    console.error("Erro ao verificar conexão com o MongoDB:", error)
    return false
  }
}

export async function ensureCollectionsExist() {
  try {
    const { db } = await connectToDatabase()

    // Lista de coleções que devem existir
    const requiredCollections = [
      "usuarios",
      "lojas",
      "vitrines",
      "produtos",
      "panfletos",
      "campanhas",
      "clientes",
      "vendas",
      "notificacoes",
    ]

    // Obter lista de coleções existentes
    const collections = await db.listCollections().toArray()
    const existingCollections = collections.map((c) => c.name)

    // Criar coleções que não existem
    for (const collectionName of requiredCollections) {
      if (!existingCollections.includes(collectionName)) {
        console.log(`Criando coleção: ${collectionName}`)
        await db.createCollection(collectionName)
      }
    }

    console.log("Verificação de coleções concluída")
    return true
  } catch (error) {
    console.error("Erro ao verificar/criar coleções:", error)
    return false
  }
}
