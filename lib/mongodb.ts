import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI || ""
const MONGODB_DB = process.env.MONGODB_DB || "fletoads"

// Verificar se a URI do MongoDB está definida
if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

interface MongoConnection {
  client: MongoClient
  db: Db
}

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

export async function connectToDatabase(): Promise<MongoConnection> {
  // Se já temos uma conexão, retorne-a
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Configurações para evitar timeout
  const options = {
    connectTimeoutMS: 30000,
    socketTimeoutMS: 30000,
    serverSelectionTimeoutMS: 30000,
    maxPoolSize: 10,
    minPoolSize: 5,
  }

  try {
    // Conectar ao cliente
    const client = await MongoClient.connect(MONGODB_URI, options)
    const db = client.db(MONGODB_DB)

    // Armazenar em cache para reutilização
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

