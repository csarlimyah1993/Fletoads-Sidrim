import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../lib/auth"

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await params

    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Get user by ID
    const user = await Usuario.findById(id).select("-senha").populate("plano", "nome slug _id")

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json({ error: "Error fetching user" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await params

    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    // Delete user
    const result = await Usuario.findByIdAndDelete(id)

    if (!result) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "User deleted successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error deleting user" }, { status: 500 })
  }
}
