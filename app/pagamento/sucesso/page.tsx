"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Home, ShoppingBag } from "lucide-react"

export default function PagamentoSucessoPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")

  // Limpar carrinho após pagamento bem-sucedido
  useEffect(() => {
    if (sessionId) {
      localStorage.removeItem("carrinho")
      localStorage.removeItem("lojaId")
    }
  }, [sessionId])

  if (!sessionId) {
    router.push("/")
    return null
  }

  return (
    <div className="container max-w-md py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Confirmado!</CardTitle>
          <CardDescription>Seu pedido foi processado com sucesso</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Obrigado pela sua compra! Você receberá um e-mail com os detalhes do seu pedido em breve.</p>
          <p className="text-sm text-muted-foreground">ID da transação: {sessionId}</p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => router.push("/dashboard/pedidos")}>
            <ShoppingBag className="mr-2 h-4 w-4" />
            Ver Meus Pedidos
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push("/")}>
            <Home className="mr-2 h-4 w-4" />
            Voltar para a Página Inicial
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

