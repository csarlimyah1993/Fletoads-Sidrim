import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario" // Corrected path
import mongoose from "mongoose"

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    // Calculate skip value for pagination
    const skip = (page - 1) * limit

    // Build query - exclude only the specific admin user by ID
    // This way we keep all other users regardless of their role
    const adminId = "67d8ea4a2a6b50ba34deb252"

    let query: any = {
      _id: { $ne: new mongoose.Types.ObjectId(adminId) },
    }

    if (search) {
      query = {
        _id: { $ne: new mongoose.Types.ObjectId(adminId) },
        $or: [{ nome: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }],
      }
    }

    // Get users with pagination
    const users = await Usuario.find(query)
      .select("-senha")
      .populate("plano", "nome slug")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    // Get total count for pagination
    const total = await Usuario.countDocuments(query)

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        error: "Error fetching users",
      },
      { status: 500 },
    )
  }
}

