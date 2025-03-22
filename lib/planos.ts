export type TipoPlano = "gratis" | "start" | "basico" | "completo" | "premium" | "empresarial"

export interface PlanoLimites {
  id: string
  nome: string
  preco: number
  popular?: boolean
  vitrine: number
  panfletos: number
  promocoes: number
  whatsapp: number
  tourVirtual: boolean | string
  assistenteIA: boolean | string
  crm: boolean
  pinMapa: boolean
  notificacaoPesquisa: boolean
  clientesProximos: boolean
  sinalizacaoVisual: boolean
  imagensPorProduto: number
}

export const planos: Record<TipoPlano, PlanoLimites> = {
  gratis: {
    id: "gratis",
    nome: "Grátis",
    preco: 0,
    vitrine: 10,
    panfletos: 0,
    promocoes: 0,
    whatsapp: 0,
    tourVirtual: false,
    assistenteIA: false,
    crm: false,
    pinMapa: false,
    notificacaoPesquisa: false,
    clientesProximos: false,
    sinalizacaoVisual: true,
    imagensPorProduto: 1,
  },
  start: {
    id: "start",
    nome: "Start",
    preco: 297,
    vitrine: 30,
    panfletos: 20,
    promocoes: 5,
    whatsapp: 1,
    tourVirtual: false,
    assistenteIA: "Básico",
    crm: true,
    pinMapa: true,
    notificacaoPesquisa: true,
    clientesProximos: true,
    sinalizacaoVisual: true,
    imagensPorProduto: 2,
  },
  basico: {
    id: "basico",
    nome: "Básico",
    preco: 799,
    popular: true,
    vitrine: 0, // Não disponível neste plano
    panfletos: 30,
    promocoes: 10,
    whatsapp: 1,
    tourVirtual: false,
    assistenteIA: "Básico",
    crm: true,
    pinMapa: true,
    notificacaoPesquisa: true,
    clientesProximos: true,
    sinalizacaoVisual: true,
    imagensPorProduto: 3,
  },
  completo: {
    id: "completo",
    nome: "Completo",
    preco: 1599,
    vitrine: 60,
    panfletos: 50,
    promocoes: 20,
    whatsapp: 1,
    tourVirtual: "Básico",
    assistenteIA: "Básico",
    crm: true,
    pinMapa: true,
    notificacaoPesquisa: true,
    clientesProximos: true,
    sinalizacaoVisual: true,
    imagensPorProduto: 3,
  },
  premium: {
    id: "premium",
    nome: "Premium",
    preco: 2200,
    vitrine: 120,
    panfletos: 100,
    promocoes: 50,
    whatsapp: 2,
    tourVirtual: "Completo",
    assistenteIA: "Completo",
    crm: true,
    pinMapa: true,
    notificacaoPesquisa: true,
    clientesProximos: true,
    sinalizacaoVisual: true,
    imagensPorProduto: 5,
  },
  empresarial: {
    id: "empresarial",
    nome: "Empresarial",
    preco: 5000,
    vitrine: 400,
    panfletos: 200,
    promocoes: 100,
    whatsapp: 4,
    tourVirtual: "Premium",
    assistenteIA: "Premium",
    crm: true,
    pinMapa: true,
    notificacaoPesquisa: true,
    clientesProximos: true,
    sinalizacaoVisual: true,
    imagensPorProduto: 5,
  },
}

export function getPlanoById(id: string): PlanoLimites | null {
  const planoKey = Object.keys(planos).find((key) => planos[key as TipoPlano].id === id)
  return planoKey ? planos[planoKey as TipoPlano] : null
}

export function getPlanoDoUsuario(planoId?: string): PlanoLimites {
  if (!planoId) return planos.gratis

  const plano = getPlanoById(planoId)
  return plano || planos.gratis
}

