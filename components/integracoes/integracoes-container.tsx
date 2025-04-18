"use client"

import { useState, useEffect } from "react"
import { IntegracoesList } from "./integracoes-list"
import { toast } from "sonner"

interface Integracao {
  id: string
  nome: string
  descricao: string
  tipo: string
  status: "ativa" | "inativa" | "pendente"
  icone: string
}

export function IntegracoesContainer() {
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegracoes()
  }, [])

  const fetchIntegracoes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/integracoes")

      if (!response.ok) {
        throw new Error("Falha ao carregar integrações")
      }

      const data = await response.json()
      setIntegracoes(data)
      setError(null)
    } catch (err) {
      console.error("Erro ao buscar integrações:", err)
      setError("Não foi possível carregar as integrações. Tente novamente mais tarde.")
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async (id: string, novoStatus: "ativa" | "inativa") => {
    try {
      const response = await fetch(`/api/integracoes/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status da integração")
      }

      // Update local state
      setIntegracoes((prevIntegracoes) =>
        prevIntegracoes.map((integracao) =>
          integracao.id === id ? { ...integracao, status: novoStatus } : integracao,
        ),
      )

      toast.success(`Integração ${novoStatus === "ativa" ? "ativada" : "desativada"} com sucesso!`)
    } catch (err) {
      console.error("Erro ao atualizar status:", err)
      toast.error("Erro ao atualizar status da integração")
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <div className="rounded-full bg-red-100 p-3 mb-4">
          <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <p className="text-red-600 font-medium">{error}</p>
        <button
          onClick={fetchIntegracoes}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <IntegracoesList
      integracoes={integracoes}
      onToggleStatus={handleToggleStatus}
      emptyMessage="Você ainda não possui integrações configuradas."
    />
  )
}
