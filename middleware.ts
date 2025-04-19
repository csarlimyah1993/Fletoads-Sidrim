import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/perfil"

  // Check if the path is auth related
  const isAuthPath = pathname === "/login" || pathname === "/cadastro" || pathname === "/esqueci-senha"

  // Get the token with detailed logging
  console.log("Middleware: Checking token for path", pathname)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
    secureCookie: process.env.NODE_ENV === "production",
  })

  console.log(
    "Middleware: Token result",
    token ? "Token exists" : "No token",
    token ? `User ID: ${token.sub}, Role: ${token.role || "user"}` : "",
  )

  // Redirect unauthenticated users to login page if they're trying to access protected routes
  if (isProtectedPath && !token) {
    console.log("Middleware: Redirecting to login - no token for protected path")
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users to dashboard if they're trying to access auth routes
  if (isAuthPath && token) {
    console.log("Middleware: Redirecting to dashboard - user already authenticated")
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  console.log("Middleware: Allowing request to proceed")
  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/perfil", "/login", "/cadastro", "/esqueci-senha"],
}
