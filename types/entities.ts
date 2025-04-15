import type { ObjectId } from "mongodb"

// Tipos básicos
export type MongoId = string | ObjectId

// Interfaces para Loja
export interface Endereco {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  pais?: string
}

export interface HorarioFuncionamento {
  abertura?: string
  fechamento?: string
  open?: boolean
}

export interface HorarioSemanal {
  segunda?: HorarioFuncionamento
  terca?: HorarioFuncionamento
  quarta?: HorarioFuncionamento
  quinta?: HorarioFuncionamento
  sexta?: HorarioFuncionamento
  sabado?: HorarioFuncionamento
  domingo?: HorarioFuncionamento
  [key: string]: HorarioFuncionamento | undefined
}

export interface Loja {
  _id: MongoId
  nome: string
  descricao?: string
  endereco?: Endereco
  enderecoFormatado?: string
  telefone?: string
  email?: string
  site?: string
  logo?: string
  banner?: string
  horarioFuncionamento?: HorarioSemanal
  horarioFormatado?: Record<string, string>
  status?: string
  ativo?: boolean
  proprietarioId?: MongoId
  usuarioId?: MongoId
  dataCriacao?: Date
  dataAtualizacao?: Date
  [key: string]: any
}

// Interfaces para Cliente
export interface Cliente {
  _id: MongoId
  nome: string
  email?: string
  telefone?: string
  endereco?: Endereco
  dataNascimento?: Date
  cpf?: string
  observacoes?: string
  totalGasto?: number
  numeroPedidos?: number
  ultimaCompra?: Date
  lojaId: MongoId
  dataCriacao?: Date
  dataAtualizacao?: Date
}

// Interfaces para Produto
export interface Produto {
  _id: MongoId
  nome: string
  descricao?: string
  preco: number
  precoPromocional?: number
  estoque?: number
  categoria?: string
  imagem?: string
  ativo?: boolean
  lojaId: MongoId
  dataCriacao?: Date
  dataAtualizacao?: Date
}

// Interfaces para Venda
export interface ItemVenda {
  produtoId: MongoId
  quantidade: number
  precoUnitario: number
  subtotal: number
  produto?: {
    _id: string
    nome: string
    preco: number
    imagem?: string
  }
}

export interface Venda {
  _id?: MongoId
  clienteId: MongoId
  lojaId: MongoId
  usuarioId: MongoId
  itens: ItemVenda[]
  total: number
  desconto?: number
  formaPagamento?: string
  status?: string
  observacao?: string
  dataCriacao?: Date
  dataAtualizacao?: Date
  cliente?: {
    _id: string
    nome: string
    email?: string
    telefone?: string
  }
}

// Interface para Usuário
export interface Usuario {
  _id: MongoId
  nome?: string
  email: string
  senha?: string
  telefone?: string
  endereco?: Endereco
  role?: string
  lojaId?: MongoId
  dataCriacao?: Date
  dataAtualizacao?: Date
}

// Interface para filtros de busca
export interface VendaFiltro {
  lojaId?: MongoId
  status?: string
  clienteId?: MongoId
  dataCriacao?: {
    $gte?: Date
    $lte?: Date
  }
}

// Interface para paginação
export interface Paginacao {
  total: number
  page: number
  limit: number
  totalPages: number
}
