"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

// Schema de validação do formulário
const formSchema = z.object({
  nome: z.string().min(3, "Nome deve ter pelo menos 3 caracteres"),
  email: z.string().email("Email inválido"),
  cpf: z.string().min(11, "CPF inválido").max(14, "CPF inválido"),
  telefone: z.string().min(10, "Telefone inválido"),
  plano: z.string(),
  metodoPagamento: z.enum(["cartao_credito", "boleto", "pix"]),
  numeroCartao: z.string().optional(),
  validadeCartao: z.string().optional(),
  cvvCartao: z.string().optional(),
  nomeCartao: z.string().optional(),
})

// Preços dos planos
const precoPlanos = {
  gratuito: "R$ 0",
  basico: "R$ 49,90/mês",
  profissional: "R$ 99,90/mês",
  empresarial: "R$ 199,90/mês",
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [planoId, setPlanoId] = useState<string>("")
  const [metodoPagamento, setMetodoPagamento] = useState<string>("cartao_credito")

  // Inicializar o formulário
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: "",
      email: "",
      cpf: "",
      telefone: "",
      plano: "",
      metodoPagamento: "cartao_credito",
      numeroCartao: "",
      validadeCartao: "",
      cvvCartao: "",
      nomeCartao: "",
    },
  })

  // Obter o plano da URL
  useEffect(() => {
    const plano = searchParams.get("plano")
    if (plano) {
      setPlanoId(plano)
      form.setValue("plano", plano)
    } else {
      router.push("/planos")
    }
  }, [searchParams, form, router])

  // Atualizar o método de pagamento quando ele mudar no formulário
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "metodoPagamento") {
        setMetodoPagamento(value.metodoPagamento || "cartao_credito")
      }
    })
    return () => subscription.unsubscribe()
  }, [form])

  // Função para formatar o CPF
  const formatCPF = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})/, "$1-$2")
      .replace(/(-\d{2})\d+?$/, "$1")
  }

  // Função para formatar o telefone
  const formatTelefone = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .replace(/(-\d{4})\d+?$/, "$1")
  }

  // Função para formatar o número do cartão
  const formatNumeroCartao = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})(\d)/, "$1 $2")
      .replace(/(\d{4})\d+?$/, "$1")
  }

  // Função para formatar a validade do cartão
  const formatValidadeCartao = (value: string) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1/$2")
      .replace(/(\d{2}\/\d{2})\d+?$/, "$1")
  }

  // Função para enviar o formulário
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true)

    try {
      // Enviar dados para a API
      const response = await fetch("/api/planos/assinar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Erro ao processar pagamento")
      }

      const data = await response.json()

      // Redirecionar para a página de contrato
      router.push(`/planos/contrato?id=${data.assinaturaId}`)
    } catch (error) {
      console.error("Erro ao processar pagamento:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao processar o pagamento. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Checkout</h1>
          <p className="text-muted-foreground mt-2">Complete suas informações para assinar o plano</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Pagamento</CardTitle>
                <CardDescription>Preencha os dados abaixo para concluir sua assinatura</CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="nome"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome Completo</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu nome completo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite seu email" type="email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="cpf"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>CPF</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="000.000.000-00"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatCPF(e.target.value))
                                  }}
                                  maxLength={14}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="telefone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Telefone</FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="(00) 00000-0000"
                                  {...field}
                                  onChange={(e) => {
                                    field.onChange(formatTelefone(e.target.value))
                                  }}
                                  maxLength={15}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="metodoPagamento"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Método de Pagamento</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o método de pagamento" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                                <SelectItem value="boleto">Boleto Bancário</SelectItem>
                                <SelectItem value="pix">PIX</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {metodoPagamento === "cartao_credito" && (
                        <>
                          <FormField
                            control={form.control}
                            name="numeroCartao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Número do Cartão</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="0000 0000 0000 0000"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(formatNumeroCartao(e.target.value))
                                    }}
                                    maxLength={19}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />

                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="validadeCartao"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Validade</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="MM/AA"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(formatValidadeCartao(e.target.value))
                                      }}
                                      maxLength={5}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={form.control}
                              name="cvvCartao"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>CVV</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="123"
                                      {...field}
                                      maxLength={3}
                                      onChange={(e) => {
                                        field.onChange(e.target.value.replace(/\D/g, ""))
                                      }}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>

                          <FormField
                            control={form.control}
                            name="nomeCartao"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nome no Cartão</FormLabel>
                                <FormControl>
                                  <Input placeholder="Nome como está no cartão" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </>
                      )}

                      {metodoPagamento === "boleto" && (
                        <FormDescription>
                          Após confirmar, você receberá o boleto por email. O plano será ativado após a confirmação do
                          pagamento.
                        </FormDescription>
                      )}

                      {metodoPagamento === "pix" && (
                        <FormDescription>
                          Após confirmar, você receberá um QR Code PIX para pagamento. O plano será ativado
                          imediatamente após a confirmação do pagamento.
                        </FormDescription>
                      )}
                    </div>

                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processando...
                        </>
                      ) : (
                        "Continuar para Contrato"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm font-medium">Plano Selecionado</div>
                    <div className="font-bold capitalize">{planoId}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">Valor</div>
                    <div className="font-bold">{precoPlanos[planoId as keyof typeof precoPlanos] || "-"}</div>
                  </div>
                  <Separator />
                  <div>
                    <div className="text-sm font-medium">Período</div>
                    <div>Mensal (renovação automática)</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex flex-col">
                <div className="text-sm text-muted-foreground">
                  Ao continuar, você concorda com os Termos de Serviço e Política de Privacidade.
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

