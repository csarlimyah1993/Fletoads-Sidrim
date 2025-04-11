"use client"

import { useEffect, useState } from "react"
import { LojaPerfilContent } from "./loja-perfil-content"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Definindo interfaces para os tipos
export interface LojaData {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  endereco?: {
    rua: string
    numero: string
    complemento?: string
    bairro: string
    cidade: string
    estado: string
    cep: string
    latitude?: string
    longitude?: string
  }
  contato?: {
    telefone: string
    email: string
    whatsapp?: string
    site?: string
  }
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    youtube?: string
    linkedin?: string
  }
  horarioFuncionamento?: {
    [key: string]: {
      abertura: string
      fechamento: string
      open: boolean
    }
  }
  proprietarioId: string
  dataCriacao: string
  dataAtualizacao: string
}

export interface PlanoData {
  nome: string
  preco: number
  limites: {
    panfletos: number
    produtos: number
    clientes: number
    integracoes: number
  }
}

export interface UsoData {
  panfletos: number
  produtos: number
  clientes: number
  integracoes: number
}

export interface VitrineData {
  _id: string
  titulo?: string
  descricao?: string
  banner?: string
  logo?: string
  lojaId: string
  tema?: string
  corPrimaria?: string
  fonte?: string
  exibirCategorias?: boolean
  produtosPorPagina?: number
  layoutProdutos?: string
  estatisticas?: {
    visualizacoes: number
    cliques: number
  }
}

export interface PerfilLojaData {
  loja: LojaData | null
  plano: PlanoData
  uso: UsoData
  vitrine: VitrineData | null
}

export function PerfilDaLojaClient() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<PerfilLojaData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const response = await fetch("/api/loja/perfil-dashboard")

        if (!response.ok) {
          throw new Error("Erro ao buscar dados da loja")
        }

        const result = await response.json()
        setData(result)
      } catch (err) {
        console.error("Erro ao buscar dados da loja:", err)
        setError("Não foi possível carregar os dados da loja. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados da loja...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Sem dados</AlertTitle>
        <AlertDescription>Nenhum dado encontrado para a loja.</AlertDescription>
      </Alert>
    )
  }

  return <LojaPerfilContent loja={data.loja} plano={data.plano} uso={data.uso} vitrine={data.vitrine} />
}
