"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"
import { Loader2 } from "lucide-react"

interface ResourceLimit {
  name: string
  used: number
  limit: number
  unit: string
}

export function ResourceLimitsCard() {
  const [isLoading, setIsLoading] = useState(true)
  const [resources, setResources] = useState<ResourceLimit[]>([])

  useEffect(() => {
    const fetchResourceLimits = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/user/resource-limits")

        if (!response.ok) {
          throw new Error("Falha ao carregar limites de recursos")
        }

        const data = await response.json()
        setResources(data.resources)
      } catch (error) {
        console.error("Erro ao buscar limites de recursos:", error)
        // Dados de fallback em caso de erro
        setResources([
          {
            name: "Integrações",
            used: 2,
            limit: 3,
            unit: "",
          },
          {
            name: "Armazenamento",
            used: 250,
            limit: 500,
            unit: "MB",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchResourceLimits()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Limites do Plano</CardTitle>
          <CardDescription>Utilização dos recursos do seu plano atual.</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-6">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites do Plano</CardTitle>
        <CardDescription>Utilização dos recursos do seu plano atual.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {resources.map((resource) => (
          <div key={resource.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{resource.name}</span>
              <span className="text-sm text-muted-foreground">
                {resource.used} / {resource.limit} {resource.unit}
              </span>
            </div>
            <Progress
              value={(resource.used / resource.limit) * 100}
              className="h-2"
              aria-label={`${resource.name}: ${resource.used} de ${resource.limit} ${resource.unit} utilizados`}
            />
          </div>
        ))}

        <Button variant="outline" className="w-full mt-4" asChild>
          <a href="/dashboard/planos">Atualizar Plano</a>
        </Button>
      </CardContent>
    </Card>
  )
}

