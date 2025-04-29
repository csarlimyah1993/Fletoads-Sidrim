import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    // Simple approach without using headers or cookies
    return NextResponse.json({
      authenticated: !!session,
      session,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in debug route:", error)
    return NextResponse.json(
      {
        error: "Failed to get session information",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
