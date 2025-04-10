"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CrownIcon } from "lucide-react"
import { useState, useEffect } from "react"

export function PlanoInfoCard() {
  const [plano, setPlano] = useState<{
    nome: string
    dataExpiracao?: string
  } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlano = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setPlano(data)
        }
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPlano()
  }, [])

  if (loading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
          <CrownIcon className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <p className="text-sm">Carregando...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Seu Plano</CardTitle>
        <CrownIcon className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-lg font-medium">{plano?.nome || "Plano Básico"}</p>
          {plano?.dataExpiracao && (
            <p className="text-xs text-muted-foreground">
              Expira em: {new Date(plano.dataExpiracao).toLocaleDateString("pt-BR")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
