"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Lock } from "lucide-react"

export function HotPromosSection() {
  return (
    <Card className="border-2 border-dashed border-yellow-500/50 bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-2xl">
              Hot Promos
              <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                Premium
              </Badge>
            </CardTitle>
            <CardDescription className="mt-2">
              Crie promoções relâmpago com alta conversão e alcance direcionado
            </CardDescription>
          </div>
          <Lock className="h-8 w-8 text-yellow-500/70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <h3 className="font-medium mb-2">Tempo limitado</h3>
            <p className="text-sm text-muted-foreground">Crie ofertas com contagem regressiva para gerar urgência</p>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <h3 className="font-medium mb-2">Segmentação avançada</h3>
            <p className="text-sm text-muted-foreground">Direcione suas promoções para o público certo</p>
          </div>
          <div className="bg-card/50 p-4 rounded-lg border border-border/50">
            <h3 className="font-medium mb-2">Análise em tempo real</h3>
            <p className="text-sm text-muted-foreground">Acompanhe o desempenho das suas promoções instantaneamente</p>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button variant="premium" className="w-full sm:w-auto">
          Fazer upgrade para desbloquear
        </Button>
      </CardFooter>
    </Card>
  )
}

