import { connectToDatabase } from "../lib/mongodb"
import mongoose from "mongoose"

async function testConnection() {
  console.log("Testando conexão com o MongoDB...")

  try {
    const { db } = await connectToDatabase()

    if (!db) {
      throw new Error("Falha ao conectar ao banco de dados")
    }

    // Verificar o estado da conexão
    console.log("Estado da conexão Mongoose:", mongoose.connection.readyState)
    // 0 = desconectado, 1 = conectado, 2 = conectando, 3 = desconectando

    if (mongoose.connection.readyState === 1) {
      console.log("Conexão com o MongoDB estabelecida com sucesso!")

      // Testar uma operação simples
      const collections = await db.listCollections().toArray()
      console.log(
        "Coleções disponíveis:",
        collections.map((c: any) => c.name),
      )

      // Verificar configurações de timeout
      console.log("Configurações de timeout:")
      console.log("- connectTimeoutMS:", mongoose.connection.config.connectTimeoutMS)
      console.log("- socketTimeoutMS:", mongoose.connection.config.socketTimeoutMS)
      console.log("- serverSelectionTimeoutMS:", mongoose.connection.config.serverSelectionTimeoutMS)
    } else {
      console.error("Falha ao conectar com o MongoDB. Estado:", mongoose.connection.readyState)
    }
  } catch (error) {
    console.error("Erro ao testar conexão:", error)
  } finally {
    // Fechar a conexão
    await mongoose.connection.close()
    console.log("Conexão fechada.")
    process.exit(0)
  }
}

testConnection()

