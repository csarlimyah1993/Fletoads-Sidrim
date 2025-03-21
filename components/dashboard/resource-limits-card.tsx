"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"

interface ResourceLimits {
  panfletos: {
    used: number
    limit: number
    percentage: number
  }
  produtos: {
    used: number
    limit: number
    percentage: number
  }
  armazenamento: {
    used: number
    limit: number
    percentage: number
  }
}

export function ResourceLimitsCard() {
  const [resourceLimits, setResourceLimits] = useState<ResourceLimits | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchResourceLimits = async () => {
      try {
        const response = await fetch("/api/resource-limits")
        if (!response.ok) {
          throw new Error("Falha ao carregar limites de recursos")
        }
        const data = await response.json()
        setResourceLimits(data)
      } catch (error) {
        console.error("Erro ao carregar limites de recursos:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os limites de recursos. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchResourceLimits()
  }, [toast])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="animate-pulse bg-muted h-6 w-48 rounded"></CardTitle>
          <CardDescription className="animate-pulse bg-muted h-4 w-64 rounded"></CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <span className="animate-pulse bg-muted h-4 w-24 rounded"></span>
                <span className="animate-pulse bg-muted h-4 w-16 rounded"></span>
              </div>
              <div className="animate-pulse bg-muted h-4 w-full rounded"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  if (!resourceLimits) {
    return null
  }

  const formatStorage = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    if (mb < 1024) {
      return `${mb.toFixed(2)} MB`
    } else {
      return `${(mb / 1024).toFixed(2)} GB`
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites de Recursos</CardTitle>
        <CardDescription>Monitore o uso dos recursos da sua conta.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Panfletos</span>
            <span className="text-sm text-muted-foreground">
              {resourceLimits.panfletos.used} de {resourceLimits.panfletos.limit}
            </span>
          </div>
          <Progress value={resourceLimits.panfletos.percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Produtos</span>
            <span className="text-sm text-muted-foreground">
              {resourceLimits.produtos.used} de {resourceLimits.produtos.limit}
            </span>
          </div>
          <Progress value={resourceLimits.produtos.percentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm font-medium">Armazenamento</span>
            <span className="text-sm text-muted-foreground">
              {formatStorage(resourceLimits.armazenamento.used)} de {formatStorage(resourceLimits.armazenamento.limit)}
            </span>
          </div>
          <Progress value={resourceLimits.armazenamento.percentage} className="h-2" />
        </div>

        <Button className="w-full" variant="outline">
          Aumentar Limites
        </Button>
      </CardContent>
    </Card>
  )
}

