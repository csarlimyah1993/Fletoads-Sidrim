"use client"

import { useState, useEffect } from "react"
import { type PlanoLimites, getPlanoDoUsuario } from "@/lib/planos"

export function usePlano() {
  const [plano, setPlano] = useState<PlanoLimites | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/plan")

        if (!response.ok) {
          throw new Error("Falha ao carregar informações do plano")
        }

        const data = await response.json()

        // Obter o plano com base no ID do plano do usuário
        const planoUsuario = getPlanoDoUsuario(data.planoId)
        setPlano(planoUsuario)
      } catch (error) {
        console.error("Erro ao buscar plano:", error)
        setError("Não foi possível carregar as informações do plano")
        // Usar plano gratuito como fallback
        setPlano(getPlanoDoUsuario())
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlano()
  }, [])

  return { plano, isLoading, error }
}

