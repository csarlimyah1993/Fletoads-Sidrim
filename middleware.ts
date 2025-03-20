import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/login", "/register", "/api/auth"]
  const isPublicPath = publicPaths.some((publicPath) => path === publicPath || path.startsWith(publicPath + "/"))

  // Define admin paths that require admin role
  const isAdminPath = path.startsWith("/admin")

  // Define user paths that require authentication
  const userPaths = [
    "/dashboard",
    "/panfletos",
    "/hot-promos",
    "/produtos",
    "/vitrine",
    "/vendas",
    "/pan-assistant",
    "/notificacoes",
    "/clientes-proximos",
    "/sinalizacao-visual",
    "/analytics",
    "/clientes",
    "/campanhas",
    "/suporte",
    "/integracoes",
  ]
  const isUserPath = userPaths.some((userPath) => path === userPath || path.startsWith(userPath + "/"))

  // If it's a public path, allow access
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Get the token and check if the user is authenticated
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token and trying to access a protected route, redirect to login
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(request.url))
    return NextResponse.redirect(url)
  }

  // If trying to access admin routes but not an admin, redirect to dashboard
  if (isAdminPath && token.role !== "admin") {
    console.log("Non-admin user trying to access admin route:", token)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Allow access to the requested page
  return NextResponse.next()
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes that don't start with /api/auth or /api/admin
    // - Static files (images, favicon, etc.)
    // - Public files
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}

