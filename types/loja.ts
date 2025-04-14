// Tipos relacionados à loja
export interface CriarLojaFormProps {
  userId: string
}

export interface Loja {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  capa?: string
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    latitude?: number
    longitude?: number
    logradouro?: string
  }
  contato?: {
    telefone?: string
    whatsapp?: string
    email?: string
    site?: string
  }
  horarioFuncionamento?: {
    segunda?: string | { open?: boolean; abertura?: string; fechamento?: string }
    terca?: string | { open?: boolean; abertura?: string; fechamento?: string }
    quarta?: string | { open?: boolean; abertura?: string; fechamento?: string }
    quinta?: string | { open?: boolean; abertura?: string; fechamento?: string }
    sexta?: string | { open?: boolean; abertura?: string; fechamento?: string }
    sabado?: string | { open?: boolean; abertura?: string; fechamento?: string }
    domingo?: string | { open?: boolean; abertura?: string; fechamento?: string }
  }
  vitrineId?: string
  proprietarioId?: string
  categorias?: string[]
  status?: string
  ativo?: boolean
  plano?: string
  proprietarioPlano?: string
  vitrine?: any
}

export interface Produto {
  _id: string
  nome: string
  descricaoCurta?: string
  descricao?: string // Adicionando a propriedade descricao
  preco: number
  precoPromocional?: number
  imagens?: string[]
  destaque?: boolean
  ativo?: boolean
  categorias?: string[]
  estoque?: number
  dataCriacao?: string | Date
  dataAtualizacao?: string | Date
  lojaId?: string
}

export interface LojaPerfilContentProps {
  loja: Loja
  produtos?: Produto[]
  isLoading?: boolean
  planoInfo?: any
  plano?: any
  uso?: any
  limites?: any
  vitrine?: any
}

export interface PerfilDaLojaClientProps {
  userId?: string
  loja?: Loja | null
  produtos?: Produto[]
  planoInfo?: any
}
