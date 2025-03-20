"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"

export interface ResourceLimit {
  current: number
  limit: number
  remaining: number
  percentUsed: number
}

export interface ResourceLimits {
  panfletos?: ResourceLimit
  produtos?: ResourceLimit
  panAssistant?: ResourceLimit
  hotPromos?: ResourceLimit
  [key: string]: ResourceLimit | undefined
}

export function useResourceLimits() {
  const { data: session } = useSession()
  const [limits, setLimits] = useState<ResourceLimits>({})
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLimits() {
      if (!session?.user) {
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch("/api/user/resource-limits")

        if (!response.ok) {
          throw new Error(`Erro ao buscar limites: ${response.status}`)
        }

        const data = await response.json()
        setLimits(data)
      } catch (err) {
        console.error("Erro ao buscar limites de recursos:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchLimits()
  }, [session])

  const hasReachedLimit = (resourceType: keyof ResourceLimits): boolean => {
    const resource = limits[resourceType]
    return resource ? resource.current >= resource.limit : false
  }

  const getUsagePercentage = (resourceType: keyof ResourceLimits): number => {
    const resource = limits[resourceType]
    return resource ? resource.percentUsed : 0
  }

  // Para compatibilidade com o código existente
  return {
    limits,
    isLoading,
    loading: isLoading, // Alias para compatibilidade
    error,
    hasReachedLimit,
    getUsagePercentage,
  }
}

