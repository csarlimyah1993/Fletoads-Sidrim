import { getServerSession } from "next-auth/next"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    return NextResponse.json({
      authenticated: !!session,
      session,
    })
  } catch (error) {
    console.error("Error in session route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
