"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Download, FileText, CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { Logo } from "@/components/logo"
import { WhatsAppButton } from "@/components/whatsapp-button"

// Nomes dos planos
const nomesPlanos = {
  gratis: "Grátis",
  start: "Start",
  basico: "Básico",
  completo: "Completo",
  premium: "Premium",
  empresarial: "Empresarial",
}

export default function ContratoClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [aceitouTermos, setAceitouTermos] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null)
  const [planoId, setPlanoId] = useState<string>(searchParams.get("plano") || "")
  const [periodo, setPeriodo] = useState<string>(searchParams.get("periodo") || "mensal")
  const [sessionId, setSessionId] = useState<string | null>(searchParams.get("session_id"))
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(searchParams.get("payment_intent_id"))

  // Verificar o status do pagamento ao carregar a página
  useEffect(() => {
    const verificarStatusPagamento = async () => {
      try {
        if (sessionId) {
          // Verificar status da sessão de checkout (cartão)
          const response = await fetch(`/api/checkout/status?session_id=${sessionId}`)
          const data = await response.json()

          if (response.ok) {
            setPaymentStatus(data.paymentStatus)
          } else {
            throw new Error(data.error || "Erro ao verificar status do pagamento")
          }
        } else if (paymentIntentId) {
          // Verificar status do PaymentIntent (PIX)
          const response = await fetch(`/api/checkout/pix/status?payment_intent_id=${paymentIntentId}`)
          const data = await response.json()

          if (response.ok) {
            setPaymentStatus(data.status)
          } else {
            throw new Error(data.error || "Erro ao verificar status do pagamento")
          }
        } else {
          // Sem ID de sessão ou PaymentIntent
          setPaymentStatus("missing_id")
        }
      } catch (error) {
        console.error("Erro ao verificar status do pagamento:", error)
        toast({
          title: "Erro",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao verificar o status do pagamento",
          variant: "destructive",
        })
        setPaymentStatus("error")
      } finally {
        setIsVerifying(false)
      }
    }

    verificarStatusPagamento()
  }, [sessionId, paymentIntentId, toast])

  const handleAssinar = async () => {
    if (!aceitouTermos) {
      toast({
        title: "Atenção",
        description: "Você precisa aceitar os termos para continuar.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Chamar a API para assinar o contrato
      const response = await fetch("/api/planos/assinar-contrato", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assinaturaId: sessionId || paymentIntentId,
          aceito: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao assinar contrato")
      }

      // Mostrar mensagem de sucesso
      toast({
        title: "Assinatura concluída!",
        description: `Seu plano ${nomesPlanos[planoId as keyof typeof nomesPlanos]} foi ativado com sucesso.`,
      })

      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Erro ao finalizar assinatura:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao finalizar a assinatura",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Renderizar mensagem de verificação de pagamento
  if (isVerifying) {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Loader2 className="mr-2 h-5 w-5 animate-spin text-primary" />
              Verificando pagamento
            </CardTitle>
            <CardDescription>Aguarde enquanto verificamos o status do seu pagamento...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Renderizar mensagem de erro se o pagamento não foi confirmado
  if (paymentStatus !== "paid" && paymentStatus !== "succeeded") {
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertCircle className="mr-2 h-5 w-5" />
              Pagamento não confirmado
            </CardTitle>
            <CardDescription>
              Não foi possível confirmar seu pagamento. Por favor, tente novamente ou entre em contato com o suporte.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button variant="outline" asChild className="w-full">
              <Link href="/planos/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para checkout
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Logo className="h-8 w-8" />
            <span className="font-bold text-xl">FletoAds</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/planos/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para checkout
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="max-w-4xl mx-auto">
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-5 w-5 text-primary" />
                Termos e Condições
              </CardTitle>
              <CardDescription>
                Por favor, leia atentamente os termos e condições antes de finalizar sua assinatura
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="texto" className="w-full">
                <TabsList className="grid w-full grid-cols-2 mb-4">
                  <TabsTrigger value="texto">Texto</TabsTrigger>
                  <TabsTrigger value="pdf">PDF</TabsTrigger>
                </TabsList>
                <TabsContent value="texto" className="border rounded-md p-4">
                  <div className="h-[500px] overflow-y-auto text-sm">
                    <h2 className="text-xl font-bold mb-4">TERMOS E CONDIÇÕES GERAIS DE USO</h2>
                    <p className="mb-4">
                      Os serviços da Plataforma "Fleto" são fornecidos pela RESZON – SERVIÇOS EM TECNOLOGIA E
                      DESENVOLVIMENTO DE SOFTWARE LTDA, inscrita no CNPJ nº 40.276.868/0001-33, titular da propriedade
                      intelectual sobre website, conteúdos e demais ativos relacionados aos serviços por ela prestados.
                    </p>

                    <h3 className="text-lg font-bold mt-6 mb-2">1 DAS DEFINIÇÕES</h3>
                    <p className="mb-2">
                      1.1 Para os efeitos deste instrumento, os vocábulos e expressões abaixo têm as seguintes
                      definições:
                    </p>
                    <ul className="list-disc pl-6 mb-4 space-y-1">
                      <li>
                        Lojista: Parceiro usuário da plataforma e suas funções, na condição de fornecedor e/ou prestador
                        do serviço e/ou produto divulgado, de acordo com o plano contratado;
                      </li>
                      <li>Consumidor final: a pessoa física que utiliza o produto e/ou serviço do parceiro Lojista;</li>
                      <li>Atualização de versão: É a disponibilização de novas versões do software;</li>
                      <li>Software/Plataforma(s): É a aplicação de autoria da RESZON;</li>
                      <li>Internet: É a rede mundial de computadores;</li>
                      <li>
                        Informações confidenciais: toda e qualquer informação verbal ou escrita, obtida direta ou
                        indiretamente pelas partes, em virtude do presente contrato e relativas a este;
                      </li>
                      <li>
                        Plano: oferta de serviços do produto de acordo com a grade de comercial dos respectivos
                        produtos.
                      </li>
                    </ul>

                    {/* Texto truncado para brevidade */}
                    <p className="text-sm text-muted-foreground mt-6">
                      O texto completo do contrato está disponível para download nos formatos PDF e DOCX.
                    </p>
                  </div>
                </TabsContent>
                <TabsContent value="pdf">
                  <div className="border rounded-md p-4 h-[500px]">
                    <iframe
                      src="/assets/termos_de_uso_lojista.pdf"
                      className="w-full h-full"
                      title="Termos e Condições"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-center mt-6">
                <Button variant="outline" className="flex items-center" asChild>
                  <a href="/assets/termos_de_uso_lojista.docx" download>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar contrato em Word (DOCX)
                  </a>
                </Button>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="aceite-termos"
                  checked={aceitouTermos}
                  onCheckedChange={(checked) => setAceitouTermos(checked as boolean)}
                />
                <label
                  htmlFor="aceite-termos"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Li e aceito os termos e condições acima e a política de privacidade
                </label>
              </div>
            </CardFooter>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/planos/checkout">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar
              </Link>
            </Button>
            <Button onClick={handleAssinar} disabled={isLoading || !aceitouTermos}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Assinar e Ativar
                  <CheckCircle2 className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}
