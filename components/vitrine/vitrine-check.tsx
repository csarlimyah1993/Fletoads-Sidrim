"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Store, ExternalLink } from "lucide-react"
import Link from "next/link"

interface VitrineStatus {
  temVitrine: boolean
  vitrineId?: string
  vitrineUrl?: string
  vitrineName?: string
}

export function VitrineCheck() {
  const [vitrineStatus, setVitrineStatus] = useState<VitrineStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const checkVitrine = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Verificar se o usuário tem uma loja com vitrine
        const response = await fetch("/api/check-loja-vitrine")

        if (!response.ok) {
          throw new Error(`Erro ao verificar vitrine: ${response.status}`)
        }

        const data = await response.json()
        setVitrineStatus(data)
      } catch (err) {
        console.error("Erro ao verificar vitrine:", err)
        setError("Não foi possível verificar sua vitrine")

        // Definir status padrão em caso de erro
        setVitrineStatus({
          temVitrine: false,
        })
      } finally {
        setIsLoading(false)
      }
    }

    checkVitrine()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitrine Online</CardTitle>
          <CardDescription>Verificando status da sua vitrine...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitrine Online</CardTitle>
          <CardDescription>Ocorreu um erro ao verificar sua vitrine</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{error}</p>
        </CardContent>
        <CardFooter>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (!vitrineStatus?.temVitrine) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vitrine Online</CardTitle>
          <CardDescription>Você ainda não tem uma vitrine configurada</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6">
            <Store className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-sm text-center text-muted-foreground mb-4">
              Configure sua vitrine online para exibir seus produtos e serviços na internet.
            </p>
          </div>
        </CardContent>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/dashboard/vitrine/criar">Criar Vitrine</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vitrine Online</CardTitle>
        <CardDescription>Sua vitrine está ativa</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-4">
          <Store className="h-12 w-12 text-primary mb-4" />
          <h3 className="text-lg font-medium mb-1">{vitrineStatus.vitrineName || "Minha Vitrine"}</h3>
          <p className="text-sm text-center text-muted-foreground mb-4">
            Sua vitrine está online e pronta para receber visitantes.
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2">
        <Button asChild className="w-full">
          <Link href={`/dashboard/vitrine/editar/${vitrineStatus.vitrineId}`}>Gerenciar Vitrine</Link>
        </Button>
        <Button variant="outline" asChild className="w-full">
          <Link href={vitrineStatus.vitrineUrl || "#"} target="_blank">
            <ExternalLink className="mr-2 h-4 w-4" />
            Visualizar Vitrine
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
