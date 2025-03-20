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
          error: "MONGODB_URI environment variable is not defined",
        },
        { status: 500 },
      )
    }

    // Connect to MongoDB
    connection = await mongoose.connect(MONGODB_URI)

    // Get all collections
    let collections: mongoose.mongo.CollectionInfo[] = []
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      collections = await mongoose.connection.db.listCollections().toArray()
    }

    const collectionNames = collections.map((c) => c.name)

    // Find collections that might contain users
    const userCollections = collectionNames.filter(
      (name) => name.toLowerCase().includes("user") || name.toLowerCase().includes("usuario"),
    )

    const results: any = {}

    // Check each potential user collection
    for (const collectionName of userCollections) {
      if (mongoose.connection.db) {
        const collection = mongoose.connection.db.collection(collectionName)
        const users = await collection.find({}).toArray()

        // Remove sensitive data for security
        const sanitizedUsers = users.map((user) => {
          const { senha, password, hash, passwordHash, ...rest } = user
          return {
            ...rest,
            hasPasswordField: !!(senha || password || hash || passwordHash),
            passwordFieldName: senha
              ? "senha"
              : password
                ? "password"
                : hash
                  ? "hash"
                  : passwordHash
                    ? "passwordHash"
                    : "none",
          }
        })

        results[collectionName] = sanitizedUsers
      }
    }

    return NextResponse.json({
      collections: collectionNames,
      userCollections,
      results,
    })
  } catch (error) {
    console.error("Error checking raw user:", error)
    return NextResponse.json(
      {
        error: "Error checking raw user",
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

