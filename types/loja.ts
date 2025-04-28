export interface CriarLojaFormProps {
  userId: string
}

// Add the missing Endereco type
export interface Endereco {
  rua?: string
  logradouro?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  pais?: string
  latitude?: number
  longitude?: number
}

// Atualizar a interface HorarioFuncionamento para suportar ambos os formatos
export interface HorarioFuncionamento {
  [key: string]:
    | {
        aberto?: boolean
        open?: boolean
        abertura?: string
        fechamento?: string
        opening?: string
        closing?: string
      }
    | string
}

export interface Contato {
  telefone?: string
  whatsapp?: string
  email?: string
  site?: string
}

export interface Loja {
  _id: string
  id?: string // Added id property
  nome: string
  descricao?: string
  logo?: string
  banner?: string
  categoria?: string
  tags?: string[]
  endereco?: Endereco
  contato?: Contato
  horarioFuncionamento?: HorarioFuncionamento
  redesSociais?: {
    facebook?: string
    instagram?: string
    twitter?: string
    linkedin?: string
    youtube?: string
    tiktok?: string
  }
  vitrine?: any
  usuarioId?: string
  dataCriacao?: string | Date
  dataAtualizacao?: string | Date
  status?: string
  plano?: string
  verificada?: boolean
  userId?: string
  capa?: string
  vitrineId?: string
  proprietarioId?: string
  categorias?: string[]
  ativo?: boolean
  planoId?: string
  proprietarioPlano?: string
  produtos?: Produto[]
  website?: string
  site?: string
  instagram?: string
  facebook?: string
  telefone?: string // Added telefone property
  email?: string // Added email property
  redesSociais2?: {
    instagram?: string
    facebook?: string
    twitter?: string
    linkedin?: string
    youtube?: string
  }
  userId2?: string
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
  createdAt?: Date | string
  updatedAt?: Date | string
  titulo?: string // Added for VitrineConfig compatibility
}

export interface Produto {
  _id: string
  nome: string
  descricao?: string
  descricaoCurta?: string
  preco: number
  precoPromocional?: number
  imagens?: string[]
  categorias?: string[]
  tags?: string[]
  estoque?: number
  lojaId?: string
  dataCriacao?: string | Date
  dataAtualizacao?: string | Date
  status?: string
  destaque?: boolean
  avaliacao?: number
  numeroAvaliacoes?: number
  descricaoCompleta?: string // Adicionado
  videoUrl?: string // Adicionado
  categoria?: string // Adicionado para compatibilidade
  subcategoria?: string // Adicionado
  marca?: string // Adicionado
  modelo?: string // Adicionado
  sku?: string // Adicionado
  codigoBarras?: string // Adicionado
  peso?: number // Adicionado
  altura?: number // Adicionado
  largura?: number // Adicionado
  comprimento?: string // Adicionado
  tipoFrete?: string // Adicionado
  ativo?: boolean
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
  createdAt?: string | Date // Modificado para aceitar Date
  updatedAt?: string | Date // Modificado para aceitar Date
  createdAt2?: string | Date // Já aceita Date
  updatedAt2?: string | Date // Já aceita Date
  lojaId2?: string
  userId?: string // Adicionado
  metaTitle?: string // Adicionado
  metaDescription?: string // Adicionado
  disponivel?: boolean
}

export interface VitrineConfig {
  _id?: string
  lojaId?: string
  corPrimaria?: string
  corSecundaria?: string
  corTexto?: string
  corFundo?: string
  fonteTexto?: string
  fonteTitulos?: string
  mostrarProdutos?: boolean
  mostrarHorarios?: boolean
  mostrarEndereco?: boolean
  mostrarContato?: boolean
  mostrarRedesSociais?: boolean
  layoutProdutos?: "grid" | "lista" | "carrossel"
  bannerPersonalizado?: string
  logoPersonalizado?: string
  createdAt?: Date | string
  updatedAt?: Date | string
  titulo?: string // Added for compatibility with your code
  descricao?: string // Added for compatibility with your code
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
