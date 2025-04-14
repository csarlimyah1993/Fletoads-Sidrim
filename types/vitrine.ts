export interface VitrineConfig {
  titulo?: string
  descricao?: string
  corPrimaria?: string
  corSecundaria?: string
  corTexto?: string
  corFundo?: string
  corDestaque?: string
  layout?: string
  tema?: string
  mostrarProdutos?: boolean
  mostrarContato?: boolean
  mostrarEndereco?: boolean
  mostrarHorarios?: boolean
  mostrarRedesSociais?: boolean
  mostrarBanner?: boolean
  mostrarLogo?: boolean
  mostrarBusca?: boolean
  mostrarCategorias?: boolean
  mostrarPrecos?: boolean
  mostrarPromocoes?: boolean
  mostrarEstoque?: boolean
  mostrarAvaliacao?: boolean
  mostrarCompartilhar?: boolean
  mostrarWhatsapp?: boolean
  animacoes?: boolean
  efeitos?: string
  fontePersonalizada?: string
  widgetPromocao?: {
    ativo?: boolean
    titulo?: string
    descricao?: string
    corFundo?: string
    corTexto?: string
  }
  widgetContador?: {
    ativo?: boolean
    titulo?: string
    dataFim?: string
    corFundo?: string
    corTexto?: string
  }
  widgetNewsletter?: {
    ativo?: boolean
    titulo?: string
    descricao?: string
    corFundo?: string
    corTexto?: string
  }
  bannerPrincipal?: string
  logoPersonalizado?: string
  secaoSobre?: {
    ativo?: boolean
    titulo?: string
    conteudo?: string
    imagem?: string
  }
  secaoValores?: {
    ativo?: boolean
    titulo?: string
    valores?: Array<{
      icone?: string
      titulo?: string
      descricao?: string
    }>
  }
  metaTitulo?: string
  metaDescricao?: string
}

export interface Avaliacao {
  id: string
  nome: string
  email?: string
  avatar?: string
  nota: number
  comentario: string
  data: Date | string
  lojaId?: string
  aprovada?: boolean
  createdAt?: Date | string
  updatedAt?: Date | string
}

export interface VitrineMetrica {
  id?: string
  lojaId: string
  tipo: "visualizacao" | "interacao" | "conversao" | "clique"
  data: Date | string
  origem?: string
  detalhes?: Record<string, any>
  usuarioId?: string
  ip?: string
  userAgent?: string
}

export interface VitrineHeaderProps {
  loja: any
  config: VitrineConfig
  searchTerm: string
  setSearchTerm: (term: string) => void
  favoritos: string[]
  isDarkMode: boolean
  setIsDarkMode: (isDark: boolean) => void
}

export interface VitrineBannerProps {
  loja: any
  config: VitrineConfig
}

export interface VitrineProdutosProps {
  loja: any
  config: VitrineConfig
  produtos: any[]
  categorias: string[]
  categoriaAtiva: string | null
  setCategoriaAtiva: (categoria: string | null) => void
  favoritos: string[]
  toggleFavorito: (produto: any) => void
}

export interface VitrineSobreProps {
  loja: any
  config: VitrineConfig
}

export interface VitrineContatoProps {
  loja: any
  config: VitrineConfig
}

export interface VitrineAvaliacoesProps {
  loja: any
  config: VitrineConfig
  avaliacoes: Avaliacao[]
  onAvaliacaoEnviada: () => void
}

export interface VitrineNewsletterProps {
  loja: any
  config: VitrineConfig
}

export interface VitrineFooterProps {
  loja: any
  config: VitrineConfig
}

export interface VitrineMetricasProps {
  loja: any
}

export interface BackToTopButtonProps {
  config: VitrineConfig
}
