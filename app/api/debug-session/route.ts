import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const headersList = await headers()

    // Extract cookies from headers
    const cookieHeader = headersList.get("cookie") || ""
    const cookies = cookieHeader.split(";").map((cookie: string) => cookie.trim())

    // Create a map of cookie names to values
    const cookieMap: Record<string, string> = {}
    cookies.forEach((cookie: string) => {
      const [name, ...rest] = cookie.split("=")
      if (name) cookieMap[name] = rest.join("=")
    })

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      sessionExists: !!session,
      sessionData: session,
      headers: {
        cookie: cookieMap,
      },
    })
  } catch (error) {
    console.error("Error in debug-session route:", error)
    return NextResponse.json(
      {
        error: "Failed to get session information",
        errorMessage: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
