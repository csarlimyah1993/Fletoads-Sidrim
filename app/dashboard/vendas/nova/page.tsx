"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

// Esquema de validação para o formulário
const vendaSchema = z.object({
  cliente: z.string({
    required_error: "Cliente é obrigatório",
  }),
  produtos: z
    .array(
      z.object({
        nome: z.string().min(1, "Nome do produto é obrigatório"),
        quantidade: z.coerce.number().min(1, "Quantidade deve ser pelo menos 1"),
        precoUnitario: z.coerce.number().min(0.01, "Preço deve ser maior que zero"),
      }),
    )
    .min(1, "Adicione pelo menos um produto"),
  metodoPagamento: z.enum(["dinheiro", "cartao_credito", "cartao_debito", "pix", "boleto", "transferencia"], {
    required_error: "Método de pagamento é obrigatório",
  }),
  status: z.enum(["pendente", "pago", "enviado", "entregue", "cancelado"], {
    required_error: "Status é obrigatório",
  }),
  observacoes: z.string().optional(),
})

type VendaFormValues = z.infer<typeof vendaSchema>

export default function NovaVendaPage() {
  const router = useRouter()
  const [clientes, setClientes] = useState<any[]>([])
  const [isLoadingClientes, setIsLoadingClientes] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Inicializar o formulário
  const form = useForm<VendaFormValues>({
    resolver: zodResolver(vendaSchema),
    defaultValues: {
      produtos: [{ nome: "", quantidade: 1, precoUnitario: 0 }],
      status: "pendente",
      metodoPagamento: "dinheiro",
      observacoes: "",
    },
  })

  // Buscar clientes
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        setIsLoadingClientes(true)
        const response = await fetch("/api/clientes")

        if (!response.ok) {
          throw new Error("Erro ao buscar clientes")
        }

        const data = await response.json()
        setClientes(data.clientes || [])
      } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        toast.error("Erro ao carregar clientes")
      } finally {
        setIsLoadingClientes(false)
      }
    }

    fetchClientes()
  }, [])

  // Função para adicionar um novo produto
  const adicionarProduto = () => {
    const produtos = form.getValues("produtos")
    form.setValue("produtos", [...produtos, { nome: "", quantidade: 1, precoUnitario: 0 }])
  }

  // Função para remover um produto
  const removerProduto = (index: number) => {
    const produtos = form.getValues("produtos")
    if (produtos.length > 1) {
      form.setValue(
        "produtos",
        produtos.filter((_, i) => i !== index),
      )
    }
  }

  // Função para calcular o subtotal de um produto
  const calcularSubtotal = (quantidade: number, precoUnitario: number) => {
    return quantidade * precoUnitario
  }

  // Função para calcular o total da venda
  const calcularTotal = () => {
    const produtos = form.getValues("produtos")
    return produtos.reduce((total, produto) => {
      return total + calcularSubtotal(produto.quantidade || 0, produto.precoUnitario || 0)
    }, 0)
  }

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Função para enviar o formulário
  const onSubmit = async (values: VendaFormValues) => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar venda")
      }

      const data = await response.json()
      toast.success("Venda criada com sucesso!")
      router.push(`/dashboard/vendas/${data._id}`)
    } catch (error) {
      console.error("Erro ao criar venda:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar venda")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="flex-1 p-4 md:p-8 pt-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Voltar
        </Button>
        <h2 className="text-2xl font-bold">Nova Venda</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Adicione os produtos da venda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {form.getValues("produtos").map((_, index) => (
                    <div key={index} className="space-y-4 p-4 border rounded-md">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Produto {index + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removerProduto(index)}
                          disabled={form.getValues("produtos").length <= 1}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name={`produtos.${index}.nome`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nome do Produto</FormLabel>
                              <FormControl>
                                <Input placeholder="Nome do produto" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name={`produtos.${index}.quantidade`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Quantidade</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="1"
                                    step="1"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      form.trigger("produtos")
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name={`produtos.${index}.precoUnitario`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Preço Unitário</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    min="0.01"
                                    step="0.01"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e)
                                      form.trigger("produtos")
                                    }}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <p className="font-medium">
                          Subtotal:{" "}
                          {formatarValor(
                            calcularSubtotal(
                              form.getValues(`produtos.${index}.quantidade`) || 0,
                              form.getValues(`produtos.${index}.precoUnitario`) || 0,
                            ),
                          )}
                        </p>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={adicionarProduto} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Produto
                  </Button>

                  <div className="flex justify-end">
                    <p className="text-lg font-bold">Total: {formatarValor(calcularTotal())}</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Cliente</CardTitle>
                  <CardDescription>Selecione o cliente da venda</CardDescription>
                </CardHeader>
                <CardContent>
                  <FormField
                    control={form.control}
                    name="cliente"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {isLoadingClientes ? (
                              <div className="flex justify-center items-center p-2">
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                <span>Carregando clientes...</span>
                              </div>
                            ) : clientes.length === 0 ? (
                              <div className="p-2 text-center">
                                <p className="text-sm text-gray-500">Nenhum cliente encontrado</p>
                                <Button
                                  variant="link"
                                  className="mt-1 p-0 h-auto"
                                  onClick={() => router.push("/dashboard/clientes/novo")}
                                >
                                  Adicionar Cliente
                                </Button>
                              </div>
                            ) : (
                              clientes.map((cliente) => (
                                <SelectItem key={cliente._id} value={cliente._id}>
                                  {cliente.nome} {cliente.empresa ? `(${cliente.empresa})` : ""}
                                </SelectItem>
                              ))
                            )}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pagamento e Status</CardTitle>
                  <CardDescription>Defina o método de pagamento e status da venda</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
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
                            <SelectItem value="dinheiro">Dinheiro</SelectItem>
                            <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                            <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                            <SelectItem value="pix">PIX</SelectItem>
                            <SelectItem value="boleto">Boleto</SelectItem>
                            <SelectItem value="transferencia">Transferência</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="pendente">Pendente</SelectItem>
                            <SelectItem value="pago">Pago</SelectItem>
                            <SelectItem value="enviado">Enviado</SelectItem>
                            <SelectItem value="entregue">Entregue</SelectItem>
                            <SelectItem value="cancelado">Cancelado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="observacoes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Observações</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Observações sobre a venda"
                            className="resize-none"
                            rows={4}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>Informações adicionais sobre a venda (opcional)</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>Criar Venda</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

