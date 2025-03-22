import type { PlanoLimites } from "@/lib/planos"

export interface Produto {
  _id: string
  nome: string
  preco: number
  descricao?: string
  imagens?: string[]
  categoria?: string
  lojaId: string
}

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
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  ativo: boolean
  logo?: string
  banner?: string
  cores?: {
    primaria?: string
    secundaria?: string
    texto?: string
  }
  usuarioId?: string
  userId?: string
  dataCriacao?: Date
  dataAtualizacao?: Date
  produtos?: Produto[]
  plano?: PlanoLimites
  planoId?: string
}

export interface VitrinePersonalizacao {
  banner?: string
  logo?: string
  cores: {
    primaria: string
    secundaria: string
    texto: string
  }
}

