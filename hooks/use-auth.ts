"use client"

import { useState } from "react"
import { signIn, signOut, useSession } from "next-auth/react"

export function useAuth() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = status === "authenticated"
  const user = session?.user

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await signIn("credentials", {
        redirect: false,
        email,
        password: senha, // Importante: o nome do campo deve corresponder ao esperado pelo NextAuth
      })

      if (result?.error) {
        setError("Credenciais inválidas. Por favor, tente novamente.")
      }
    } catch (err) {
      setError("Ocorreu um erro ao tentar fazer login. Tente novamente mais tarde.")
      console.error("Erro de login:", err)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setLoading(true)
      await signOut({ redirect: false })
      window.location.href = "/login"
    } catch (err) {
      console.error("Erro ao fazer logout:", err)
    } finally {
      setLoading(false)
    }
  }

  return {
    login,
    logout,
    loading,
    error,
    isAuthenticated,
    user,
  }
}

