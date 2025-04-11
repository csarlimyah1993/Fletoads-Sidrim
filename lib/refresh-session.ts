"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useCallback } from "react"

/**
 * Atualiza os dados da sessão do usuário
 * @param data Dados a serem atualizados na sessão
 */
export async function refreshSessionData(data: Record<string, any>) {
  try {
    const response = await fetch("/api/auth/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error("Falha ao atualizar a sessão")
    }

    return await response.json()
  } catch (error) {
    console.error("Erro ao atualizar dados da sessão:", error)
    return null
  }
}

/**
 * Hook para atualizar a sessão do usuário
 */
export function useSessionRefresh() {
  const { data: session, update } = useSession()
  const router = useRouter()

  const refreshSession = useCallback(
    async (data?: Record<string, any>) => {
      try {
        if (data) {
          await update(data)
        } else {
          await update()
        }

        // Força a atualização da UI
        router.refresh()

        return true
      } catch (error) {
        console.error("Erro ao atualizar sessão:", error)
        return false
      }
    },
    [update, router],
  )

  return { session, refreshSession }
}
