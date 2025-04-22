"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Page() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    // Log session data for debugging
    console.log("Root page - Session status:", status)
    console.log("Root page - Session data:", session)

    // Only proceed if we have a definitive status
    if (status === "loading") return

    if (status === "authenticated") {
      // Force a direct check of the role
      const isAdmin = session?.user?.role === "admin"
      console.log("User authenticated, isAdmin:", isAdmin)

      if (isAdmin) {
        console.log("ADMIN USER DETECTED - Redirecting to admin dashboard")
        // Use window.location for a hard redirect if router.replace isn't working
        window.location.href = "/admin"
      } else {
        console.log("Regular user - Redirecting to user dashboard")
        window.location.href = "/dashboard"
      }
    } else {
      console.log("User is not authenticated, redirecting to login")
      router.replace("/login")
    }
  }, [status, session, router])

  // Mostra um loader enquanto verifica a sessão
  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Carregando...</p>

        {/* Show current status for debugging */}
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
