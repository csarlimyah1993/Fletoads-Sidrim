import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/cadastro", "/esqueci-senha"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Rotas de administrador
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Se for uma rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Se não estiver autenticado, redirecionar para login
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se for uma rota de admin mas o usuário não é admin, redirecionar para dashboard
  if (isAdminRoute && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Se for um usuário normal tentando acessar o dashboard de admin, redirecionar para dashboard normal
  if (request.nextUrl.pathname === "/admin/dashboard" && token.role !== "admin") {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // Se for um admin tentando acessar o dashboard normal, redirecionar para dashboard de admin
  if (request.nextUrl.pathname === "/dashboard" && token.role === "admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Rotas que precisam de autenticação
    "/dashboard/:path*",
    "/admin/:path*",
    "/perfil/:path*",
    "/vitrine/:path*",
    // Rotas de autenticação
    "/login",
    "/cadastro",
    "/esqueci-senha",
  ],
}
