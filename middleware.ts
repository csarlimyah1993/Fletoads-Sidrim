// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Configuração do matcher - Removendo rotas públicas
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/perfil/:path*",
    "/vitrine/:path*",
  ],
}

export async function middleware(request: NextRequest) {
  // Log para depuração
  console.log("Middleware executando em:", request.nextUrl.pathname)
  
  try {
    // Verificar se o cookie de sessão existe
    const sessionCookie = request.cookies.get("next-auth.session-token")
    
    // Se não houver cookie, redirecionar para login
    if (!sessionCookie) {
      console.log("Nenhum cookie de sessão encontrado, redirecionando para login")
      const baseUrl = request.nextUrl.origin
      return NextResponse.redirect(new URL("/login", baseUrl))
    }

    // Verificações de role podem ser adicionadas posteriormente
    // Por enquanto, apenas permitir acesso se o cookie existir
    return NextResponse.next()
  } catch (error) {
    console.error("Erro no middleware:", error)
    // Em caso de erro, redirecionar para login
    const baseUrl = request.nextUrl.origin
    return NextResponse.redirect(new URL("/login", baseUrl))
  }
}