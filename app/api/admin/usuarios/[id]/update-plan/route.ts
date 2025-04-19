import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario"
import { getServerSession } from "next-auth"
import { authOptions } from "../../../../../../lib/auth"
import mongoose from "mongoose"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Await the params to get the id
    const { id } = await params

    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const { planoId } = await request.json()

    // Update user's plan
    const updatedUser = await Usuario.findByIdAndUpdate(
      id,
      {
        plano: planoId === "none" ? null : planoId ? new mongoose.Types.ObjectId(planoId) : null,
      },
      { new: true },
    )
      .select("-senha")
      .populate("plano", "nome slug _id")

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating user plan:", error)
    return NextResponse.json({ error: "Error updating user plan" }, { status: 500 })
  }
}
