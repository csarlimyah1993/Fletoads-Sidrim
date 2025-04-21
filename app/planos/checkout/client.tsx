"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import {
  ArrowLeft,
  CreditCard,
  CheckCircle2,
  ShieldCheck,
  Clock,
  Loader2,
  ArrowRight,
  Wallet,
  Receipt,
  BadgeCheck,
} from "lucide-react"
import { Logo } from "@/components/logo"
import { WhatsAppButton } from "@/components/whatsapp-button"
import { loadStripe } from "@stripe/stripe-js"

// Carregue o Stripe com sua chave pública
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// Nomes dos planos
const nomesPlanos = {
  gratis: "Grátis",
  start: "Start",
  basico: "Básico",
  completo: "Completo",
  premium: "Premium",
  empresarial: "Empresarial",
}

// Preços dos planos - Atualizados para corresponder aos valores dos cards
const precosPlanos = {
  gratis: { mensal: 0, anual: 0 },
  start: { mensal: 297, anual: 2851.2 },
  basico: { mensal: 799, anual: 7670.4 },
  completo: { mensal: 1599, anual: 15350.4 },
  premium: { mensal: 2200, anual: 21120 },
  empresarial: { mensal: 0, anual: 0 }, // Personalizado, valor a definir
}

export default function CheckoutClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [planoId, setPlanoId] = useState<string>("")
  const [periodo, setPeriodo] = useState<string>("mensal")
  const [formaPagamento, setFormaPagamento] = useState<string>("credito")
  const [numeroCartao, setNumeroCartao] = useState<string>("")
  const [nomeCartao, setNomeCartao] = useState<string>("")
  const [validadeCartao, setValidadeCartao] = useState<string>("")
  const [cvvCartao, setCvvCartao] = useState<string>("")

  // Adicionar novos estados para os campos de informações pessoais
  const [nome, setNome] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [documento, setDocumento] = useState<string>("")
  const [tipoDocumento, setTipoDocumento] = useState<string>("cpf")
  const [telefone, setTelefone] = useState<string>("")
  const [endereco, setEndereco] = useState<string>("")
  const [cidade, setCidade] = useState<string>("")
  const [estado, setEstado] = useState<string>("")
  const [cep, setCep] = useState<string>("")

  // Obter o ID do plano da URL
  useEffect(() => {
    const plano = searchParams.get("plano")
    const periodoParam = searchParams.get("periodo")

    if (plano) {
      setPlanoId(plano)
    } else {
      router.push("/planos")
    }

    if (periodoParam && (periodoParam === "mensal" || periodoParam === "anual")) {
      setPeriodo(periodoParam)
    }
  }, [searchParams, router])

  // Formatar número do cartão
  const formatarNumeroCartao = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    const grupos = apenasNumeros.match(/.{1,4}/g)
    return grupos ? grupos.join(" ") : apenasNumeros
  }

  // Formatar validade do cartão
  const formatarValidadeCartao = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 2) {
      return apenasNumeros
    }
    return `${apenasNumeros.slice(0, 2)}/${apenasNumeros.slice(2, 4)}`
  }

  // Adicionar funções para formatar os campos
  const formatarCPF = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 3) return apenasNumeros
    if (apenasNumeros.length <= 6) return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`
    if (apenasNumeros.length <= 9)
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`
    return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`
  }

  const formatarCNPJ = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 2) return apenasNumeros
    if (apenasNumeros.length <= 5) return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2)}`
    if (apenasNumeros.length <= 8)
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5)}`
    if (apenasNumeros.length <= 12)
      return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8)}`
    return `${apenasNumeros.slice(0, 2)}.${apenasNumeros.slice(2, 5)}.${apenasNumeros.slice(5, 8)}/${apenasNumeros.slice(8, 12)}-${apenasNumeros.slice(12, 14)}`
  }

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 2) return apenasNumeros
    if (apenasNumeros.length <= 6) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`
  }

  const formatarCEP = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 5) return apenasNumeros
    return `${apenasNumeros.slice(0, 5)}-${apenasNumeros.slice(5, 8)}`
  }

  const formatarDocumento = (valor: string) => {
    return tipoDocumento === "cpf" ? formatarCPF(valor) : formatarCNPJ(valor)
  }

  // Função para processar o pagamento com Stripe
  const processarPagamento = async () => {
    // Validar campos de informações pessoais
    if (!nome) {
      toast({
        title: "Erro",
        description: "Nome é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Erro",
        description: "Email inválido.",
        variant: "destructive",
      })
      return
    }

    if (!documento) {
      toast({
        title: "Erro",
        description: `${tipoDocumento.toUpperCase()} é obrigatório.`,
        variant: "destructive",
      })
      return
    }

    if (!telefone || telefone.replace(/\D/g, "").length < 10) {
      toast({
        title: "Erro",
        description: "Telefone inválido.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Se for plano grátis, redirecionar diretamente
      if (planoId === "gratis") {
        router.push(`/planos/contrato?id=gratis&plano=${planoId}&periodo=${periodo}`)
        return
      }

      // Criar uma sessão de checkout no Stripe
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          planoId,
          periodo,
          nome,
          email,
          documento,
          tipoDocumento,
          telefone,
          endereco,
          cidade,
          estado,
          cep,
          formaPagamento,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao processar pagamento")
      }

      // Redirecionar para a página de checkout do Stripe
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("URL de checkout não encontrada")
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro",
        description:
          error instanceof Error ? error.message : "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Calcular o valor do plano
  const valorPlano =
    planoId && precosPlanos[planoId as keyof typeof precosPlanos]
      ? precosPlanos[planoId as keyof typeof precosPlanos][periodo as keyof typeof precosPlanos.gratis]
      : 0

  // Calcular a economia no plano anual
  const economiaAnual =
    planoId && precosPlanos[planoId as keyof typeof precosPlanos] && periodo === "anual"
      ? precosPlanos[planoId as keyof typeof precosPlanos].mensal * 12 -
        precosPlanos[planoId as keyof typeof precosPlanos].anual
      : 0

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
              <Link href="/planos">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar para planos
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Resumo do pedido - Mantido exatamente como estava */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Receipt className="mr-2 h-5 w-5 text-primary" />
                    Resumo do Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Plano</span>
                    <span className="font-medium">{nomesPlanos[planoId as keyof typeof nomesPlanos] || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Período</span>
                    <span className="font-medium capitalize">{periodo}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium">
                      {valorPlano.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </span>
                  </div>
                  {periodo === "anual" && economiaAnual > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Economia anual</span>
                      <span className="font-medium">
                        {economiaAnual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                      </span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{valorPlano.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <ShieldCheck className="mr-2 h-4 w-4 text-green-500" />
                    <span>Pagamento 100% seguro</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="mr-2 h-4 w-4 text-blue-500" />
                    <span>Ativação imediata após pagamento</span>
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>

          {/* Formulário de pagamento */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wallet className="mr-2 h-5 w-5 text-primary" />
                  Informações de Pagamento
                </CardTitle>
                <CardDescription>Escolha a forma de pagamento e preencha os dados necessários</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Informações Pessoais */}
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Informações Pessoais</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome Completo *</Label>
                      <Input
                        id="nome"
                        placeholder="Seu nome completo"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="documento">{tipoDocumento === "cpf" ? "CPF" : "CNPJ"} *</Label>
                        <div className="flex items-center space-x-2">
                          <RadioGroup value={tipoDocumento} onValueChange={setTipoDocumento} className="flex space-x-2">
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="cpf" id="cpf" />
                              <Label htmlFor="cpf" className="text-xs cursor-pointer">
                                CPF
                              </Label>
                            </div>
                            <div className="flex items-center space-x-1">
                              <RadioGroupItem value="cnpj" id="cnpj" />
                              <Label htmlFor="cnpj" className="text-xs cursor-pointer">
                                CNPJ
                              </Label>
                            </div>
                          </RadioGroup>
                        </div>
                      </div>
                      <Input
                        id="documento"
                        placeholder={tipoDocumento === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"}
                        value={documento}
                        onChange={(e) => setDocumento(formatarDocumento(e.target.value))}
                        maxLength={tipoDocumento === "cpf" ? 14 : 18}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="telefone">Telefone *</Label>
                      <Input
                        id="telefone"
                        placeholder="(00) 00000-0000"
                        value={telefone}
                        onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                        maxLength={15}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endereco">Endereço</Label>
                    <Input
                      id="endereco"
                      placeholder="Rua, número, complemento"
                      value={endereco}
                      onChange={(e) => setEndereco(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2 col-span-2 md:col-span-2">
                      <Label htmlFor="cidade">Cidade</Label>
                      <Input
                        id="cidade"
                        placeholder="Sua cidade"
                        value={cidade}
                        onChange={(e) => setCidade(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estado">Estado</Label>
                      <Input
                        id="estado"
                        placeholder="UF"
                        value={estado}
                        onChange={(e) => setEstado(e.target.value)}
                        maxLength={2}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cep">CEP</Label>
                      <Input
                        id="cep"
                        placeholder="00000-000"
                        value={cep}
                        onChange={(e) => setCep(formatarCEP(e.target.value))}
                        maxLength={9}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Forma de pagamento - Modificado para cartão de crédito e débito */}
                <div className="space-y-3">
                  <Label>Forma de Pagamento</Label>
                  <RadioGroup
                    value={formaPagamento}
                    onValueChange={setFormaPagamento}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div
                      className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer transition-colors ${formaPagamento === "credito" ? "border-primary bg-primary/5" : "border-input"}`}
                    >
                      <RadioGroupItem value="credito" id="credito" />
                      <Label htmlFor="credito" className="flex items-center cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    <div
                      className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer transition-colors ${formaPagamento === "debito" ? "border-primary bg-primary/5" : "border-input"}`}
                    >
                      <RadioGroupItem value="debito" id="debito" />
                      <Label htmlFor="debito" className="flex items-center cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Cartão de Débito
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Benefícios */}
                <div className="pt-4 space-y-3">
                  <h3 className="text-sm font-medium">Benefícios inclusos:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">
                        Acesso a todos os recursos do plano {nomesPlanos[planoId as keyof typeof nomesPlanos]}
                      </span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Suporte técnico prioritário</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle2 className="mr-2 h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-sm">Atualizações gratuitas durante o período da assinatura</span>
                    </li>
                    {periodo === "anual" && (
                      <li className="flex items-start">
                        <BadgeCheck className="mr-2 h-4 w-4 text-blue-500 mt-0.5" />
                        <span className="text-sm font-medium">
                          Economia de {economiaAnual.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}{" "}
                          com o plano anual
                        </span>
                      </li>
                    )}
                  </ul>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4">
                <Button onClick={processarPagamento} disabled={isLoading || planoId === "gratis"} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processando...
                    </>
                  ) : planoId === "gratis" ? (
                    "Ativar Plano Grátis"
                  ) : (
                    <>
                      Finalizar Pagamento
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Ao finalizar, você concorda com os nossos{" "}
                  <Link href="#" className="underline">
                    Termos de Serviço
                  </Link>{" "}
                  e{" "}
                  <Link href="#" className="underline">
                    Política de Privacidade
                  </Link>
                  .
                </p>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>

      {/* WhatsApp Button */}
      <WhatsAppButton />
    </div>
  )
}
