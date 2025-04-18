import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  // Log para depuração
  console.log("Middleware executando em:", request.nextUrl.pathname)
  
  try {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    // Log do token para depuração
    console.log("Token:", JSON.stringify(token, null, 2))

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
      console.log("Usuário não autenticado, redirecionando para login")
      const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
      return NextResponse.redirect(new URL("/login", baseUrl))
    }

    // Se for uma rota de admin mas o usuário não é admin, redirecionar para dashboard
    if (isAdminRoute && token.role !== "admin") {
      console.log("Usuário não é admin, redirecionando para dashboard")
      const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
      return NextResponse.redirect(new URL("/dashboard", baseUrl))
    }

    // Se for um usuário normal tentando acessar o dashboard de admin, redirecionar para dashboard normal
    if (request.nextUrl.pathname === "/admin/dashboard" && token.role !== "admin") {
      console.log("Usuário normal tentando acessar dashboard admin")
      const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
      return NextResponse.redirect(new URL("/dashboard", baseUrl))
    }

    // Se for um admin tentando acessar o dashboard normal, redirecionar para dashboard de admin
    if (request.nextUrl.pathname === "/dashboard" && token.role === "admin") {
      console.log("Admin tentando acessar dashboard normal")
      const baseUrl = process.env.NEXTAUTH_URL || request.nextUrl.origin
      return NextResponse.redirect(new URL("/admin/dashboard", baseUrl))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Erro no middleware:", error)
    // Em caso de erro, permitir o acesso e deixar a página lidar com a autenticação
    return NextResponse.next()
  }
}

// Mantenha seu matcher original por enquanto
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/perfil/:path*",
    "/vitrine/:path*",
    "/login",
    "/cadastro",
    "/esqueci-senha",
  ],
}