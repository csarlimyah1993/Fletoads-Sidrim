"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Store } from 'lucide-react'
import Link from "next/link"

interface VitrineCheckCardProps {
  userId: string
}

export function VitrineCheckCard({ userId }: VitrineCheckCardProps) {
  const [hasLoja, setHasLoja] = useState(false)
  const [hasVitrine, setHasVitrine] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkLojaVitrine = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/check-loja-vitrine?userId=${userId}`)
        
        if (response.ok) {
          const data = await response.json()
          setHasLoja(data.hasLoja)
          setHasVitrine(data.hasVitrine)
        }
      } catch (error) {
        console.error("Erro ao verificar loja e vitrine:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkLojaVitrine()
  }, [userId])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Carregando...
          </CardTitle>
        </CardHeader>
      </Card>
    )
  }

  if (hasLoja && hasVitrine) {
    return (
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5 text-green-600 dark:text-green-400" />
            Sua loja está online!
          </CardTitle>
          <CardDescription>
            Sua vitrine está configurada e pronta para receber clientes.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild variant="outline" className="w-full">
            <Link href="/dashboard/vitrine">
              Gerenciar Vitrine
            </Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Store className="h-5 w-5" />
          Crie sua Loja
        </CardTitle>
        <CardDescription>
          {hasLoja 
            ? "Você já tem uma loja cadastrada. Configure sua vitrine online."
            : "Você ainda não tem uma loja cadastrada. Crie sua loja para poder configurar sua vitrine online."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 list-disc pl-5 text-sm">
          <li>Cadastrar informações de contato e endereço</li>
          <li>Definir horários de funcionamento</li>
          <li>Personalizar sua identidade visual</li>
          <li>Criar uma vitrine online para seus produtos</li>
        </ul>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full">
          <Link href={hasLoja ? "/dashboard/vitrine/criar" : "/dashboard/perfil-da-loja/criar"}>
            {hasLoja ? "Criar Vitrine" : "Criar minha Loja"}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
