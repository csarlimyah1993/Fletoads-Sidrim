export interface ResourceLimits {
  panfletos: number | null
  produtos: number | null
  integracoes: number | null
  armazenamento: number | null
  layouts: number | null
  widgets: number | null
  promocoes: number | null
  imagensPorProduto: number | null
  contasWhatsapp: number | null
  tourVirtual: boolean
  animacoes: boolean
  personalizacaoFontes: boolean
}

// Define the limits for each plan
export const FREE_PLAN_LIMITS: ResourceLimits = {
  panfletos: 0,
  produtos: 10,
  integracoes: 0,
  armazenamento: 100, // MB
  layouts: 2,
  widgets: 3,
  promocoes: 0,
  imagensPorProduto: 1,
  contasWhatsapp: 0,
  tourVirtual: false,
  animacoes: false,
  personalizacaoFontes: false,
}

export const START_PLAN_LIMITS: ResourceLimits = {
  panfletos: 20,
  produtos: 30,
  integracoes: 1,
  armazenamento: 500, // MB
  layouts: 4,
  widgets: 5,
  promocoes: 5,
  imagensPorProduto: 2,
  contasWhatsapp: 1,
  tourVirtual: false,
  animacoes: false,
  personalizacaoFontes: true,
}

export const BASIC_PLAN_LIMITS: ResourceLimits = {
  panfletos: 30,
  produtos: 0, // No web showcase
  integracoes: 1,
  armazenamento: 1000, // MB
  layouts: 4,
  widgets: 5,
  promocoes: 10,
  imagensPorProduto: 3,
  contasWhatsapp: 1,
  tourVirtual: false,
  animacoes: false,
  personalizacaoFontes: true,
}

export const COMPLETE_PLAN_LIMITS: ResourceLimits = {
  panfletos: 50,
  produtos: 60,
  integracoes: 1,
  armazenamento: 2000, // MB
  layouts: 6,
  widgets: 7,
  promocoes: 20,
  imagensPorProduto: 3,
  contasWhatsapp: 1,
  tourVirtual: true,
  animacoes: true,
  personalizacaoFontes: true,
}

export const PREMIUM_PLAN_LIMITS: ResourceLimits = {
  panfletos: 100,
  produtos: 120,
  integracoes: 2,
  armazenamento: 5000, // MB
  layouts: 8,
  widgets: 10,
  promocoes: 50,
  imagensPorProduto: 5,
  contasWhatsapp: 2,
  tourVirtual: true,
  animacoes: true,
  personalizacaoFontes: true,
}

export const ENTERPRISE_PLAN_LIMITS: ResourceLimits = {
  panfletos: 200,
  produtos: 400,
  integracoes: 4,
  armazenamento: 10000, // MB
  layouts: 12,
  widgets: 12,
  promocoes: 100,
  imagensPorProduto: 5,
  contasWhatsapp: 4,
  tourVirtual: true,
  animacoes: true,
  personalizacaoFontes: true,
}
