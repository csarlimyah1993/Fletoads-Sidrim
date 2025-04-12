export interface LimiteItem {
    current: number
    limit: number
    percentage: number
    hasReached: boolean
  }
  
  export interface LimitesType {
    panfletos: LimiteItem
    produtos: LimiteItem
    integracoes: LimiteItem
    [key: string]: LimiteItem // Para permitir outras propriedades do mesmo tipo
  }
  