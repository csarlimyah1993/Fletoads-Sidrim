"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle, ArrowLeft, ShoppingCart } from "lucide-react"

export default function PagamentoCanceladoPage() {
  const router = useRouter()

  return (
    <div className="container max-w-md py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <XCircle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Pagamento Cancelado</CardTitle>
          <CardDescription>Seu pagamento não foi concluído</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>O processo de pagamento foi cancelado. Nenhum valor foi cobrado do seu cartão.</p>
          <p className="text-sm text-muted-foreground">
            Você pode tentar novamente ou escolher outro método de pagamento.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" onClick={() => router.push("/checkout")}>
            <ShoppingCart className="mr-2 h-4 w-4" />
            Voltar para o Checkout
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

