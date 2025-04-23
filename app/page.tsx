"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Só executar o redirecionamento quando o status não for "loading"
    if (status === "loading") return

    if (status === "authenticated") {
      // Log para depuração
      console.log("Root page - Session status:", status)
      console.log("Root page - Session data:", session)
      console.log("Root page - User role:", session?.user?.role)

      // Verificar se o usuário é visitante
      const isVisitante = session?.user?.role === "visitante" || session?.user?.tipoUsuario === "visitante"

      // Redirecionar para vitrines se for visitante
      if (isVisitante) {
        console.log("Visitante autenticado - Redirecionando para vitrines")
        window.location.href = "/vitrines"
        return
      }

      // Para outros tipos de usuários
      if (session?.user?.role === "admin") {
        console.log("Admin - Redirecionando para admin")
        window.location.href = "/admin" // Usar window.location.href em vez de router.replace
      } else {
        console.log("Usuário regular - Redirecionando para dashboard")
        window.location.href = "/dashboard" // Usar window.location.href em vez de router.replace
      }
    } else if (status === "unauthenticated") {
      console.log("Usuário não autenticado - Redirecionando para login")
      router.replace("/login")
    }
  }, [status, session, router])

  // Mostrar um loader enquanto verifica a sessão
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>

        {/* Mostrar status atual para depuração */}
        <p className="text-xs text-muted-foreground mt-2">Status: {status}</p>
        {session?.user && (
          <div className="mt-2 text-xs text-muted-foreground">
            <p>Usuário: {session.user.email}</p>
            <p>Papel: {session.user.role || "não definido"}</p>
          </div>
        )}
      </div>
    </div>
  )
}
