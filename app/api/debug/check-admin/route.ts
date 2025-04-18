import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import mongoose from "mongoose"
import Usuario from "@/lib/models/usuario"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Check if admin user exists (without returning sensitive data)
    const adminUser = await Usuario.findOne({ role: "admin" }).select("email nome role -_id")

    if (!adminUser) {
      return NextResponse.json({ exists: false, message: "Admin user not found" }, { status: 404 })
    }

    // Check if the connection is established and db is available
    let collections: mongoose.mongo.CollectionInfo[] = []
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      collections = await mongoose.connection.db.listCollections().toArray()
    }

    return NextResponse.json({
      exists: true,
      user: adminUser,
      collections: collections.map((c) => c.name),
    })
  } catch (error) {
    console.error("Error checking admin:", error)
    return NextResponse.json({ error: "Error checking admin user" }, { status: 500 })
  }
}

