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

        const passwordInfo = users.map((user) => {
          const passwordFields: any = {}

          // Check common password field names
          ;["senha", "password", "hash", "passwordHash"].forEach((field) => {
            if (user[field]) {
              const value = user[field]
              const isHashed =
                typeof value === "string" &&
                (value.startsWith("$2a$") || value.startsWith("$2b$") || value.startsWith("$2y$"))

              passwordFields[field] = {
                exists: true,
                value: value.substring(0, 20) + "...",
                isHashed,
                type: isHashed ? "bcrypt hash" : "plain text",
              }
            } else {
              passwordFields[field] = { exists: false }
            }
          })

          return {
            _id: user._id,
            email: user.email,
            nome: user.nome,
            role: user.role,
            passwordFields,
          }
        })

        results[collectionName] = passwordInfo
      }
    }

    return NextResponse.json({
      collections: collectionNames,
      userCollections,
      results,
    })
  } catch (error) {
    console.error("Error checking password type:", error)
    return NextResponse.json(
      {
        error: "Error checking password type",
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

