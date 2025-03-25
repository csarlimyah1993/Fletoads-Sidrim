"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

export function useAuth() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const isAuthenticated = status === "authenticated"
  const isLoading = status === "loading"

  const login = async (email: string, senha: string) => {
    setLoading(true)
    setError(null)

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        senha,
      })

      if (result?.error) {
        setError("Email ou senha inválidos")
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("Ocorreu um erro ao fazer login")
      console.error("Erro de login:", err)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await signOut({ redirect: false })
      router.push("/login")
    } catch (err) {
      console.error("Erro ao fazer logout:", err)
    } finally {
      setLoading(false)
    }
  }

  return {
    user: session?.user,
    isAuthenticated,
    isLoading,
    loading,
    error,
    login,
    logout,
  }
}

