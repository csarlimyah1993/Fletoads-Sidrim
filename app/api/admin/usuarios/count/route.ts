import { type NextRequest, NextResponse } from "next/server"
import connectToDatabase from "@/lib/mongodb"
import Usuario from "@/lib/models/usuario" // Corrected path

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()

    // Count total users
    const totalUsers = await Usuario.countDocuments()

    // Count users by role
    const adminUsers = await Usuario.countDocuments({ role: "admin" })
    const regularUsers = await Usuario.countDocuments({ role: "user" })

    // Count users created in the last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newUsers = await Usuario.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    })

    return NextResponse.json({
      total: totalUsers,
      admins: adminUsers,
      users: regularUsers,
      newUsers: newUsers,
    })
  } catch (error) {
    console.error("Error fetching user counts:", error)
    return NextResponse.json(
      {
        error: "Error fetching user counts",
      },
      { status: 500 },
    )
  }
}

