"use client"

import Link from "next/link"
import { Check, ChevronRight, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface PlanoProps {
  _id: string
  nome: string
  slug: string
  preco: number
  descricao: string
  recursos: string[]
  popular?: boolean
  ativo: boolean
  limitacoes: {
    produtos: number
    lojas: number
    panfletos: number
    promocoes: number
    whatsapp: number
  }
}

export function PlanoCard({ plano }: { plano: PlanoProps }) {
  // Format the plan name to remove the "FletoAds - " prefix if present
  const displayName = plano.nome.replace("FletoAds - ", "")

  // Check if it's the "Empresarial" plan (either by slug or by checking if price is very high)
  const isEmpresarial = plano.slug === "empresarial" || plano.preco >= 9000

  return (
    <Card
      className={`flex flex-col h-full transition-all duration-200 hover:shadow-lg ${
        plano.popular ? "border-blue-500 dark:border-blue-400 shadow-md" : "dark:bg-gray-800 dark:border-gray-700"
      }`}
    >
      <CardHeader className="pb-4">
        {plano.popular && (
          <Badge className="self-start mb-2 bg-blue-600 text-white dark:bg-blue-500">Mais popular</Badge>
        )}
        <h3 className="text-xl font-bold dark:text-white">{displayName}</h3>
        <p className="text-muted-foreground dark:text-gray-300">{plano.descricao}</p>
        <div className="mt-2">
          {plano.preco === 0 ? (
            <span className="text-3xl font-bold dark:text-white">Grátis</span>
          ) : isEmpresarial ? (
            <span className="text-3xl font-bold dark:text-white">Personalizado</span>
          ) : (
            <div>
              <span className="text-3xl font-bold dark:text-white">
                R$ {plano.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
              <span className="text-muted-foreground ml-1 dark:text-gray-300">/mês</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <ul className="space-y-2">
          {plano.recursos.slice(0, 5).map((recurso, index) => (
            <li key={index} className="flex items-start">
              <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
              <span className="text-sm dark:text-gray-300">{recurso}</span>
            </li>
          ))}
          {plano.recursos.length > 5 && (
            <li className="text-sm text-muted-foreground mt-2 dark:text-gray-400">
              + {plano.recursos.length - 5} recursos adicionais
            </li>
          )}
        </ul>
      </CardContent>
      <CardFooter>
        {isEmpresarial ? (
          <Button asChild className="w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800">
            <Link href={`/contato?plano=${plano.slug}`}>
              <MessageCircle className="mr-2 h-4 w-4" />
              Fale Conosco
            </Link>
          </Button>
        ) : (
          <Button asChild className={`w-full ${plano.popular ? "bg-blue-600 hover:bg-blue-700" : ""}`}>
            <Link href={`/planos/${plano.slug}`}>
              Ver detalhes
              <ChevronRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

