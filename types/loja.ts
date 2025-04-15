import type { ObjectId } from "mongodb"

export interface Endereco {
  rua?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  latitude?: number
  longitude?: number
}

export interface HorarioFuncionamento {
  segunda?: string | { open?: boolean; abertura?: string; fechamento?: string }
  terca?: string | { open?: boolean; abertura?: string; fechamento?: string }
  quarta?: string | { open?: boolean; abertura?: string; fechamento?: string }
  quinta?: string | { open?: boolean; abertura?: string; fechamento?: string }
  sexta?: string | { open?: boolean; abertura?: string; fechamento?: string }
  sabado?: string | { open?: boolean; abertura?: string; fechamento?: string }
  domingo?: string | { open?: boolean; abertura?: string; fechamento?: string }
}

export interface Cores {
  primaria?: string
  secundaria?: string
  texto?: string
  fundo?: string
}

export interface Produto {
  _id: string
  nome: string
  descricao?: string
  descricaoCurta?: string // Adicionando a propriedade descricaoCurta
  preco: number
  precoPromocional?: number
  imagens?: string[]
  categorias?: string[]
  estoque?: number
  lojaId: string
  ativo?: boolean
  destaque?: boolean
  createdAt?: Date
  updatedAt?: Date
}

export interface Loja {
  _id: string
  nome: string
  slug?: string
  nomeNormalizado?: string
  descricao?: string
  banner?: string
  logo?: string
  telefone?: string
  whatsapp?: string
  email?: string
  site?: string
  redesSociais?: {
    facebook?: string
    instagram?: string
    twitter?: string
    youtube?: string
    linkedin?: string
    tiktok?: string
  }
  endereco?: string | Endereco
  horarioFuncionamento?: string | HorarioFuncionamento
  plano: string
  planoId: string
  ativo: boolean
  userId?: string | ObjectId
  usuarioId?: string | ObjectId
  produtos?: Produto[]
  cores?: Cores
  vitrine?: any // Configuração da vitrine
  createdAt?: Date
  updatedAt?: Date
}
