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

    if (userCollections.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No user collections found",
      })
    }

    // Hash the password
    const hashedPassword = await hash(password, 10)
    console.log(`Password hash created: ${hashedPassword}`)

    const results: any = {}

    // Try to update the user in each potential user collection
    for (const collectionName of userCollections) {
      if (mongoose.connection.db) {
        const collection = mongoose.connection.db.collection(collectionName)

        // Find the user
        const user = await collection.findOne({ email })

        if (user) {
          // Update with senha field
          const result1 = await collection.updateOne({ email }, { $set: { senha: hashedPassword } })

          // Also update with password field for safety
          const result2 = await collection.updateOne({ email }, { $set: { password: hashedPassword } })

          results[collectionName] = {
            found: true,
            senhaUpdateResult: result1,
            passwordUpdateResult: result2,
          }
        } else {
          results[collectionName] = { found: false }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Password update attempted on all user collections",
      results,
    })
  } catch (error) {
    console.error("Error fixing admin password:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error fixing admin password",
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

