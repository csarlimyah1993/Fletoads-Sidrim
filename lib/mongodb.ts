import { MongoClient, ServerApiVersion } from "mongodb"
import mongoose from "mongoose"

if (!process.env.MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

const uri = process.env.MONGODB_URI
const options = {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  // Aumentar os timeouts para evitar erros de conexão
  connectTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  // Configurações adicionais para melhorar a estabilidade
  maxPoolSize: 10,
  minPoolSize: 5,
  maxIdleTimeMS: 60000,
  waitQueueTimeoutMS: 30000,
}

// Variável para rastrear o estado da conexão
let isConnected = false
let cachedClient: MongoClient | null = null
let cachedDb: any = null

// Função para conectar ao MongoDB
export async function connectToDatabase() {
  // Verificar se estamos no servidor
  if (typeof window !== "undefined") {
    throw new Error("Esta função só pode ser chamada no servidor")
  }

  if (isConnected && cachedClient && cachedDb) {
    console.log("=> Usando conexão existente com MongoDB")
    return { client: cachedClient, db: cachedDb }
  }

  try {
    console.log("=> Estabelecendo nova conexão com MongoDB")

    // Conectar com Mongoose
    await mongoose.connect(uri, options as any)
    isConnected = true
    console.log("=> Conectado ao MongoDB com sucesso via Mongoose")

    // Também conectar com MongoClient para operações que precisam do driver nativo
    if (!cachedClient) {
      cachedClient = new MongoClient(uri, options)
      await cachedClient.connect()
      cachedDb = cachedClient.db()
    }

    return { client: cachedClient, db: cachedDb }
  } catch (error) {
    console.error("=> Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

// Configurar eventos de conexão
mongoose.connection.on("connected", () => {
  console.log("Mongoose conectado ao MongoDB")
  isConnected = true
})

mongoose.connection.on("error", (err) => {
  console.error("Erro na conexão do Mongoose:", err)
  isConnected = false
})

mongoose.connection.on("disconnected", () => {
  console.warn("Mongoose desconectado. Tentando reconectar...")
  isConnected = false
})

// Exportar o cliente do MongoDB para uso direto quando necessário
let clientPromise: Promise<MongoClient>

// Verificar se estamos no servidor
if (typeof window === "undefined") {
  // Código do lado do servidor
  let client: MongoClient

  if (process.env.NODE_ENV === "development") {
    // Em desenvolvimento, use uma variável global para que a conexão
    // seja mantida entre recarregamentos de página
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<MongoClient>
    }

    if (!globalWithMongo._mongoClientPromise) {
      client = new MongoClient(uri, options)
      globalWithMongo._mongoClientPromise = client.connect()
    }
    clientPromise = globalWithMongo._mongoClientPromise
  } else {
    // Em produção, é melhor não usar uma variável global
    client = new MongoClient(uri, options)
    clientPromise = client.connect()
  }
} else {
  // No cliente, retornamos uma promessa que nunca resolve
  // Isso evita erros, mas o código cliente nunca deve chamar isso
  clientPromise = new Promise(() => {
    console.error("Tentativa de usar MongoDB no cliente")
  }) as any
}

export default clientPromise

