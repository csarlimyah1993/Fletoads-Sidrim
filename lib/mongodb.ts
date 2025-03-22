import { MongoClient, type Db } from "mongodb"

const MONGODB_URI = process.env.MONGODB_URI!

// Variáveis para cache da conexão
let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

export async function connectToDatabase() {
  // Se já temos uma conexão, retornamos ela
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Configurações para evitar timeouts e melhorar a performance
  // Removendo opções não suportadas: keepAlive e keepAliveInitialDelay
  const opts = {
    maxPoolSize: 10, // Aumenta o número máximo de conexões no pool
    minPoolSize: 5, // Mantém um mínimo de conexões ativas
    socketTimeoutMS: 60000, // Aumenta o timeout do socket para 60 segundos
    connectTimeoutMS: 60000, // Aumenta o timeout de conexão para 60 segundos
    serverSelectionTimeoutMS: 60000, // Aumenta o timeout de seleção do servidor para 60 segundos
    waitQueueTimeoutMS: 30000, // Timeout para a fila de espera aumentado para 30 segundos
  }

  try {
    // Conecta ao cliente
    const client = new MongoClient(MONGODB_URI, opts)
    await client.connect()

    // Extrai o nome do banco de dados da URI
    const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] || "prod-db"
    console.log("Conectando ao banco de dados:", dbName)

    const db = client.db(dbName)

    // Salva a conexão no cache
    cachedClient = client
    cachedDb = db

    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

// Função para verificar a conexão com o MongoDB
export async function checkDatabaseConnection() {
  try {
    const { client } = await connectToDatabase()
    const adminDb = client.db().admin()
    const result = await adminDb.ping()
    return result.ok === 1
  } catch (error) {
    console.error("Erro ao verificar conexão com o MongoDB:", error)
    return false
  }
}

