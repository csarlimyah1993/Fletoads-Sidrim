import type { ObjectId } from "mongodb"
import type { PlanoLimites } from "@/lib/planos"

export interface Loja {
  _id: string
  nome: string
  descricao?: string
  endereco?: string
  telefone?: string
  email?: string
  website?: string
  horarioFuncionamento?: string
  instagram?: string
  facebook?: string
  ativo: boolean
  logo?: string
  banner?: string
  usuarioId?: string
  userId?: string
  dataCriacao?: string
  dataAtualizacao?: string
  cores?: {
    primaria?: string
    secundaria?: string
    texto?: string
    destaque?: string
  }
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  planoId?: string
  plano?: PlanoLimites
  produtos?: Produto[]
  slug?: string
  nomeNormalizado?: string
  // Novos campos para personalização da vitrine
  layout?: string
  fonte?: string
  animacoes?: boolean
  widgets?: string[]
}

export interface Produto {
  _id: string | ObjectId
  nome: string
  preco: number
  descricao?: string
  imagens?: string[]
  categoria?: string
  lojaId: string
  estoque?: number
  dataCriacao?: Date
  dataAtualizacao?: Date
}

