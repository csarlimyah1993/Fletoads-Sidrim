"use client"

import { useEffect } from "react"
import { signOut } from "next-auth/react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const performLogout = async () => {
      try {
        // Limpar localStorage e sessionStorage
        localStorage.clear()
        sessionStorage.clear()

        // Limpar cookies relacionados à autenticação
        document.cookie.split(";").forEach((c) => {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
        })

        // Obter a URL base correta para redirecionamento
        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.VERCEL_URL || window.location.origin

        // Fazer logout via NextAuth com URL explícita
        await signOut({
          redirect: false,
        })

        // Redirecionar para a página de login usando o router
        router.push("/login")
      } catch (error) {
        console.error("Erro ao fazer logout:", error)
        // Em caso de erro, ainda tentamos redirecionar
        router.push("/login")
      }
    }

    performLogout()
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        <p className="text-sm text-muted-foreground">Saindo...</p>
      </div>
    </div>
  )
}
