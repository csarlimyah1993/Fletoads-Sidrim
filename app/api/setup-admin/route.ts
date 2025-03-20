import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"
import { hash } from "bcryptjs"

// Direct database connection without using the cached connection
export async function POST(request: NextRequest) {
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

    console.log(`Connecting to MongoDB at ${MONGODB_URI.substring(0, 20)}...`)

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB successfully")

    // Define the Usuario schema directly in this file to avoid any import issues
    const usuarioSchema = new mongoose.Schema(
      {
        nome: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        senha: { type: String, required: true },
        role: { type: String, enum: ["admin", "user"], default: "user" },
      },
      { timestamps: true },
    )

    // Get the model (or create it if it doesn't exist)
    const UsuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema)

    // Check if admin already exists
    const existingAdmin = await UsuarioModel.findOne({ email })

    if (existingAdmin) {
      return NextResponse.json({
        message: "Admin user already exists",
        user: { email: existingAdmin.email, nome: existingAdmin.nome },
      })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)

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
    })
  } catch (error) {
    console.error("Error creating admin:", error)
    return NextResponse.json(
      {
        error: "Error creating admin user",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  } finally {
    // Close the connection
    if (mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
      console.log("Disconnected from MongoDB")
    }
  }
}

