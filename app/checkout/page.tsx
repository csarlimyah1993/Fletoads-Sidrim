"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"
import { Loader2, CreditCard, ShoppingCart, ArrowLeft } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [carrinho, setCarrinho] = useState<any[]>([])
  const [lojaId, setLojaId] = useState<string>("")

  // Buscar dados do carrinho
  useEffect(() => {
    const carrinhoLocal = localStorage.getItem("carrinho")
    const lojaIdLocal = localStorage.getItem("lojaId")

    if (!carrinhoLocal || !lojaIdLocal) {
      toast.error("Carrinho vazio ou loja não identificada")
      router.push("/")
      return
    }

    try {
      const carrinhoData = JSON.parse(carrinhoLocal)
      setCarrinho(carrinhoData)
      setLojaId(lojaIdLocal)
    } catch (error) {
      console.error("Erro ao carregar carrinho:", error)
      toast.error("Erro ao carregar carrinho")
      router.push("/")
    } finally {
      setIsLoading(false)
    }
  }, [router])

  // Calcular total
  const calcularTotal = () => {
    return carrinho.reduce((total, item) => {
      return total + (item.precoPromocional || item.preco) * item.quantidade
    }, 0)
  }

  // Formatar moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Processar pagamento
  const processarPagamento = async () => {
    try {
      setIsProcessing(true)

      // Preparar itens para o checkout
      const itens = carrinho.map((item) => ({
        produtoId: item._id,
        quantidade: item.quantidade,
      }))

      // Enviar para a API
      const response = await fetch("/api/pagamentos/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          itens,
          lojaId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao processar pagamento")
      }

      const data = await response.json()

      // Redirecionar para a página de checkout da Stripe
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("URL de checkout não fornecida")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao processar pagamento")
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container max-w-4xl py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-12">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Resumo do Pedido</CardTitle>
              <CardDescription>Revise os itens do seu pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {carrinho.map((item) => (
                <div key={item._id} className="flex justify-between items-center py-2 border-b">
                  <div className="flex items-center space-x-4">
                    {item.imagens && item.imagens.length > 0 ? (
                      <img
                        src={item.imagens[0] || "/placeholder.svg"}
                        alt={item.nome}
                        className="h-16 w-16 object-cover rounded-md"
                      />
                    ) : (
                      <div className="h-16 w-16 bg-gray-100 rounded-md flex items-center justify-center">
                        <ShoppingCart className="h-6 w-6 text-gray-400" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium">{item.nome}</p>
                      <p className="text-sm text-muted-foreground">Qtd: {item.quantidade}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      {formatarMoeda((item.precoPromocional || item.preco) * item.quantidade)}
                    </p>
                    {item.precoPromocional && (
                      <p className="text-sm text-muted-foreground line-through">
                        {formatarMoeda(item.preco * item.quantidade)}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-4">
                <div className="flex justify-between py-2">
                  <p>Subtotal</p>
                  <p className="font-medium">{formatarMoeda(calcularTotal())}</p>
                </div>
                <div className="flex justify-between py-2">
                  <p>Frete</p>
                  <p className="font-medium">Grátis</p>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between py-2">
                  <p className="font-bold">Total</p>
                  <p className="font-bold">{formatarMoeda(calcularTotal())}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Pagamento</CardTitle>
              <CardDescription>Escolha como deseja pagar</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Método de Pagamento</Label>
                <div className="flex items-center space-x-2 p-3 border rounded-md bg-primary/5">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <span>Cartão de Crédito/Débito</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Você será redirecionado para o checkout seguro da Stripe para finalizar seu pagamento.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                size="lg"
                onClick={processarPagamento}
                disabled={isProcessing || carrinho.length === 0}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>Finalizar Compra ({formatarMoeda(calcularTotal())})</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

