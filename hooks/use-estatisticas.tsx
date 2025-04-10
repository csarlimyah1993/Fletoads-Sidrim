"use client"

import { useState, useEffect } from "react"

interface Estatisticas {
  geral: {
    totalVendas: number
    faturamentoTotal: number
    totalClientes?: number
    totalProdutos?: number
    mediaGastoPorCliente?: number
    produtoMaisVendido?: string
  }
  panfletos: {
    total: number
    porCategoria: Array<{
      categoria: string
      quantidade: number
    }>
    porMes: Array<{
      mes: string
      quantidade: number
    }>
  }
  clientes: {
    total: number
    ativos: Array<{
      periodo: string
      quantidade: number
    }>
  }
  campanhas: {
    total: number
    performance: Array<{
      status: string
      quantidade: number
    }>
  }
}

// Dados de fallback para quando a API não estiver disponível
const dadosFallback: Estatisticas = {
  geral: {
    totalVendas: 120,
    faturamentoTotal: 15750.5,
    totalClientes: 85,
    totalProdutos: 45,
    mediaGastoPorCliente: 185.3,
    produtoMaisVendido: "Panfleto Premium",
  },
  panfletos: {
    total: 45,
    porCategoria: [
      { categoria: "Promoções", quantidade: 15 },
      { categoria: "Lançamentos", quantidade: 12 },
      { categoria: "Eventos", quantidade: 8 },
      { categoria: "Informativos", quantidade: 10 },
    ],
    porMes: [
      { mes: "Jan", quantidade: 5 },
      { mes: "Fev", quantidade: 7 },
      { mes: "Mar", quantidade: 10 },
      { mes: "Abr", quantidade: 8 },
      { mes: "Mai", quantidade: 12 },
      { mes: "Jun", quantidade: 15 },
    ],
  },
  clientes: {
    total: 85,
    ativos: [
      { periodo: "Últimos 7 dias", quantidade: 35 },
      { periodo: "Últimos 30 dias", quantidade: 65 },
      { periodo: "Últimos 90 dias", quantidade: 80 },
    ],
  },
  campanhas: {
    total: 24,
    performance: [
      { status: "Ativa", quantidade: 12 },
      { status: "Concluída", quantidade: 8 },
      { status: "Pausada", quantidade: 3 },
      { status: "Rascunho", quantidade: 1 },
    ],
  },
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

        // Tentar buscar dados reais
        try {
          // Verificar se pelo menos um endpoint está disponível
          const checkResponse = await fetch("/api/check-connection")

          // Se a verificação de conexão falhar, usar dados de fallback
          if (!checkResponse.ok) {
            console.warn("API de verificação de conexão não está disponível, usando dados de fallback")
            setEstatisticas(dadosFallback)
            return
          }

          // Tentar buscar dados reais, mas usar fallback se falhar
          const geralData = await fetchEndpointData("/api/estatisticas/geral", dadosFallback.geral)
          const panfletosData = await fetchEndpointData("/api/estatisticas/panfletos", dadosFallback.panfletos)
          const clientesData = await fetchEndpointData("/api/estatisticas/clientes", dadosFallback.clientes)
          const campanhasData = await fetchEndpointData("/api/estatisticas/campanhas", dadosFallback.campanhas)

          setEstatisticas({
            geral: geralData,
            panfletos: panfletosData,
            clientes: clientesData,
            campanhas: campanhasData,
          })
        } catch (apiError) {
          console.warn("Erro ao buscar dados da API:", apiError)
          console.log("Usando dados de fallback")
          setEstatisticas(dadosFallback)
        }
      } catch (err) {
        console.error("Erro geral:", err)
        setError(err instanceof Error ? err : new Error("Erro ao buscar estatísticas"))
        // Mesmo com erro, usar dados de fallback para não quebrar a UI
        setEstatisticas(dadosFallback)
      } finally {
        setIsLoading(false)
      }
    }

    // Função auxiliar para buscar dados de um endpoint com fallback para valores padrão
    async function fetchEndpointData(endpoint: string, defaultValue: any) {
      try {
        const response = await fetch(endpoint)
        if (!response.ok) {
          console.warn(`Endpoint ${endpoint} retornou status ${response.status}, usando dados de fallback`)
          return defaultValue
        }
        return await response.json()
      } catch (error) {
        console.warn(`Erro ao buscar dados de ${endpoint}:`, error)
        return defaultValue
      }
    }

    fetchEstatisticas()
  }, [])

  return { estatisticas, isLoading, error }
}
