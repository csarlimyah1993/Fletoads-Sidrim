import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      authenticated: !!session,
      session: session
        ? {
            user: {
              ...session.user,
              email: session.user.email ? `${session.user.email.substring(0, 3)}...` : null,
            },
            expires: session.expires,
          }
        : null,
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Not set",
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ? process.env.COOKIE_DOMAIN : "Not set",
        NODE_ENV: process.env.NODE_ENV,
      },
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
