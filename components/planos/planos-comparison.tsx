"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Check, X } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const planos = [
  {
    id: "gratis",
    nome: "FletoAds - Grátis",
    preco: 0,
  },
  {
    id: "start",
    nome: "FletoAds - Start",
    preco: 297,
  },
  {
    id: "basico",
    nome: "FletoAds - Básico",
    preco: 799,
    popular: true,
  },
  {
    id: "completo",
    nome: "FletoAds - Completo",
    preco: 1599,
  },
  {
    id: "premium",
    nome: "FletoAds - Premium",
    preco: 2200,
  },
  {
    id: "empresarial",
    nome: "FletoAds - Empresarial",
    preco: 5000,
  },
]

const recursos = [
  {
    nome: "Vitrine WEB",
    descricao: "Quantidade de produtos na vitrine",
    valores: {
      gratis: "10 unidades",
      start: "30 unidades",
      basico: "Não incluso",
      completo: "60 unidades",
      premium: "120 unidades",
      empresarial: "400 unidades",
    },
  },
  {
    nome: "Panfletos",
    descricao: "Quantidade de panfletos digitais",
    valores: {
      gratis: "Não incluso",
      start: "20 unidades",
      basico: "30 unidades",
      completo: "50 unidades",
      premium: "100 unidades",
      empresarial: "200 unidades",
    },
  },
  {
    nome: "Hot Promos",
    descricao: "Quantidade de promoções em destaque",
    valores: {
      gratis: "Não incluso",
      start: "5 unidades",
      basico: "10 unidades",
      completo: "20 unidades",
      premium: "50 unidades",
      empresarial: "100 unidades",
    },
  },
  {
    nome: "WhatsApp",
    descricao: "Número de contas WhatsApp integradas",
    valores: {
      gratis: "Não incluso",
      start: "1",
      basico: "1",
      completo: "1",
      premium: "2",
      empresarial: "4",
    },
  },
  {
    nome: "Tour Virtual",
    descricao: "Tour 360° do seu estabelecimento",
    valores: {
      gratis: "Não incluso",
      start: "Não incluso",
      basico: "Não incluso",
      completo: "Básico",
      premium: "Completo",
      empresarial: "Premium",
    },
  },
  {
    nome: "Pan Assistente",
    descricao: "Assistente virtual com IA",
    valores: {
      gratis: "Não incluso",
      start: "Básico",
      basico: "Básico",
      completo: "Básico",
      premium: "Completo",
      empresarial: "Premium",
    },
  },
  {
    nome: "CRM",
    descricao: "Gestão de relacionamento com clientes",
    valores: {
      gratis: "Não incluso",
      start: "Incluso",
      basico: "Incluso",
      completo: "Incluso",
      premium: "Incluso",
      empresarial: "Incluso",
    },
  },
  {
    nome: "Pin no Mapa",
    descricao: "Localização no mapa interativo",
    valores: {
      gratis: "Não incluso",
      start: "Incluso",
      basico: "Incluso",
      completo: "Incluso",
      premium: "Incluso",
      empresarial: "Incluso",
    },
  },
  {
    nome: "Notificação de pesquisa",
    descricao: "Alertas de pesquisas relacionadas",
    valores: {
      gratis: "Não incluso",
      start: "Incluso",
      basico: "Incluso",
      completo: "Incluso",
      premium: "Incluso",
      empresarial: "Incluso",
    },
  },
  {
    nome: "Clientes Próximos",
    descricao: "Identificação de clientes na região",
    valores: {
      gratis: "Não incluso",
      start: "Incluso",
      basico: "Incluso",
      completo: "Incluso",
      premium: "Incluso",
      empresarial: "Incluso",
    },
  },
  {
    nome: "Sinalização visual",
    descricao: "Elementos visuais para destaque",
    valores: {
      gratis: "Incluso",
      start: "Incluso",
      basico: "Incluso",
      completo: "Incluso",
      premium: "Incluso",
      empresarial: "Incluso",
    },
  },
]

export function PlanosComparison() {
  const [visiblePlanos, setVisiblePlanos] = useState(planos.map((p) => p.id))

  const togglePlano = (planoId: string) => {
    if (visiblePlanos.includes(planoId)) {
      if (visiblePlanos.length > 1) {
        setVisiblePlanos(visiblePlanos.filter((id) => id !== planoId))
      }
    } else {
      setVisiblePlanos([...visiblePlanos, planoId])
    }
  }

  const renderValor = (valor: string) => {
    if (valor === "Não incluso") {
      return <X className="h-5 w-5 text-red-500 mx-auto" />
    } else if (valor === "Incluso") {
      return <Check className="h-5 w-5 text-green-500 mx-auto" />
    } else {
      return <span className="text-sm">{valor}</span>
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold mb-4">Compare os planos</h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Veja lado a lado os recursos de cada plano para escolher o que melhor atende às suas necessidades
        </p>
      </motion.div>

      <div className="mb-6 flex flex-wrap gap-2 justify-center">
        {planos.map((plano) => (
          <Button
            key={plano.id}
            variant={visiblePlanos.includes(plano.id) ? "default" : "outline"}
            onClick={() => togglePlano(plano.id)}
            className="relative"
          >
            {plano.nome.replace("FletoAds - ", "")}
            {plano.popular && (
              <Badge className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs">Popular</Badge>
            )}
          </Button>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Recurso</TableHead>
              {planos
                .filter((p) => visiblePlanos.includes(p.id))
                .map((plano) => (
                  <TableHead key={plano.id} className="text-center min-w-[150px] relative">
                    <div className="font-bold">{plano.nome.replace("FletoAds - ", "")}</div>
                    <div className="font-medium">
                      {plano.preco === 0
                        ? "Grátis"
                        : `R$ ${plano.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}/mês`}
                    </div>
                    {plano.popular && (
                      <Badge className="absolute -top-2 right-2 bg-blue-600 text-white text-xs">Popular</Badge>
                    )}
                  </TableHead>
                ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {recursos.map((recurso) => (
              <TableRow key={recurso.nome}>
                <TableCell className="font-medium">
                  <div>{recurso.nome}</div>
                  <div className="text-xs text-muted-foreground">{recurso.descricao}</div>
                </TableCell>
                {planos
                  .filter((p) => visiblePlanos.includes(p.id))
                  .map((plano) => (
                    <TableCell key={plano.id} className="text-center">
                      {renderValor(recurso.valores[plano.id as keyof typeof recurso.valores])}
                    </TableCell>
                  ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

