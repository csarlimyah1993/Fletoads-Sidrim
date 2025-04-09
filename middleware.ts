import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"
import type { JWT } from "next-auth/jwt"

// Vamos melhorar a verificação de admin no middleware

// Modifique a função para verificar tanto role quanto cargo:
export function isAdmin(token: JWT | null): boolean {
  return !!token && (token.role === "admin" || token.cargo === "admin")
}

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Verificar se o usuário está autenticado
  if (!token) {
    const url = new URL("/login", request.url)
    url.searchParams.set("callbackUrl", request.nextUrl.pathname)
    return NextResponse.redirect(url)
  }

  // Verificar permissões para rotas administrativas
  if (request.nextUrl.pathname.startsWith("/admin") && !isAdmin(token)) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/campanhas/:path*", "/panfletos/:path*", "/clientes/:path*"],
}
