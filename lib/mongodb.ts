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
    }

    // Usando asserção de tipo para garantir que MONGODB_URI seja tratado como string
    cached.promise = mongoose.connect(MONGODB_URI as string).then((mongooseInstance) => {
      return mongooseInstance
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}

