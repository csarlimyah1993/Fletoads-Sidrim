import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { hash } from "bcryptjs"

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
        success: false,
        error: "User not found",
      })
    }

    // Hash the new password
    const hashedPassword = await hash(password, 10)
    console.log(`New password hash created: ${hashedPassword.substring(0, 10)}...`)

    // Update the user's password
    user.senha = hashedPassword
    await user.save()

    return NextResponse.json({
      success: true,
      message: "Password reset successfully",
      user: { email: user.email, nome: user.nome, role: user.role },
    })
  } catch (error) {
    console.error("Error resetting password:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error resetting password",
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

