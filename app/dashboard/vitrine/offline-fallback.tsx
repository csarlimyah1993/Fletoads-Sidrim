"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, RefreshCw, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

export function OfflineFallback() {
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Vitrine Online</h1>
          <p className="text-muted-foreground">Personalize e gerencie sua vitrine online</p>
        </div>
      </div>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <CardTitle>Modo Offline</CardTitle>
          </div>
          <CardDescription>
            Não foi possível conectar ao banco de dados. Algumas funcionalidades estão limitadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Você pode:</p>
          <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
            <li>Verificar sua conexão com a internet</li>
            <li>Tentar novamente em alguns minutos</li>
            <li>Navegar para outras seções do aplicativo</li>
          </ul>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => router.push("/dashboard")} className="w-full sm:w-auto">
            <ExternalLink className="mr-2 h-4 w-4" />
            Voltar para Dashboard
          </Button>
          <Button onClick={() => window.location.reload()} className="w-full sm:w-auto">
            <RefreshCw className="mr-2 h-4 w-4" />
            Tentar Novamente
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Informações da Vitrine</CardTitle>
          <CardDescription>
            As informações da sua vitrine não estão disponíveis no momento devido a problemas de conexão.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Quando a conexão for restabelecida, você poderá:</p>
          <ul className="list-disc pl-5 mt-2 text-sm text-muted-foreground space-y-1">
            <li>Ver o link da sua vitrine</li>
            <li>Editar as informações da loja</li>
            <li>Personalizar a aparência da vitrine</li>
            <li>Gerenciar produtos e categorias</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
