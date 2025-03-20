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
          connected: false,
          error: "MONGODB_URI environment variable is not defined",
        },
        { status: 500 },
      )
    }

    console.log(`Connecting to MongoDB at ${MONGODB_URI.substring(0, 20)}...`)

    // Connect to MongoDB
    connection = await mongoose.connect(MONGODB_URI)
    console.log("Connected to MongoDB successfully")

    // Get database name and collections
    let dbName = ""
    let collectionNames: string[] = []

    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      dbName = mongoose.connection.db.databaseName
      const collections = await mongoose.connection.db.listCollections().toArray()
      collectionNames = collections.map((c) => c.name)
    }

    // Check if Usuario collection exists
    const usuarioCollectionExists = collectionNames.includes("usuarios")

    return NextResponse.json({
      connected: true,
      dbName,
      collections: collectionNames,
      usuarioCollectionExists,
      connectionState: mongoose.connection.readyState,
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
    if (connection && mongoose.connection.readyState === 1) {
      await mongoose.disconnect()
      console.log("Disconnected from MongoDB")
    }
  }
}

