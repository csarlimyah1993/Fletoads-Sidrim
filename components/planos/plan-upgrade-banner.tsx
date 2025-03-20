"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import { useResourceLimits } from "@/hooks/use-resource-limits"
import Link from "next/link"

export function PlanUpgradeBanner() {
  const { limits, loading } = useResourceLimits()
  const [showBanner, setShowBanner] = useState(false)
  const [limitName, setLimitName] = useState("")

  useEffect(() => {
    if (!loading && limits) {
      // Verificar se algum limite está próximo de ser atingido (acima de 80%)
      const limitesProximosDeEsgotamento = Object.entries(limits).filter(
        ([key, value]) => value && value.percentUsed >= 80,
      )

      if (limitesProximosDeEsgotamento.length > 0) {
        setShowBanner(true)
        setLimitName(limitesProximosDeEsgotamento[0][0])
      } else {
        setShowBanner(false)
      }
    }
  }, [limits, loading])

  if (!showBanner) {
    return null
  }

  const limitDisplayNames: Record<string, string> = {
    panfletos: "panfletos",
    produtos: "produtos",
    panAssistant: "assistentes",
    hotPromos: "promoções",
  }

  const displayName = limitDisplayNames[limitName] || limitName

  return (
    <Card className="bg-amber-50 dark:bg-amber-950 border-amber-200 dark:border-amber-800">
      <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="font-medium">Você está próximo do limite de {displayName} do seu plano</p>
            <p className="text-sm text-muted-foreground">
              Faça um upgrade para aumentar seus limites e acessar mais recursos.
            </p>
          </div>
        </div>
        <Button asChild className="shrink-0">
          <Link href="/planos">Ver Planos</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

