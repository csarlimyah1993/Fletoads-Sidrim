export interface Cupom {
    _id: string
    codigo: string
    tipo: "percentual" | "valor_fixo" | "frete_gratis"
    valor: number
    valorMinimo?: number
    dataInicio: Date | string
    dataExpiracao: Date | string
    limitePorUsuario?: number
    limiteTotalUsos?: number
    usos: number
    ativo: boolean
    descricao?: string
    produtos?: string[]
    categorias?: string[]
    usuariosEspecificos?: string[]
    criadoPor: string
    lojaId: string
    dataCriacao: Date | string
    dataAtualizacao: Date | string
  }
  
  export interface CupomFormValues {
    codigo: string
    tipo: "percentual" | "valor_fixo" | "frete_gratis"
    valor: number
    valorMinimo?: number
    dataInicio: Date
    dataExpiracao: Date
    limitePorUsuario?: number
    limiteTotalUsos?: number
    ativo: boolean
    descricao?: string
    produtos?: string[]
    categorias?: string[]
    usuariosEspecificos?: string[]
  }
  
  export interface UsoCupom {
    cupomId: string
    usuarioId: string
    dataUso: Date
    valorPedido: number
    valorDesconto: number
  }
  