import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is protected
  const isProtectedPath = pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname === "/perfil"

  // Check if the path is admin specific
  const isAdminPath = pathname.startsWith("/admin")

  // Check if the path is user dashboard
  const isUserDashboard = pathname.startsWith("/dashboard")

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

  // Check for admin access - redirect non-admin users away from admin routes
  if (isAdminPath && token && token.role !== "admin") {
    console.log("Middleware: Unauthorized admin access attempt by user with role:", token.role)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect admin users to admin dashboard if they try to access user dashboard
  if (isUserDashboard && token && token.role === "admin") {
    console.log("Middleware: Admin user accessing user dashboard, redirecting to admin dashboard")
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Redirect authenticated users to appropriate dashboard if they're trying to access auth routes
  if (isAuthPath && token) {
    console.log("Middleware: Redirecting authenticated user - user already authenticated")
    // If user is admin, redirect to admin dashboard
    if (token.role === "admin") {
      console.log("Middleware: Redirecting admin to admin dashboard")
      return NextResponse.redirect(new URL("/admin", request.url))
    }
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Redirect root path based on role
  if (pathname === "/" && token) {
    if (token.role === "admin") {
      console.log("Middleware: Root path - redirecting admin to admin dashboard")
      return NextResponse.redirect(new URL("/admin", request.url))
    } else {
      console.log("Middleware: Root path - redirecting user to user dashboard")
      return NextResponse.redirect(new URL("/dashboard", request.url))
    }
  }

  console.log("Middleware: Allowing request to proceed")
  return NextResponse.next()
}

// Update the matcher to include the root path
export const config = {
  matcher: ["/", "/dashboard/:path*", "/admin/:path*", "/perfil", "/login", "/cadastro", "/esqueci-senha"],
}
