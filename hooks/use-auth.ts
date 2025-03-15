"use client"

import { useSession, signIn, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function useAuth() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const login = async (email: string, senha: string) => {
    try {
      setLoading(true)
      setError(null)

      const result = await signIn("credentials", {
        redirect: false,
        email,
        senha,
      })

      if (result?.error) {
        setError("Credenciais inválidas")
        return false
      }

      router.push("/dashboard")
      return true
    } catch (err) {
      setError("Ocorreu um erro ao fazer login")
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (nome: string, email: string, senha: string) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ nome, email, senha }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao registrar")
        return false
      }

      // Login automático após registro
      return await login(email, senha)
    } catch (err) {
      setError("Ocorreu um erro ao registrar")
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    await signOut({ redirect: false })
    router.push("/login")
  }

  return {
    session,
    status,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: status === "authenticated",
    isLoading: status === "loading",
  }
}

