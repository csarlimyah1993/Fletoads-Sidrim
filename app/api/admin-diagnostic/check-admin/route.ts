import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  let connection = null

  try {
    // Connect directly to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      return NextResponse.json(
        {
          exists: false,
          error: "MONGODB_URI environment variable is not defined",
        },
        { status: 500 },
      )
    }

    // Connect to MongoDB
    connection = await mongoose.connect(MONGODB_URI)

    // Define the Usuario schema directly
    const usuarioSchema = new mongoose.Schema({
      nome: String,
      email: String,
      senha: String,
      role: String,
    })

    // Get the model (or create it if it doesn't exist)
    const UsuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema)

    // Check if admin user exists
    const adminUser = await UsuarioModel.findOne({ email: "adminfletoads@gmail.com" }).select("-senha")

    if (!adminUser) {
      return NextResponse.json({
        exists: false,
        message: "Admin user not found",
      })
    }

    // Check if the collection name is correct
    let collectionNames: string[] = []
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      const collections = await mongoose.connection.db.listCollections().toArray()
      collectionNames = collections.map((c) => c.name)
    }

    return NextResponse.json({
      exists: true,
      user: adminUser,
      collectionName: collectionNames.find((name) => name.toLowerCase().includes("usuario")),
    })
  } catch (error) {
    console.error("Error checking admin:", error)
    return NextResponse.json(
      {
        exists: false,
        error: "Error checking admin user",
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

