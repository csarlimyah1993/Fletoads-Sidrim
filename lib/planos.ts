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
  // Novas propriedades para personalização da vitrine
  personalizacaoVitrine: {
    banner: boolean
    logo: boolean
    cores: {
      primaria: boolean
      secundaria: boolean
      texto: boolean
      destaque: boolean
    }
    fontes: boolean
    layouts: number // Número de layouts disponíveis
    animacoes: boolean
    widgets: number // Número de widgets disponíveis
  }
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
    // Aumentando as opções de personalização para o plano gratuito
    personalizacaoVitrine: {
      banner: true, // Agora permitido no plano gratuito
      logo: true,
      cores: {
        primaria: true,
        secundaria: true,
        texto: true,
        destaque: false, // Apenas para planos pagos
      },
      fontes: false,
      layouts: 2, // Dois layouts básicos
      animacoes: false,
      widgets: 3, // Aumentado para 3 widgets no plano gratuito
    },
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
    personalizacaoVitrine: {
      banner: true,
      logo: true,
      cores: {
        primaria: true,
        secundaria: true,
        texto: true,
        destaque: true,
      },
      fontes: true,
      layouts: 4,
      animacoes: false,
      widgets: 5,
    },
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
    personalizacaoVitrine: {
      banner: true,
      logo: true,
      cores: {
        primaria: true,
        secundaria: true,
        texto: true,
        destaque: true,
      },
      fontes: true,
      layouts: 4,
      animacoes: false,
      widgets: 5,
    },
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
    personalizacaoVitrine: {
      banner: true,
      logo: true,
      cores: {
        primaria: true,
        secundaria: true,
        texto: true,
        destaque: true,
      },
      fontes: true,
      layouts: 6,
      animacoes: true,
      widgets: 7,
    },
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
    personalizacaoVitrine: {
      banner: true,
      logo: true,
      cores: {
        primaria: true,
        secundaria: true,
        texto: true,
        destaque: true,
      },
      fontes: true,
      layouts: 8,
      animacoes: true,
      widgets: 10,
    },
  },
  empresarial: {
    id: "empresarial",
    nome: "Empresarial",
    preco: 0, // Alterado para 0 para indicar "Entre em contato"
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
    personalizacaoVitrine: {
      banner: true,
      logo: true,
      cores: {
        primaria: true,
        secundaria: true,
        texto: true,
        destaque: true,
      },
      fontes: true,
      layouts: 12,
      animacoes: true,
      widgets: 12,
    },
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

// Add the missing function to get a plan by its slug (assuming slug is the same as id)
export function getPlanoBySlug(slug: string): PlanoLimites | null {
  // First check if the slug directly matches a plan id
  const planoKey = Object.keys(planos).find((key) => key === slug || planos[key as TipoPlano].id === slug)

  if (planoKey) {
    return planos[planoKey as TipoPlano]
  }

  // If no match, try case-insensitive matching or handle slug variations
  const normalizedSlug = slug.toLowerCase()
  const planoKeyByNormalizedName = Object.keys(planos).find(
    (key) => key.toLowerCase() === normalizedSlug || planos[key as TipoPlano].nome.toLowerCase() === normalizedSlug,
  )

  return planoKeyByNormalizedName ? planos[planoKeyByNormalizedName as TipoPlano] : null
}
