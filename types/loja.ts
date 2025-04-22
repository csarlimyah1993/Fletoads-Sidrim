export interface CriarLojaFormProps {
  userId: string
}

// Add the missing Endereco type
export interface Endereco {
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

// Add the missing HorarioFuncionamento type
export interface HorarioFuncionamento {
  segunda?: string | { open?: boolean; abertura?: string; fechamento?: string }
  terca?: string | { open?: boolean; abertura?: string; fechamento?: string }
  quarta?: string | { open?: boolean; abertura?: string; fechamento?: string }
  quinta?: string | { open?: boolean; abertura?: string; fechamento?: string }
  sexta?: string | { open?: boolean; abertura?: string; fechamento?: string }
  sabado?: string | { open?: boolean; abertura?: string; fechamento?: string }
  domingo?: string | { open?: boolean; abertura?: string; fechamento?: string }
}

export interface Loja {
  _id: string
  id: string
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  capa?: string
  endereco?: Endereco
  contato?: {
    telefone?: string
    whatsapp?: string
    email?: string
    site?: string
  }
  horarioFuncionamento?: HorarioFuncionamento
  vitrineId?: string
  proprietarioId?: string
  categorias?: string[]
  status?: string
  ativo?: boolean
  plano?: string
  planoId?: string
  proprietarioPlano?: string
  vitrine?: any
  produtos?: Produto[]
  telefone?: string
  email?: string
  website?: string
  site?: string
  instagram?: string
  facebook?: string
  redesSociais?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  usuarioId?: string
  userId?: string
  cores?: {
    primaria?: string
    secundaria?: string
    texto?: string
    fundo?: string
    destaque?: string
  }
  // Add missing properties used in vitrine-personalizacao-form.tsx
  widgets?: string[]
  layout?: string
  fonte?: string
  animacoes?: boolean
}

export interface Produto {
  _id: string
  nome: string
  descricaoCurta?: string
  descricao?: string
  descricaoCompleta?: string // Adicionado
  preco: number
  precoPromocional?: number
  imagens?: string[]
  videoUrl?: string // Adicionado
  categoria?: string // Adicionado para compatibilidade
  categorias?: string[]
  subcategoria?: string // Adicionado
  tags?: string[] // Adicionado
  marca?: string // Adicionado
  modelo?: string // Adicionado
  estoque?: number
  sku?: string // Adicionado
  codigoBarras?: string // Adicionado
  peso?: number // Adicionado
  altura?: number // Adicionado
  largura?: number // Adicionado
  comprimento?: number // Adicionado
  tipoFrete?: string // Adicionado
  ativo?: boolean
  destaque?: boolean
  tipoProduto?: string // Adicionado
  variacoes?: Array<{
    // Adicionado
    nome: string
    opcoes: Array<{
      nome: string
      preco?: number
      estoque?: number
    }>
  }>
  dataCriacao?: string | Date
  dataAtualizacao?: string | Date
  createdAt?: string | Date // Adicionado
  updatedAt?: string | Date // Adicionado
  lojaId?: string
  userId?: string // Adicionado
  metaTitle?: string // Adicionado
  metaDescription?: string // Adicionado
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

export interface Cliente {
  _id: string
  nome: string
  empresa: string
  email: string
  telefone: string
  status: string
  ultimoContato: string
}
