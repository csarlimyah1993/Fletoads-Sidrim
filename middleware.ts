import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Caminhos públicos que não precisam de autenticação
  const publicPaths = ["/login", "/cadastro", "/registro", "/esqueci-senha", "/", "/vitrines", "/planos"]

  // Se o caminho for público ou começar com um caminho público, permitir acesso sem verificação
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`))) {
    console.log(`Middleware: Caminho público: ${pathname}, permitindo acesso`)
    return NextResponse.next()
  }

  // Verificar token de autenticação
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  console.log(`Middleware: Token para ${pathname}:`, token ? "Presente" : "Ausente")
  if (token) {
    console.log(`Middleware: Role do usuário: ${token.role}`)
  }

  // Se não houver token e o caminho for protegido, redirecionar para login
  if (!token) {
    console.log(`Middleware: Sem token para caminho protegido: ${pathname}, redirecionando para login`)
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Verificações específicas para caminhos administrativos
  if (pathname.startsWith("/admin") && token.role !== "admin") {
    console.log(`Middleware: Acesso não autorizado à área admin por usuário com papel: ${token.role}`)
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // ADICIONAR ESTA VERIFICAÇÃO: Redirecionar admins para área admin quando tentam acessar dashboard
  if (pathname.startsWith("/dashboard") && token.role === "admin") {
    console.log(`Middleware: Admin tentando acessar dashboard, redirecionando para área admin`)
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  // Verificações específicas para visitantes
  if (token.role === "visitante") {
    // Visitantes só podem acessar vitrines, perfil-visitante e páginas públicas
    if (pathname.startsWith("/dashboard")) {
      console.log(`Middleware: Visitante tentando acessar dashboard, redirecionando para vitrines`)
      return NextResponse.redirect(new URL("/vitrines", request.url))
    }
  }

  // Permitir acesso para usuários autenticados
  return NextResponse.next()
}

// Atualizar o matcher para incluir os caminhos necessários
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/admin/:path*",
    "/perfil",
    "/perfil-visitante",
    "/login",
    "/cadastro",
    "/registro",
    "/esqueci-senha",
    "/vitrines/:path*",
    "/planos/:path*",
  ],
}
