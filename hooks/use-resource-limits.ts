"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface ResourceLimit {
  max: number
  used: number
}

export interface ResourceLimits {
  panfletos: ResourceLimit
  produtos: ResourceLimit
  armazenamento: ResourceLimit
  integracoes: ResourceLimit
}

export function useResourceLimits() {
  const { data: session } = useSession()
  const [limits, setLimits] = useState<ResourceLimits | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLimits = async () => {
      if (!session) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const response = await fetch("/api/resource-limits")

        if (!response.ok) {
          throw new Error(`Erro ao buscar limites: ${response.status}`)
        }

        const data = await response.json()
        setLimits(data)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar limites de recursos:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setLoading(false)
      }
    }

    fetchLimits()
  }, [session])

  // Para compatibilidade com código existente que pode usar isLoading
  return { limits, loading, isLoading: loading, error }
}

