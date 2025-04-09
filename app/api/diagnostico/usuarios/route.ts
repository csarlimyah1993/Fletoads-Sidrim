import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    // Conectar ao banco de dados
    const { db } = await connectToDatabase()

    // Listar todas as coleções
    const collections = await db.listCollections().toArray()
    const collectionNames = collections.map((c) => c.name)

    // Verificar se a coleção de usuários existe
    const usuariosCollectionExists = collectionNames.includes("usuarios")
    const usersCollectionExists = collectionNames.includes("users")

    // Verificar a coleção correta
    let usuariosCollection = "usuarios"
    if (!usuariosCollectionExists && usersCollectionExists) {
      usuariosCollection = "users"
    }

    // Contar documentos na coleção de usuários
    const usuariosCount = await db.collection(usuariosCollection).countDocuments()

    // Buscar o primeiro usuário para verificar a estrutura
    const primeiroUsuario = await db.collection(usuariosCollection).findOne({})
    const estruturaUsuario = primeiroUsuario ? Object.keys(primeiroUsuario) : []

    // Buscar especificamente o usuário com o email sidrimthiago@gmail.com
    const usuarioEspecifico = await db.collection(usuariosCollection).findOne({ email: "sidrimthiago@gmail.com" })

    // Verificar se existe um usuário com email em formato diferente (case insensitive)
    const usuarioRegex = await db.collection(usuariosCollection).findOne({
      email: { $regex: /^sidrimthiago@gmail.com$/i },
    })

    return NextResponse.json({
      collections: collectionNames,
      usuariosCollectionExists,
      usersCollectionExists,
      usuariosCollection,
      usuariosCount,
      estruturaUsuario,
      usuarioEspecifico: usuarioEspecifico
        ? {
            _id: usuarioEspecifico._id.toString(),
            email: usuarioEspecifico.email,
            nome: usuarioEspecifico.nome || usuarioEspecifico.name,
          }
        : null,
      usuarioRegex: usuarioRegex
        ? {
            _id: usuarioRegex._id.toString(),
            email: usuarioRegex.email,
            nome: usuarioRegex.nome || usuarioRegex.name,
          }
        : null,
    })
  } catch (error) {
    console.error("Erro ao diagnosticar usuários:", error)
    return NextResponse.json(
      { error: "Erro ao diagnosticar usuários", details: error instanceof Error ? error.message : "Erro desconhecido" },
      { status: 500 },
    )
  }
}
