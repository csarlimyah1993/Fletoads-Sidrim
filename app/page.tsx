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
      // Verificar se o usuário é visitante
      const isVisitante = session?.user?.role === "visitante" || session?.user?.tipoUsuario === "visitante"

      // Redirecionar para vitrines se for visitante
      if (isVisitante) {
        console.log("Visitante autenticado - Redirecionando para vitrines")
        router.replace("/vitrines")
        return
      }

      // Para outros tipos de usuários
      if (session?.user?.role === "admin") {
        console.log("Admin - Redirecionando para admin")
        router.replace("/admin")
      } else {
        console.log("Usuário regular - Redirecionando para dashboard")
        router.replace("/dashboard")
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
      </div>
    </div>
  )
}
