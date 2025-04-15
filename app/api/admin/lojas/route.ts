import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { MongoClient } from "mongodb"

import { authOptions } from "@/lib/auth"

const MONGODB_URI = process.env.MONGODB_URI || ""

// Connect to MongoDB
async function connectToDatabase() {
  try {
    const client = await MongoClient.connect(MONGODB_URI)
    const dbName = MONGODB_URI.split("/").pop()?.split("?")[0] || "prod-db"
    const db = client.db(dbName)
    return { client, db }
  } catch (error) {
    console.error("Error connecting to MongoDB:", error)
    throw error
  }
}

export async function GET() {
  try {
    // Verificar autenticação e autorização
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 })
    }

    // Conectar ao banco de dados
    const { client, db } = await connectToDatabase()

    try {
      // Buscar lojas
      const lojas = await db.collection("lojas").find({}).sort({ createdAt: -1 }).limit(100).toArray()

      // Log para depuração
      console.log("Dados de lojas recuperados:", JSON.stringify(lojas.slice(0, 2)))

      // Transformar os dados se necessário para garantir compatibilidade
      const lojasFormatadas = lojas.map((loja) => {
        // Garantir que o endereço seja uma string se for um objeto
        if (loja.endereco && typeof loja.endereco === "object") {
          const { rua, numero, complemento, bairro, cidade, estado } = loja.endereco
          let enderecoFormatado = ""

          if (rua) enderecoFormatado += rua
          if (numero) enderecoFormatado += `, ${numero}`
          if (complemento) enderecoFormatado += ` - ${complemento}`
          if (bairro) enderecoFormatado += `, ${bairro}`

          // Manter o objeto original, mas adicionar uma versão formatada
          loja.enderecoFormatado = enderecoFormatado || "—"
        }

        return loja
      })

      return NextResponse.json({ lojas: lojasFormatadas })
    } finally {
      await client.close()
    }
  } catch (error) {
    console.error("Erro ao buscar lojas:", error)
    return NextResponse.json({ error: "Erro ao buscar lojas" }, { status: 500 })
  }
}
