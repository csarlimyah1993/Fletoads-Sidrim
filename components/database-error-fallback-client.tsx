"use client"

import { AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"

export function DatabaseErrorFallbackClient() {
  const router = useRouter()

  return (
    <div className="container flex items-center justify-center min-h-[70vh]">
      <Card className="mx-auto max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Problema de Conexão</CardTitle>
          </div>
          <CardDescription>Não foi possível conectar ao banco de dados</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Estamos enfrentando problemas para conectar ao servidor de banco de dados. Isso pode ser devido a:
          </p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Problemas temporários de rede</li>
            <li>O servidor de banco de dados pode estar em manutenção</li>
            <li>Configurações incorretas de conexão</li>
          </ul>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.refresh()}>
            Tentar Novamente
          </Button>
          <Button onClick={() => router.push("/dashboard")}>Voltar para Dashboard</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

