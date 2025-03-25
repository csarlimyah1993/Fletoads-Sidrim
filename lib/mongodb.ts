import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

let cachedDb: mongoose.Connection | null = null
let cachedClient: mongoose.mongo.MongoClient | null = null

export async function connectToDatabase() {
  // Se já temos uma conexão, retorne-a
  if (cachedDb && cachedDb.readyState === 1) {
    console.log("=> Usando conexão existente com MongoDB")
    return { db: cachedDb.db, client: cachedClient }
  }

  // Limpar conexões antigas se existirem
  if (cachedDb) {
    console.log("=> Limpando conexão antiga com MongoDB")
    await mongoose.connection.close()
    cachedDb = null
    cachedClient = null
  }

  // Configurar opções de conexão
  const options: mongoose.ConnectOptions = {
    connectTimeoutMS: 60000,
    socketTimeoutMS: 60000,
    serverSelectionTimeoutMS: 60000,
    heartbeatFrequencyMS: 10000,
    maxPoolSize: 10,
    minPoolSize: 5,
  }

  console.log("=> Estabelecendo nova conexão com MongoDB")

  try {
    // Garantir que MONGODB_URI é uma string
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI não está definido")
    }

    // Conectar ao MongoDB
    await mongoose.connect(MONGODB_URI, options)

    // Aumentar o limite de listeners para evitar avisos
    mongoose.connection.setMaxListeners(20)

    // Armazenar a conexão em cache
    cachedDb = mongoose.connection
    cachedClient = mongoose.connection.getClient()

    console.log("=> Conectado ao MongoDB com sucesso via MongoClient")

    // Retornar a conexão
    return {
      db: mongoose.connection.db,
      client: cachedClient,
    }
  } catch (error) {
    console.error("=> Erro ao conectar ao MongoDB:", error)
    throw error
  }
}

