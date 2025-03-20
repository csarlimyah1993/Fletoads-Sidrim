"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useResourceLimits } from "@/hooks/use-resource-limits"
import { FileText, ShoppingBag, Bot, Zap } from "lucide-react"

export function ResourceLimitsCard() {
  const { limits, loading } = useResourceLimits()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Limites de Recursos</CardTitle>
          <CardDescription>Utilização dos recursos do seu plano</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                <div className="h-4 w-12 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </div>
              <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
            </div>
          ))}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Limites de Recursos</CardTitle>
        <CardDescription>Utilização dos recursos do seu plano</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {limits.panfletos && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="mr-2 h-4 w-4 text-violet-500" />
                <span>Panfletos</span>
              </div>
              <span className="font-medium">
                {limits.panfletos.current}/{limits.panfletos.limit}
              </span>
            </div>
            <Progress value={limits.panfletos.percentUsed} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{limits.panfletos.remaining} restantes</p>
          </div>
        )}

        {limits.produtos && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <ShoppingBag className="mr-2 h-4 w-4 text-violet-500" />
                <span>Produtos</span>
              </div>
              <span className="font-medium">
                {limits.produtos.current}/{limits.produtos.limit}
              </span>
            </div>
            <Progress value={limits.produtos.percentUsed} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{limits.produtos.remaining} restantes</p>
          </div>
        )}

        {limits.panAssistant && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Bot className="mr-2 h-4 w-4 text-violet-500" />
                <span>Pan Assistant</span>
              </div>
              <span className="font-medium">
                {limits.panAssistant.current}/{limits.panAssistant.limit}
              </span>
            </div>
            <Progress value={limits.panAssistant.percentUsed} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{limits.panAssistant.remaining} restantes</p>
          </div>
        )}

        {limits.hotPromos && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Zap className="mr-2 h-4 w-4 text-violet-500" />
                <span>Hot Promos</span>
              </div>
              <span className="font-medium">
                {limits.hotPromos.current}/{limits.hotPromos.limit}
              </span>
            </div>
            <Progress value={limits.hotPromos.percentUsed} className="h-2" />
            <p className="text-xs text-muted-foreground text-right">{limits.hotPromos.remaining} restantes</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

