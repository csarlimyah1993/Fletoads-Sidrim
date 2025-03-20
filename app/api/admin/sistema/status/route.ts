import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import mongoose from "mongoose"
import os from "os"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Database status
    const dbStatus = {
      connected: mongoose.connection.readyState === 1,
      name: mongoose.connection.db?.databaseName || "Unknown",
    }

    // Get collection stats
    let collections: any[] = []
    if (mongoose.connection.readyState === 1 && mongoose.connection.db) {
      try {
        const collectionNames = await mongoose.connection.db.listCollections().toArray()
        collections = collectionNames.map((c) => ({
          name: c.name,
          type: c.type,
        }))
      } catch (error) {
        console.error("Error fetching collections:", error)
        collections = []
      }
    }

    // System info
    const systemInfo = {
      platform: os.platform(),
      arch: os.arch(),
      cpus: os.cpus().length,
      totalMemory: Math.round(os.totalmem() / (1024 * 1024 * 1024)) + " GB",
      freeMemory: Math.round(os.freemem() / (1024 * 1024 * 1024)) + " GB",
      uptime: Math.round(os.uptime() / 3600) + " hours",
      nodeVersion: process.version,
    }

    // Environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV || "development",
      nextAuthUrl: process.env.NEXTAUTH_URL ? "Configured" : "Not configured",
      mongodbUri: process.env.MONGODB_URI ? "Configured" : "Not configured",
    }

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      database: dbStatus,
      collections: collections,
      system: systemInfo,
      environment: envInfo,
    })
  } catch (error) {
    console.error("Error fetching system status:", error)
    return NextResponse.json(
      {
        error: "Error fetching system status",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

