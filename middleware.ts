// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { cookies } from "next/headers"
import { jwtVerify } from "jose"

// Configuração do matcher
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

// Função para verificar o token JWT
async function verifyToken(token: string) {
  if (!token) return null
  
  try {
    // Verificar o token usando jose (compatível com Edge Runtime)
    const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "")
    const { payload } = await jwtVerify(token, secret)
    return payload
  } catch (error) {
    console.error("Erro ao verificar token:", error)
    return null
  }
}

export async function middleware(request: NextRequest) {
  // Log para depuração
  console.log("Middleware executando em:", request.nextUrl.pathname)
  
  // Rotas públicas que não precisam de autenticação
  const publicRoutes = ["/login", "/cadastro", "/esqueci-senha"]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Se for uma rota pública, permitir acesso
  if (isPublicRoute) {
    return NextResponse.next()
  }

  // Obter o token do cookie
  const sessionToken = request.cookies.get("next-auth.session-token")?.value || 
                       request.cookies.get("__Secure-next-auth.session-token")?.value
  
  if (!sessionToken) {
    console.log("Nenhum token de sessão encontrado, redirecionando para login")
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(new URL("/login", baseUrl))
  }

  // Verificar o token
  const payload = await verifyToken(sessionToken)
  
  if (!payload) {
    console.log("Token inválido, redirecionando para login")
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(new URL("/login", baseUrl))
  }

  // Rotas de administrador
  const adminRoutes = ["/admin"]
  const isAdminRoute = adminRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Se for uma rota de admin mas o usuário não é admin, redirecionar para dashboard
  if (isAdminRoute && payload.role !== "admin") {
    console.log("Usuário não é admin, redirecionando para dashboard")
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(new URL("/dashboard", baseUrl))
  }

  // Se for um usuário normal tentando acessar o dashboard de admin, redirecionar para dashboard normal
  if (request.nextUrl.pathname === "/admin/dashboard" && payload.role !== "admin") {
    console.log("Usuário normal tentando acessar dashboard admin")
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(new URL("/dashboard", baseUrl))
  }

  // Se for um admin tentando acessar o dashboard normal, redirecionar para dashboard de admin
  if (request.nextUrl.pathname === "/dashboard" && payload.role === "admin") {
    console.log("Admin tentando acessar dashboard normal")
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(new URL("/admin/dashboard", baseUrl))
  }

  return NextResponse.next()
}