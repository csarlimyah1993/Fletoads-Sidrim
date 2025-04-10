import { MongoClient, type Db } from "mongodb"
import mongoose from "mongoose"

// Obter a URI e o nome do banco de dados das variáveis de ambiente
const MONGODB_URI = process.env.MONGODB_URI || ""
// Extrair o nome do banco de dados da URI ou usar o valor padrão
const MONGODB_DB = process.env.MONGODB_DB || extractDatabaseName(MONGODB_URI) || "fletoads"

// Função para extrair o nome do banco de dados da URI
function extractDatabaseName(uri: string): string | null {
  try {
    // Formato típico: mongodb://user:password@host:port/database?options
    const dbNameMatch = uri.match(/\/([^/?]+)(\?|$)/)
    if (dbNameMatch && dbNameMatch[1]) {
      return dbNameMatch[1]
    }
    return null
  } catch (error) {
    console.error("Erro ao extrair nome do banco de dados da URI:", error)
    return null
  }
}

if (!MONGODB_URI) {
  throw new Error("Por favor, defina a variável de ambiente MONGODB_URI")
}

// Log para depuração
console.log(`Conectando ao banco de dados: ${MONGODB_DB}`)

// Configurações do Mongoose para evitar timeouts
mongoose.set("bufferCommands", false) // Desativa o buffer de comandos
mongoose.set("bufferTimeoutMS", 30000) // Aumenta o timeout para 30 segundos

let cachedClient: MongoClient | null = null
let cachedDb: Db | null = null
let isConnecting = false
let mongooseConnected = false

export async function connectToDatabase() {
  // Se já temos uma conexão, retorne-a
  if (cachedClient && cachedDb) {
    return { client: cachedClient, db: cachedDb }
  }

  // Evita múltiplas tentativas de conexão simultâneas
  if (isConnecting) {
    // Espera até que a conexão seja estabelecida
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return connectToDatabase()
  }

  isConnecting = true

  try {
    // Conectar ao MongoDB com opções robustas
    const client = await MongoClient.connect(MONGODB_URI, {
      // Opções para tornar a conexão mais robusta
      connectTimeoutMS: 30000, // 30 segundos de timeout para conexão
      socketTimeoutMS: 45000, // 45 segundos de timeout para operações
      maxPoolSize: 50, // Aumenta o número máximo de conexões no pool
      minPoolSize: 5, // Mantém pelo menos 5 conexões no pool
    })

    const db = client.db(MONGODB_DB)

    cachedClient = client
    cachedDb = db

    console.log(`Conectado ao MongoDB com sucesso. Banco: ${MONGODB_DB}`)

    // Verificar se a coleção "usuarios" existe, se não, criar
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)
    // Verificar se a coleção "usuarios" existe, se não, criar
    if (!collectionNames.some((c) => c === "usuarios")) {
      console.log("Coleção 'usuarios' não encontrada. Criando...")
      await db.createCollection("usuarios")
      console.log("Coleção 'usuarios' criada com sucesso")
    }

    // Conectar também o Mongoose se ainda não estiver conectado
    if (!mongooseConnected) {
      await connectMongoose()
    }

    return { client, db }
  } catch (error) {
    console.error("Erro ao conectar ao MongoDB:", error)
    isConnecting = false
    throw new Error(`Falha ao conectar ao banco de dados: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    isConnecting = false
  }
}

export async function connectMongoose() {
  if (mongoose.connection.readyState === 1) {
    mongooseConnected = true
    return mongoose.connection
  }

  try {
    // Configurações para tornar a conexão Mongoose mais robusta
    const options = {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      serverSelectionTimeoutMS: 30000,
      heartbeatFrequencyMS: 10000,
      maxPoolSize: 50,
      minPoolSize: 5,
      dbName: MONGODB_DB, // Especificar o nome do banco de dados
    }

    await mongoose.connect(MONGODB_URI, options)
    mongooseConnected = true
    console.log(`Mongoose conectado com sucesso ao banco: ${MONGODB_DB}`)
    return mongoose.connection
  } catch (error) {
    console.error("Erro ao conectar o Mongoose:", error)
    mongooseConnected = false
    throw new Error(
      `Falha ao conectar o Mongoose ao banco de dados: ${error instanceof Error ? error.message : String(error)}`,
    )
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
      "users", // Adicionando a coleção "users" também
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
    // console.log("Coleções existentes:", existingCollections)

    // Criar coleções que não existem
    for (const collectionName of requiredCollections) {
      if (!existingCollections.includes(collectionName)) {
        // console.log(`Criando coleção: ${collectionName}`)
        await db.createCollection(collectionName)
      }
    }

    // console.log("Verificação de coleções concluída")
    return true
  } catch (error) {
    console.error("Erro ao verificar/criar coleções:", error)
    return false
  }
}

// Função para reconectar em caso de falha
export async function reconnectIfNeeded() {
  if (mongoose.connection.readyState !== 1) {
    console.log("Reconectando ao MongoDB...")
    await connectMongoose()
  }

  if (!cachedClient || !cachedDb) {
    console.log("Reconectando cliente MongoDB...")
    await connectToDatabase()
  }
}

// Função para executar uma operação com retry
export async function withRetry<T>(operation: () => Promise<T>, maxRetries = 3): Promise<T> {
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Verificar e reconectar se necessário
      await reconnectIfNeeded()

      // Executar a operação
      return await operation()
    } catch (error: any) {
      lastError = error
      console.error(`Tentativa ${attempt} falhou:`, error)

      // Se não for o último retry, espere antes de tentar novamente
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Backoff exponencial
        console.log(`Tentando novamente em ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}
