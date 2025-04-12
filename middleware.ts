import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Paths that don't require authentication
  const publicPaths = ["/login", "/cadastro", "/recuperar-senha", "/api/auth"]
  const isPublicPath = publicPaths.some((path) => pathname.startsWith(path))

  // API routes should pass through (except those that need auth checks)
  if (pathname.startsWith("/api/") && !pathname.startsWith("/api/protected/")) {
    return NextResponse.next()
  }

  // Check if the path is public
  if (isPublicPath) {
    return NextResponse.next()
  }

  // Check for authentication token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // If no token and trying to access protected route, redirect to login
  if (!token && !isPublicPath) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", encodeURI(pathname))
    return NextResponse.redirect(url)
  }

  // If token exists and user is trying to access login page, redirect to dashboard
  if (token && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Se o usuário está tentando acessar uma rota de loja, verificar se tem lojaId
  // Importante: Não redirecionar para evitar loops infinitos
  if (token && (pathname.startsWith("/dashboard/loja") || pathname === "/dashboard/perfil-da-loja")) {
    // Não redirecionar, apenas deixar passar - a página vai lidar com a ausência de lojaId
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
}
