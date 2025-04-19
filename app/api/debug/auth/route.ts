import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"

export async function GET() {
  const session = await getServerSession(authOptions)
  // Update the cookies handling to properly await the Promise
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()

  // Fix: Add proper type for cookie
  const safeCookies = allCookies.map(
    (cookie: {
      name: string
      value: string
      path?: string
      expires?: number
      domain?: string
      httpOnly?: boolean
      secure?: boolean
      sameSite?: string
    }) => ({
      name: cookie.name,
      value: cookie.name.includes("next-auth") ? "[REDACTED]" : cookie.value,
      path: cookie.path,
      expires: cookie.expires,
      domain: cookie.domain,
      httpOnly: cookie.httpOnly,
      secure: cookie.secure,
      sameSite: cookie.sameSite,
    }),
  )

  return NextResponse.json(
    {
      authenticated: !!session,
      session: session
        ? {
            user: {
              ...session.user,
              // Redact any sensitive fields
              email: session.user.email ? `${session.user.email.substring(0, 3)}...` : null,
            },
            expires: session.expires,
          }
        : null,
      cookies: safeCookies,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "Set" : "Not set",
        COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ? "Set" : "Not set",
      },
    },
    { status: 200 },
  )
}
