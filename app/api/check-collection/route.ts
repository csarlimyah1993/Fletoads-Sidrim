import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import mongoose from "mongoose"

export async function GET(request: Request) {
  try {
    console.log("Conectando ao banco de dados...")
    await connectToDatabase()
    console.log("Conexão com o banco de dados estabelecida")

    // Obter a lista de coleções
    const db = mongoose.connection.db
    if (!db) {
      throw new Error("Conexão com o banco de dados não estabelecida corretamente")
    }

    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    console.log("Coleções encontradas:", collectionNames)

    // Verificar se a coleção de usuários existe
    const usuariosCollectionName = collectionNames.find(
      (name) => name.toLowerCase() === "usuarios" || name.toLowerCase() === "users" || name.toLowerCase() === "usuario",
    )

    if (!usuariosCollectionName) {
      return NextResponse.json(
        {
          error: "Coleção de usuários não encontrada",
          availableCollections: collectionNames,
        },
        { status: 404 },
      )
    }

    // Contar documentos na coleção de usuários
    const count = await mongoose.connection.collection(usuariosCollectionName).countDocuments()

    // Obter uma amostra de documentos
    const sampleDocs = await mongoose.connection
      .collection(usuariosCollectionName)
      .find({})
      .limit(5)
      .project({
        _id: 1,
        email: 1,
        nome: 1,
        role: 1,
        senha: { $substr: ["$senha", 0, 10] },
      })
      .toArray()

    return NextResponse.json({
      success: true,
      collectionName: usuariosCollectionName,
      documentCount: count,
      sampleDocuments: sampleDocs,
    })
  } catch (error) {
    console.error("Erro ao verificar coleção:", error)
    return NextResponse.json({ error: "Erro ao verificar coleção: " + (error as Error).message }, { status: 500 })
  }
}

