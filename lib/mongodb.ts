import mongoose from "mongoose"

// Definindo a interface para o cache do mongoose
interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

// Estendendo o tipo global para incluir a propriedade mongoose
declare global {
  var mongooseCache: MongooseCache | undefined
}

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

// Inicializando o cache
const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null }

if (!global.mongooseCache) {
  global.mongooseCache = cached
}

export async function connectToDatabase() {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout após 5 segundos
      connectTimeoutMS: 10000, // Timeout de conexão após 10 segundos
    }

    // Usando asserção de tipo para garantir que MONGODB_URI seja tratado como string
    cached.promise = mongoose
      .connect(MONGODB_URI as string, opts)
      .then((mongooseInstance) => {
        console.log("MongoDB conectado com sucesso")
        return mongooseInstance
      })
      .catch((err) => {
        console.error("Erro ao conectar ao MongoDB:", err)
        cached.promise = null
        throw err
      })
  }

  try {
    cached.conn = await cached.promise
    return cached.conn
  } catch (e) {
    cached.promise = null
    throw e
  }
}

// Função para verificar se a conexão está ativa
export async function isConnected() {
  try {
    // Verificar se já está conectado
    // Usando type assertion para evitar erros de tipo
    // 1 = connected no mongoose
    if ((mongoose.connection.readyState as number) === 1) {
      return true
    }

    // Tenta conectar com um timeout curto
    await connectToDatabase()
    return (mongoose.connection.readyState as number) === 1
  } catch (error) {
    console.error("Erro ao verificar conexão:", error)
    return false
  }
}

