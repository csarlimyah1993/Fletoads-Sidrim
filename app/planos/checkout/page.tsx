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
  Calendar,
  Lock,
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

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [planoId, setPlanoId] = useState<string>("")
  const [periodo, setPeriodo] = useState<string>("mensal")
  const [formaPagamento, setFormaPagamento] = useState<string>("cartao")
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

  // Modificar a função de processamento de pagamento para validar os novos campos
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

    // Validar campos do cartão se for a forma de pagamento selecionada
    if (formaPagamento === "cartao") {
      if (!numeroCartao || numeroCartao.replace(/\D/g, "").length < 16) {
        toast({
          title: "Erro",
          description: "Número de cartão inválido.",
          variant: "destructive",
        })
        return
      }

      if (!nomeCartao) {
        toast({
          title: "Erro",
          description: "Nome no cartão é obrigatório.",
          variant: "destructive",
        })
        return
      }

      if (!validadeCartao || validadeCartao.length < 5) {
        toast({
          title: "Erro",
          description: "Validade do cartão inválida.",
          variant: "destructive",
        })
        return
      }

      if (!cvvCartao || cvvCartao.length < 3) {
        toast({
          title: "Erro",
          description: "CVV inválido.",
          variant: "destructive",
        })
        return
      }
    }

    setIsLoading(true)

    try {
      // Simular o processamento do pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Aqui você faria a chamada para a API para processar o pagamento
      // const response = await fetch("/api/planos/assinar", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({
      //     planoId,
      //     periodo,
      //     formaPagamento,
      //     nome,
      //     email,
      //     documento,
      //     tipoDocumento,
      //     telefone,
      //     endereco,
      //     cidade,
      //     estado,
      //     cep,
      //     numeroCartao: formaPagamento === "cartao" ? numeroCartao : null,
      //     nomeCartao: formaPagamento === "cartao" ? nomeCartao : null,
      //     validadeCartao: formaPagamento === "cartao" ? validadeCartao : null
      //   }),
      // })
      // const data = await response.json()

      // Redirecionar para a página de contrato
      router.push(`/planos/contrato?id=123&plano=${planoId}&periodo=${periodo}`)
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      })
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
          {/* Resumo do pedido */}
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

                {/* Forma de pagamento */}
                <div className="space-y-3">
                  <Label>Forma de Pagamento</Label>
                  <RadioGroup
                    value={formaPagamento}
                    onValueChange={setFormaPagamento}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  >
                    <div
                      className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer transition-colors ${formaPagamento === "cartao" ? "border-primary bg-primary/5" : "border-input"}`}
                    >
                      <RadioGroupItem value="cartao" id="cartao" />
                      <Label htmlFor="cartao" className="flex items-center cursor-pointer">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Cartão de Crédito
                      </Label>
                    </div>
                    <div
                      className={`flex items-center space-x-2 border rounded-md p-4 cursor-pointer transition-colors ${formaPagamento === "pix" ? "border-primary bg-primary/5" : "border-input"}`}
                    >
                      <RadioGroupItem value="pix" id="pix" />
                      <Label htmlFor="pix" className="flex items-center cursor-pointer">
                        <svg
                          className="mr-2 h-4 w-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M16.8 3L20.4 6.6L6.59998 20.4L3 16.8L16.8 3Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16.8 20.4L20.4 16.8L16.8 13.2L13.2 16.8L16.8 20.4Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M6.59998 10.2L10.2 6.6L6.59998 3L3 6.6L6.59998 10.2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        PIX
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Campos do cartão de crédito */}
                {formaPagamento === "cartao" && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                      <Label htmlFor="numero-cartao">Número do Cartão</Label>
                      <div className="relative">
                        <Input
                          id="numero-cartao"
                          placeholder="0000 0000 0000 0000"
                          value={numeroCartao}
                          onChange={(e) => setNumeroCartao(formatarNumeroCartao(e.target.value))}
                          maxLength={19}
                          className="pl-10"
                        />
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nome-cartao">Nome no Cartão</Label>
                      <Input
                        id="nome-cartao"
                        placeholder="Como aparece no cartão"
                        value={nomeCartao}
                        onChange={(e) => setNomeCartao(e.target.value)}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="validade-cartao">Validade</Label>
                        <div className="relative">
                          <Input
                            id="validade-cartao"
                            placeholder="MM/AA"
                            value={validadeCartao}
                            onChange={(e) => setValidadeCartao(formatarValidadeCartao(e.target.value))}
                            maxLength={5}
                            className="pl-10"
                          />
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv-cartao">CVV</Label>
                        <div className="relative">
                          <Input
                            id="cvv-cartao"
                            placeholder="123"
                            value={cvvCartao}
                            onChange={(e) => setCvvCartao(e.target.value.replace(/\D/g, ""))}
                            maxLength={4}
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Informações do PIX */}
                {formaPagamento === "pix" && (
                  <div className="flex flex-col items-center justify-center py-6 space-y-4 border rounded-md bg-muted/50">
                    <div className="w-48 h-48 bg-white p-4 rounded-md flex items-center justify-center">
                      <svg
                        className="w-full h-full"
                        viewBox="0 0 100 100"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <rect width="100" height="100" fill="white" />
                        <path d="M30 30H40V40H30V30Z" fill="black" />
                        <path d="M50 30H60V40H50V30Z" fill="black" />
                        <path d="M70 30H80V40H70V30Z" fill="black" />
                        <path d="M20 40H30V50H20V40Z" fill="black" />
                        <path d="M40 40H50V50H40V40Z" fill="black" />
                        <path d="M60 40H70V50H60V40Z" fill="black" />
                        <path d="M80 40H90V50H80V40Z" fill="black" />
                        <path d="M10 50H20V60H10V50Z" fill="black" />
                        <path d="M30 50H40V60H30V50Z" fill="black" />
                        <path d="M50 50H60V60H50V50Z" fill="black" />
                        <path d="M70 50H80V60H70V50Z" fill="black" />
                        <path d="M90 50H100V60H90V50Z" fill="black" />
                        <path d="M20 60H30V70H20V60Z" fill="black" />
                        <path d="M40 60H50V70H40V60Z" fill="black" />
                        <path d="M60 60H70V70H60V60Z" fill="black" />
                        <path d="M80 60H90V70H80V60Z" fill="black" />
                        <path d="M30 70H40V80H30V70Z" fill="black" />
                        <path d="M50 70H60V80H50V70Z" fill="black" />
                        <path d="M70 70H80V80H70V70Z" fill="black" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-muted-foreground mb-2">
                        Escaneie o QR Code acima ou copie o código PIX abaixo
                      </p>
                      <div className="flex items-center justify-center space-x-2 bg-muted p-2 rounded-md">
                        <code className="text-xs font-mono">PIX12345678901234567890</code>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => {
                            navigator.clipboard.writeText("PIX12345678901234567890")
                            toast({
                              title: "Código copiado!",
                              description: "O código PIX foi copiado para a área de transferência.",
                            })
                          }}
                        >
                          <svg
                            width="15"
                            height="15"
                            viewBox="0 0 15 15"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M5 2V1H10V2H5ZM4.75 0C4.33579 0 4 0.335786 4 0.75V1H3.5C2.67157 1 2 1.67157 2 2.5V12.5C2 13.3284 2.67157 14 3.5 14H11.5C12.3284 14 13 13.3284 13 12.5V2.5C13 1.67157 12.3284 1 11.5 1H11V0.75C11 0.335786 10.6642 0 10.25 0H4.75ZM11 2V2.25C11 2.66421 10.6642 3 10.25 3H4.75C4.33579 3 4 2.66421 4 2.25V2H3.5C3.22386 2 3 2.22386 3 2.5V12.5C3 12.7761 3.22386 13 3.5 13H11.5C11.7761 13 12 12.7761 12 12.5V2.5C12 2.22386 11.7761 2 11.5 2H11Z"
                              fill="currentColor"
                              fillRule="evenodd"
                              clipRule="evenodd"
                            ></path>
                          </svg>
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-center max-w-md">
                      Após o pagamento, nosso sistema irá confirmar automaticamente e seu plano será ativado
                      imediatamente.
                    </p>
                  </div>
                )}

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

