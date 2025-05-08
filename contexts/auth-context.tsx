"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { useSession } from "next-auth/react"

type UserData = {
  _id: string
  nome: string
  email: string
  role: string
  plano: string
  lojaId?: string
  permissoes?: string[]
  [key: string]: any
}

type AuthContextType = {
  user: UserData | null
  isLoading: boolean
  error: string | null
  refreshUserData: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  error: null,
  refreshUserData: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<UserData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fetchAttempted, setFetchAttempted] = useState(false)

  // Função para criar um usuário a partir dos dados da sessão
  const createUserFromSession = (session: any) => {
    if (!session?.user) return null

    // Log para depuração
    console.log("AuthContext: Criando usuário a partir da sessão:", {
      id: session.user.id,
      email: session.user.email,
      plano: session.user.plano || "gratuito",
    })

    return {
      _id: session.user.id || "temp-id",
      nome: session.user.nome || session.user.name || "",
      email: session.user.email || "",
      role: session.user.role || "user",
      plano: session.user.plano || "gratuito",
      lojaId: session.user.lojaId,
      permissoes: session.user.permissoes || [],
    }
  }

  const fetchUserData = async () => {
    if (status !== "authenticated" || !session?.user) {
      setIsLoading(false)
      return
    }

    try {
      console.log("AuthContext: Buscando dados do usuário para", session.user.email)
      setFetchAttempted(true)

      // Imediatamente use os dados da sessão como fallback inicial
      const sessionUser = createUserFromSession(session)
      if (sessionUser) {
        console.log("AuthContext: Usando dados da sessão como fallback inicial")
        setUser(sessionUser)
      }

      // Tentar buscar dados completos da API com timeout
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos de timeout

      try {
        // Adicionar timestamp para evitar cache
        const timestamp = new Date().getTime()
        const response = await fetch(`/api/auth/user-profile?t=${timestamp}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Erro ao buscar dados do usuário: ${errorData.error || response.status}`)
        }

        const userData = await response.json()
        console.log("AuthContext: Dados completos do usuário recebidos:", {
          id: userData._id,
          email: userData.email,
          plano: userData.plano,
        })

        if (!userData || !userData._id) {
          console.error("AuthContext: Dados do usuário inválidos")
          setError("Dados do usuário inválidos")
          // Não atualizamos o estado do usuário aqui, mantendo os dados da sessão
          return
        }

        // Garantir que o plano seja definido
        if (!userData.plano) {
          userData.plano = "gratuito"
        }

        // Atualizar o usuário com os dados completos
        setUser(userData)
        setError(null)
      } catch (fetchError: any) {
        console.error("AuthContext: Erro ao buscar dados do usuário:", fetchError)

        // Se for um erro de timeout, não mostrar erro na UI
        if (fetchError.name === "AbortError") {
          console.warn("AuthContext: Timeout ao buscar dados do usuário, usando dados da sessão")
        } else {
          setError(fetchError instanceof Error ? fetchError.message : "Erro desconhecido")
        }

        // Garantir que temos pelo menos os dados da sessão
        if (!user && session?.user) {
          const sessionUser = createUserFromSession(session)
          if (sessionUser) {
            console.log("AuthContext: Usando dados da sessão após erro")
            setUser(sessionUser)
          }
        }
      }
    } catch (err) {
      console.error("AuthContext: Erro geral:", err)

      // Garantir que temos pelo menos os dados da sessão
      if (!user && session?.user) {
        const sessionUser = createUserFromSession(session)
        if (sessionUser) {
          console.log("AuthContext: Usando dados da sessão após erro geral")
          setUser(sessionUser)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (status === "authenticated" && !fetchAttempted) {
      fetchUserData()
    } else if (status === "unauthenticated") {
      setUser(null)
      setIsLoading(false)
    }
  }, [status, session, fetchAttempted])

  const refreshUserData = async () => {
    setIsLoading(true)
    setFetchAttempted(false)
    await fetchUserData()
  }

  return <AuthContext.Provider value={{ user, isLoading, error, refreshUserData }}>{children}</AuthContext.Provider>
}
