"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { signOut } from "next-auth/react"

export default function ResetAuthPage() {
  const [message, setMessage] = useState("Limpando dados de autenticação...")
  const router = useRouter()

  useEffect(() => {
    const clearAuthData = async () => {
      try {
        // 1. Fazer logout via NextAuth
        await signOut({ redirect: false })

        // 2. Limpar todos os cookies
        document.cookie.split(";").forEach((cookie) => {
          const [name] = cookie.trim().split("=")
          document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`
        })

        // 3. Limpar localStorage e sessionStorage
        try {
          localStorage.clear()
          sessionStorage.clear()
        } catch (e) {
          console.error("Erro ao limpar storage:", e)
        }

        setMessage("Dados de autenticação limpos. Redirecionando para login...")

        // 4. Redirecionar para login após um breve atraso
        setTimeout(() => {
          window.location.href = "/login"
        }, 1500)
      } catch (error) {
        console.error("Erro ao limpar dados de autenticação:", error)
        setMessage("Erro ao limpar dados. Tente novamente.")
      }
    }

    clearAuthData()
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
        <p className="text-lg">{message}</p>
      </div>
    </div>
  )
}
