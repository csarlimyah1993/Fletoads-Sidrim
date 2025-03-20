"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"
import { PlanoCard } from "./plano-card"

interface Plano {
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

export function PlanosSection() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchPlanos = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/planos")

        if (!response.ok) {
          throw new Error("Erro ao carregar planos")
        }

        const data = await response.json()

        // Filter only active plans and sort them by price
        const activePlanos = Array.isArray(data)
          ? data.filter((plano) => plano.ativo).sort((a, b) => a.preco - b.preco)
          : []

        setPlanos(activePlanos)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar planos:", err)
        setError("Não foi possível carregar os planos. Tente novamente mais tarde.")
        setPlanos([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlanos()
  }, [])

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-40">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  if (planos.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-center items-center h-40">
          <p className="text-muted-foreground">Nenhum plano disponível no momento.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {planos.map((plano) => (
          <motion.div key={plano._id} variants={item}>
            <PlanoCard plano={plano} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}

