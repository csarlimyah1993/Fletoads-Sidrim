import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { hash } from "bcryptjs"

export async function POST(request: NextRequest) {
  let connection = null

  try {
    const { email, password, nome } = await request.json()

    if (!email || !password || !nome) {
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
    const usuarioSchema = new mongoose.Schema(
      {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        senha: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
      },
      { timestamps: true },
    )

    // Get the model with the correct collection name
    const UsuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema, collectionName)

    // Check if admin already exists
    const existingAdmin = await UsuarioModel.findOne({ email })

    if (existingAdmin) {
      return NextResponse.json({
        success: false,
        message: "Admin user already exists",
        user: { email: existingAdmin.email, nome: existingAdmin.nome },
      })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)
    console.log(`Password hash created: ${hashedPassword.substring(0, 10)}...`)

    // Create admin user
    const newAdmin = await UsuarioModel.create({
      email,
      nome,
      senha: hashedPassword,
      role: "admin",
    })

    return NextResponse.json({
      success: true,
      message: "Admin user created successfully",
      user: { email: newAdmin.email, nome: newAdmin.nome, role: newAdmin.role },
      collectionName,
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error creating admin user",
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

