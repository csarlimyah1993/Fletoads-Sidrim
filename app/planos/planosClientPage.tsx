"use client"
import { PlanosSection } from "@/components/planos/planos-section"
import { PlanosHeader } from "@/components/planos/planos-header"
import { PlanosComparison } from "@/components/planos/planos-comparison"
import { PlanosFAQ } from "@/components/planos/planos-faq"

interface Plano {
  _id: string
  nome: string
  slug: string
  preco: number
  popular: boolean
  descricao: string
  recursos: {
    tourVirtual: {
      disponivel: boolean
      tipo: string
      descricao: string
    }
    panAssistente: {
      disponivel: boolean
      quantidade: number
      tipo: string
    }
    vitrineWeb: {
      disponivel: boolean
      limiteProdutos: number
    }
    panfletos: {
      disponivel: boolean
      limite: number
    }
    hotPromos: {
      disponivel: boolean
      limite: number
    }
    pinMapa: boolean
    notificacaoPesquisa: boolean
    clientesProximos: boolean
    sinalizacaoVisual: boolean
  }
  ordem: number
}

export default function PlanosClientPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <PlanosHeader />
      <PlanosSection />
      <PlanosComparison />
      <PlanosFAQ />
    </div>
  )
}

