"use client"

import { useState, useEffect } from "react"

interface EstatisticasPanfletos {
  total: number
  porCategoria: Array<{ categoria: string; quantidade: number }>
  porMes: Array<{ mes: string; quantidade: number }>
  crescimento: number
}

interface EstatisticasClientes {
  total: number
  ativos: number
  porSegmento: Array<{ segmento: string; quantidade: number }>
  crescimento: number
}

interface EstatisticasCampanhas {
  total: number
  ativas: number
  performance: Array<{ status: string; quantidade: number }>
  crescimento: number
}

interface EstatisticasGerais {
  totalVendas: number
  faturamentoTotal: number
  taxaConversao: number
  crescimentoConversao: number
}

interface Estatisticas {
  panfletos: EstatisticasPanfletos
  clientes: EstatisticasClientes
  campanhas: EstatisticasCampanhas
  geral: EstatisticasGerais
}

export function useEstatisticas() {
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchEstatisticas = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Buscar estatísticas gerais
        const response = await fetch("/api/estatisticas/geral")

        if (!response.ok) {
          throw new Error(`Erro ao buscar estatísticas: ${response.status}`)
        }

        const data = await response.json()
        setEstatisticas(data)
      } catch (err) {
        console.error("Erro ao buscar estatísticas:", err)
        setError(err instanceof Error ? err : new Error("Erro desconhecido"))
      } finally {
        setIsLoading(false)
      }
    }

    fetchEstatisticas()
  }, [])

  return { estatisticas, isLoading, error }
}
