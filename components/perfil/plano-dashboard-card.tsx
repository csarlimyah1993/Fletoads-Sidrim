"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowUpRight, Package, Crown, Sparkles, FileText, ShoppingBag, Users, Rocket, Star } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

interface PlanoInfo {
  nome: string
  limitePanfletos: number
  limiteProdutos: number
  limiteClientes: number
  usoPanfletos: number
  usoProdutos: number
  usoClientes: number
  preco: number
  temPlanoSuperior: boolean
  temPlanoInferior: boolean
}

export function PlanoDashboardCard() {
  const [planoInfo, setPlanoInfo] = useState<PlanoInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [progressValues, setProgressValues] = useState({
    panfletos: 0,
    produtos: 0,
    clientes: 0,
  })

  useEffect(() => {
    const fetchPlanoInfo = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Tentar buscar informações do plano da API
        const response = await fetch("/api/user/plan")

        if (!response.ok) {
          // Se a API não estiver disponível, usar dados de exemplo
          console.warn("API de plano não disponível, usando dados de exemplo")
          setPlanoInfo({
            nome: "Plano Básico",
            limitePanfletos: 10,
            limiteProdutos: 50,
            limiteClientes: 100,
            usoPanfletos: 4,
            usoProdutos: 12,
            usoClientes: 25,
            preco: 29.9,
            temPlanoSuperior: true,
            temPlanoInferior: false,
          })
          return
        }

        const data = await response.json()
        setPlanoInfo(data)
      } catch (err) {
        console.error("Erro ao buscar informações do plano:", err)
        setError("Não foi possível carregar as informações do seu plano")

        // Usar dados de exemplo mesmo com erro
        setPlanoInfo({
          nome: "Plano Básico",
          limitePanfletos: 10,
          limiteProdutos: 50,
          limiteClientes: 100,
          usoPanfletos: 4,
          usoProdutos: 12,
          usoClientes: 25,
          preco: 29.9,
          temPlanoSuperior: true,
          temPlanoInferior: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlanoInfo()
  }, [])

  useEffect(() => {
    if (planoInfo) {
      // Animar as barras de progresso
      setTimeout(() => {
        setProgressValues({
          panfletos: (planoInfo.usoPanfletos / planoInfo.limitePanfletos) * 100,
          produtos: (planoInfo.usoProdutos / planoInfo.limiteProdutos) * 100,
          clientes: (planoInfo.usoClientes / planoInfo.limiteClientes) * 100,
        })
      }, 300)
    }
  }, [planoInfo])

  const getPlanoIcon = () => {
    if (!planoInfo || !planoInfo.nome) return <Package className="h-5 w-5" />

    const nomePlano = planoInfo.nome.toLowerCase()

    if (nomePlano.includes("básico")) return <Package className="h-5 w-5" />
    if (nomePlano.includes("premium")) return <Crown className="h-5 w-5" />
    if (nomePlano.includes("profissional")) return <Rocket className="h-5 w-5" />
    if (nomePlano.includes("empresarial")) return <Star className="h-5 w-5" />

    return <Sparkles className="h-5 w-5" />
  }

  if (isLoading) {
    return (
      <Card className="overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-5 w-5" />
              <span>Seu Plano</span>
            </CardTitle>
            <div className="animate-pulse h-6 w-20 bg-white/20 rounded"></div>
          </div>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between">
                  <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </CardFooter>
      </Card>
    )
  }

  if (!planoInfo) return null

  // Garantir que o preço existe antes de chamar toFixed
  const precoFormatado = planoInfo.preco ? `R$ ${planoInfo.preco.toFixed(2)}/mês` : "Preço indisponível"

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardHeader className="pb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getPlanoIcon()}
            <span>Seu Plano</span>
          </CardTitle>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold"
          >
            {planoInfo.nome || "Plano"}
          </motion.div>
        </div>
        <CardDescription className="text-white/90 font-medium">{precoFormatado}</CardDescription>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-500" />
                <span>Panfletos</span>
              </span>
              <span className="text-muted-foreground font-medium">
                {planoInfo.usoPanfletos} de {planoInfo.limitePanfletos}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progressValues.panfletos}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
                className={`h-full rounded-full ${
                  progressValues.panfletos > 80
                    ? "bg-red-500"
                    : progressValues.panfletos > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-purple-500" />
                <span>Produtos</span>
              </span>
              <span className="text-muted-foreground font-medium">
                {planoInfo.usoProdutos} de {planoInfo.limiteProdutos}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progressValues.produtos}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={`h-full rounded-full ${
                  progressValues.produtos > 80
                    ? "bg-red-500"
                    : progressValues.produtos > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-500" />
                <span>Clientes</span>
              </span>
              <span className="text-muted-foreground font-medium">
                {planoInfo.usoClientes} de {planoInfo.limiteClientes}
              </span>
            </div>
            <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: "0%" }}
                animate={{ width: `${progressValues.clientes}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.4 }}
                className={`h-full rounded-full ${
                  progressValues.clientes > 80
                    ? "bg-red-500"
                    : progressValues.clientes > 60
                      ? "bg-yellow-500"
                      : "bg-green-500"
                }`}
              />
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        {planoInfo.temPlanoSuperior ? (
          <Button
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
            asChild
          >
            <Link href="/planos">
              <motion.div
                className="flex items-center justify-center w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Rocket className="mr-2 h-4 w-4" />
                Fazer upgrade de plano
              </motion.div>
            </Link>
          </Button>
        ) : planoInfo.temPlanoInferior ? (
          <Button
            variant="outline"
            className="w-full border-blue-500 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950"
            asChild
          >
            <Link href="/planos">
              <motion.div
                className="flex items-center justify-center w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Ver planos disponíveis
              </motion.div>
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full" asChild>
            <Link href="/planos">
              <motion.div
                className="flex items-center justify-center w-full"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Package className="mr-2 h-4 w-4" />
                Ver planos
              </motion.div>
            </Link>
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
