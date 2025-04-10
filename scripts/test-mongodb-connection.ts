import { connectToDatabase, isConnected } from "../lib/mongodb"

async function testConnection() {
  console.log("Testando conexão com o MongoDB...")

  try {
    await connectToDatabase()
    const connected = await isConnected()

    if (connected) {
      console.log("✅ Conexão com o MongoDB estabelecida com sucesso!")
    } else {
      console.error("❌ Falha ao conectar com o MongoDB")
    }
  } catch (error) {
    console.error("❌ Erro ao testar conexão:", error)
  }
}

testConnection()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Erro não tratado:", error)
    process.exit(1)
  })
