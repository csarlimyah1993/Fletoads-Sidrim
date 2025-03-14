import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// Rotas que não precisam de autenticação
const publicRoutes = ["/login", "/cadastro", "/vitrine-publica", "/vitrine-publica-nova"]

export function middleware(request: NextRequest) {
  // Desativando temporariamente o middleware de autenticação para fins de teste
  return NextResponse.next()

  /* Código original comentado para facilitar o teste
  const currentUser = request.cookies.get('currentUser')?.value
  const { pathname } = request.nextUrl

  // Verifica se a rota atual é pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  )

  // Se não estiver autenticado e não for uma rota pública, redireciona para o login
  if (!currentUser && !isPublicRoute) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Se estiver autenticado e tentar acessar o login, redireciona para o dashboard
  if (currentUser && pathname === '/login') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
  */
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}

