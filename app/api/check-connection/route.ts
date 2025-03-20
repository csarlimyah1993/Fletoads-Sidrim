import { type NextRequest, NextResponse } from "next/server"
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    // Connect directly to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "MONGODB_URI environment variable is not defined" }, { status: 500 })
    }

    console.log(`Connecting to MongoDB at ${MONGODB_URI.substring(0, 20)}...`)

    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB successfully")

    // Get all collections
    const collections = (await mongoose.connection.db?.listCollections().toArray()) || []
    const collectionNames = collections.map((c) => c.name)

    // Check if Usuario collection exists
    const usuarioCollectionExists = collectionNames.includes("usuarios")

    // Define the Usuario schema directly
    const usuarioSchema = new mongoose.Schema({
      nome: String,
      email: String,
      senha: String,
      role: String,
    })

    // Get the model (or create it if it doesn't exist)
    const UsuarioModel = mongoose.models.Usuario || mongoose.model("Usuario", usuarioSchema)

    // Count users
    const userCount = await UsuarioModel.countDocuments()

    // Get all users (without sensitive data)
    const users = await UsuarioModel.find({}).select("email nome role -_id")

    return NextResponse.json({
      connected: true,
      collections: collectionNames,
      usuarioCollectionExists,
      userCount,
      users,
      mongodbUri: MONGODB_URI.substring(0, 20) + "...",
    })
  } catch (error) {
    console.error("Database connection error:", error)
    return NextResponse.json(
      {
        connected: false,
        error: "Error connecting to database",
        details: error instanceof Error ? error.message : String(error),
        mongodbUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 20) + "..." : "undefined",
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

