"use client"
import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function DatabaseErrorFallback() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Problema de Conexão</CardTitle>
          </div>
          <CardDescription>Não foi possível conectar ao banco de dados neste momento.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Estamos enfrentando dificuldades para acessar o banco de dados. Isso pode ser devido a:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Problemas temporários de conexão</li>
            <li>Manutenção do servidor</li>
            <li>Problemas de rede</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => (window.location.href = "/dashboard")}>
            Voltar ao Dashboard
          </Button>
          <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

