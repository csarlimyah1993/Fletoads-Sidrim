import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { compare } from "bcryptjs"

export async function POST(request: NextRequest) {
  let connection = null

  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Connect directly to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "MONGODB_URI environment variable is not defined" }, { status: 500 })
    }

    // Connect to MongoDB
    connection = await mongoose.connect(MONGODB_URI)

    // Get the actual collection name for usuarios
    let collectionName = "usuarios"
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray()
      const usuarioCollection = collections.find(
        (c) => c.name.toLowerCase().includes("usuario") || c.name.toLowerCase().includes("users"),
      )

      if (usuarioCollection) {
        collectionName = usuarioCollection.name
      }
    }

    console.log(`Using collection name: ${collectionName}`)

    // Define the Usuario schema directly
    const usuarioSchema = new mongoose.Schema({
      nome: String,
      email: String,
      senha: String,
      role: String,
    })

    // Get the model with the correct collection name
    const UsuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema, collectionName)

    // Find the user
    const user = await UsuarioModel.findOne({ email })

    if (!user) {
      return NextResponse.json({
        valid: false,
        error: "User not found",
      })
    }

    // Check if senha field exists
    if (!user.senha) {
      return NextResponse.json({
        valid: false,
        error: "Password field is missing",
        user: { email: user.email, nome: user.nome, role: user.role },
      })
    }

    // Verify password
    console.log(`Verifying password hash: ${user.senha.substring(0, 10)}...`)
    const isValid = await compare(password, user.senha)

    return NextResponse.json({
      valid: isValid,
      message: isValid ? "Password is valid" : "Password is invalid",
      user: { email: user.email, nome: user.nome, role: user.role },
    })
  } catch (error) {
    console.error("Error verifying password:", error)
    return NextResponse.json(
      {
        valid: false,
        error: "Error verifying password",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    // Close the connection
    if (connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
    }
  }
}

