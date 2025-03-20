"use client"

import { motion } from "framer-motion"
import { Check, ChevronRight, MessageCircle } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface PlanoDetalhesProps {
  plano: {
    _id: string
    nome: string
    slug: string
    preco: number
    popular?: boolean
    recursos: string[]
    descricao: string
    detalhes: string
    limitacoes: {
      produtos: number
      lojas: number
      panfletos: number
      promocoes: number
      whatsapp: number
    }
  }
}

export function PlanoDetalhes({ plano }: PlanoDetalhesProps) {
  // Format the plan name to remove the "FletoAds - " prefix if present
  const displayName = plano.nome.replace("FletoAds - ", "")

  // Check if it's the "Empresarial" plan (either by slug or by checking if price is very high)
  const isEmpresarial = plano.slug === "empresarial" || plano.preco >= 9000

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2 flex items-center dark:text-white">
              {displayName}
              {plano.popular && <Badge className="ml-2 bg-blue-600 text-white">Mais popular</Badge>}
            </h1>
            <p className="text-xl text-muted-foreground dark:text-gray-300">{plano.descricao}</p>
          </div>

          <div className="text-4xl font-bold dark:text-white">
            {plano.preco === 0
              ? "Grátis"
              : isEmpresarial
                ? "Personalizado"
                : `R$ ${plano.preco.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
            {!isEmpresarial && plano.preco > 0 && (
              <span className="text-xl text-muted-foreground dark:text-gray-300 ml-1">/mês</span>
            )}
          </div>

          <div className="prose max-w-none dark:prose-invert">
            <p className="dark:text-gray-300">{plano.detalhes}</p>
          </div>

          {isEmpresarial ? (
            <Button
              asChild
              size="lg"
              className="w-full md:w-auto bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800"
            >
              <Link href="/contato?plano=empresarial">
                <MessageCircle className="mr-2 h-4 w-4" />
                Fale Conosco
              </Link>
            </Button>
          ) : (
            <Button size="lg" className="w-full md:w-auto">
              Assinar este plano
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="h-full dark:bg-gray-800 dark:border-gray-700">
          <CardHeader>
            <CardTitle className="dark:text-white">Recursos incluídos</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {plano.recursos.map((recurso, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 + index * 0.05 }}
                  style={{ display: 'flex', alignItems: 'flex-start' }}
                >
                  <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="dark:text-gray-300">{recurso}</span>
                </motion.li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              Todos os planos incluem suporte técnico e atualizações gratuitas.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}

