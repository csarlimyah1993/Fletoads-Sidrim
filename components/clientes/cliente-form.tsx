"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2, Check, ChevronsUpDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"

// Definir o esquema de validação com Zod
const clienteFormSchema = z.object({
  // Informações básicas
  nome: z.string().min(3, { message: "Nome deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  documento: z.string().optional().or(z.literal("")),
  dataNascimento: z.date().optional(),
  genero: z.string().optional().or(z.literal("")),

  // Informações de compras/fidelidade
  dataCadastro: z.date().default(() => new Date()),
  totalGasto: z.number().min(0).default(0),
  numeroPedidos: z.number().min(0).default(0),
  ultimaCompra: z
    .object({
      data: z.date().optional(),
      valor: z.number().min(0).default(0),
    })
    .optional(),
  produtosComprados: z.array(z.string()).default([]),
  frequenciaCompra: z.string().optional().or(z.literal("")),
  vip: z.boolean().default(false),
  categoriasPreferidasString: z.string().optional().or(z.literal("")),

  // Endereço
  cep: z.string().optional().or(z.literal("")),
  endereco: z.string().optional().or(z.literal("")),
  cidade: z.string().optional().or(z.literal("")),
  estado: z.string().optional().or(z.literal("")),

  // Comportamento digital
  canalEntrada: z.string().optional().or(z.literal("")),
  preferenciaContato: z.string().optional().or(z.literal("")),
  interacoes: z.string().optional().or(z.literal("")),
  feedbacks: z.string().optional().or(z.literal("")),

  // Campos adicionais
  observacoes: z.string().optional().or(z.literal("")),
  status: z.enum(["ativo", "inativo", "prospecto"]).default("prospecto"),
})

type ClienteFormValues = z.infer<typeof clienteFormSchema>

// Interface para produtos
interface Produto {
  _id: string
  nome: string
  preco: number
  descricaoCurta?: string
}

export function ClienteForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false)
  const router = useRouter()

  // Buscar produtos da loja
  useEffect(() => {
    const fetchProdutos = async () => {
      setIsLoadingProdutos(true)
      try {
        const response = await fetch("/api/produtos?limit=100")
        if (response.ok) {
          const data = await response.json()
          setProdutos(data.produtos || [])
        } else {
          console.error("Erro ao buscar produtos")
        }
      } catch (error) {
        console.error("Erro ao buscar produtos:", error)
      } finally {
        setIsLoadingProdutos(false)
      }
    }

    fetchProdutos()
  }, [])

  // Função para formatar número de telefone
  const formatPhoneNumber = (value: string) => {
    if (!value) return value

    // Remover todos os caracteres não numéricos
    const phoneNumber = value.replace(/\D/g, "")

    // Aplicar a máscara
    if (phoneNumber.length <= 2) {
      return `+${phoneNumber}`
    } else if (phoneNumber.length <= 4) {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2)}`
    } else if (phoneNumber.length <= 6) {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 4)}) ${phoneNumber.slice(4)}`
    } else if (phoneNumber.length <= 11) {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 4)}) ${phoneNumber.slice(4, 9)}-${phoneNumber.slice(9)}`
    } else {
      return `+${phoneNumber.slice(0, 2)} (${phoneNumber.slice(2, 4)}) ${phoneNumber.slice(4, 9)}-${phoneNumber.slice(9, 13)}`
    }
  }

  // Definir valores padrão do formulário
  const defaultValues: Partial<ClienteFormValues> = {
    nome: "",
    email: "",
    telefone: "",
    documento: "",
    dataNascimento: undefined,
    genero: "",
    dataCadastro: new Date(),
    totalGasto: 0,
    numeroPedidos: 0,
    ultimaCompra: {
      data: undefined,
      valor: 0,
    },
    produtosComprados: [],
    frequenciaCompra: "",
    vip: false,
    categoriasPreferidasString: "",
    cep: "",
    endereco: "",
    cidade: "",
    estado: "",
    canalEntrada: "",
    preferenciaContato: "",
    interacoes: "",
    feedbacks: "",
    observacoes: "",
    status: "prospecto",
  }

  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteFormSchema),
    defaultValues,
  })

  async function onSubmit(data: ClienteFormValues) {
    setIsSubmitting(true)

    try {
      // Transformar os dados antes de enviar
      const categoriasPreferidasArray = data.categoriasPreferidasString
        ? data.categoriasPreferidasString.split(",").map((item) => item.trim())
        : []

      const clienteData = {
        ...data,
        categoriasPreferidasArray,
      }

      // Enviar dados para a API
      const response = await fetch("/api/clientes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(clienteData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar cliente")
      }

      toast({
        title: "Cliente cadastrado com sucesso!",
        description: "Os dados do cliente foram salvos.",
      })

      // Redirecionar para a lista de clientes
      router.push("/dashboard/clientes")
      router.refresh()
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error)
      toast({
        title: "Erro ao cadastrar cliente",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os dados do cliente",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
            <TabsTrigger value="compras">Compras e Fidelidade</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="comportamento">Comportamento Digital</TabsTrigger>
          </TabsList>

          {/* Aba de Informações Básicas */}
          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cliente</CardTitle>
                <CardDescription>
                  Cadastre as informações básicas do cliente para identificação e contato.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome completo*</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do cliente" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormDescription>Para contato e envio de promoções</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone / WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="+55 (00) 00000-0000"
                            value={field.value}
                            onChange={(e) => {
                              const formattedValue = formatPhoneNumber(e.target.value)
                              field.onChange(formattedValue)
                            }}
                          />
                        </FormControl>
                        <FormDescription>Para contato direto e marketing</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="documento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF ou CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="000.000.000-00" {...field} />
                        </FormControl>
                        <FormDescription>Para emissão de nota fiscal ou programa de fidelidade</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataNascimento"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de nascimento</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-4 flex flex-col space-y-2" align="start">
                            <div className="flex space-x-2">
                              <Select
                                onValueChange={(year) => {
                                  const currentDate = field.value || new Date()
                                  const newDate = new Date(currentDate)
                                  newDate.setFullYear(Number.parseInt(year))
                                  field.onChange(newDate)
                                }}
                                value={
                                  field.value
                                    ? field.value.getFullYear().toString()
                                    : new Date().getFullYear().toString()
                                }
                              >
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue placeholder="Ano" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 100 }, (_, i) => (
                                    <SelectItem key={i} value={(new Date().getFullYear() - i).toString()}>
                                      {new Date().getFullYear() - i}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              <Select
                                onValueChange={(month) => {
                                  const currentDate = field.value || new Date()
                                  const newDate = new Date(currentDate)
                                  newDate.setMonth(Number.parseInt(month))
                                  field.onChange(newDate)
                                }}
                                value={
                                  field.value ? field.value.getMonth().toString() : new Date().getMonth().toString()
                                }
                              >
                                <SelectTrigger className="w-[110px]">
                                  <SelectValue placeholder="Mês" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Array.from({ length: 12 }, (_, i) => (
                                    <SelectItem key={i} value={i.toString()}>
                                      {format(new Date(2000, i, 1), "MMMM", { locale: ptBR })}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                              month={field.value || undefined}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Para ações em aniversários</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="genero"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gênero / Pronome</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="masculino">Masculino</SelectItem>
                          <SelectItem value="feminino">Feminino</SelectItem>
                          <SelectItem value="nao-binario">Não-binário</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                          <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Para comunicação personalizada</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Compras e Fidelidade */}
          <TabsContent value="compras">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Compras e Fidelidade</CardTitle>
                <CardDescription>
                  Registre o histórico de compras e informações de fidelidade do cliente.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="dataCadastro"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data do primeiro contato / cadastro</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd/MM/yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="totalGasto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total gasto (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormDescription>Soma de todas as compras</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="numeroPedidos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de pedidos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="0"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseInt(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="ultimaCompra.data"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data da última compra</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy", { locale: ptBR })
                                ) : (
                                  <span>Selecione uma data</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="ultimaCompra.valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor da última compra (R$)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            placeholder="0.00"
                            {...field}
                            onChange={(e) => field.onChange(Number.parseFloat(e.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="produtosComprados"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Produtos comprados</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              className={cn("w-full justify-between", !field.value.length && "text-muted-foreground")}
                            >
                              {field.value.length > 0
                                ? `${field.value.length} produto(s) selecionado(s)`
                                : "Selecione os produtos"}
                              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Buscar produto..." />
                            <CommandList>
                              <CommandEmpty>
                                {isLoadingProdutos ? "Carregando..." : "Nenhum produto encontrado."}
                              </CommandEmpty>
                              <CommandGroup className="max-h-64 overflow-auto">
                                {produtos.map((produto) => (
                                  <CommandItem
                                    key={produto._id}
                                    value={produto._id}
                                    onSelect={() => {
                                      const currentValue = [...field.value]
                                      const index = currentValue.indexOf(produto._id)

                                      if (index === -1) {
                                        field.onChange([...currentValue, produto._id])
                                      } else {
                                        currentValue.splice(index, 1)
                                        field.onChange(currentValue)
                                      }
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        field.value.includes(produto._id) ? "opacity-100" : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{produto.nome}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {produto.preco.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((produtoId) => {
                            const produto = produtos.find((p) => p._id === produtoId)
                            return produto ? (
                              <Badge key={produtoId} variant="secondary" className="flex items-center gap-1">
                                {produto.nome}
                                <button
                                  type="button"
                                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    const currentValue = [...field.value]
                                    const index = currentValue.indexOf(produtoId)
                                    if (index !== -1) {
                                      currentValue.splice(index, 1)
                                      field.onChange(currentValue)
                                    }
                                  }}
                                >
                                  <span className="sr-only">Remover</span>
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  >
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </Badge>
                            ) : null
                          })}
                        </div>
                      )}
                      <FormDescription>Selecione os produtos que o cliente comprou</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="frequenciaCompra"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequência de compra</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione uma opção" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="semanal">Semanal</SelectItem>
                            <SelectItem value="quinzenal">Quinzenal</SelectItem>
                            <SelectItem value="mensal">Mensal</SelectItem>
                            <SelectItem value="trimestral">Trimestral</SelectItem>
                            <SelectItem value="semestral">Semestral</SelectItem>
                            <SelectItem value="anual">Anual</SelectItem>
                            <SelectItem value="eventual">Eventual</SelectItem>
                            <SelectItem value="primeira-compra">Primeira compra</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vip"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Cliente VIP</FormLabel>
                          <FormDescription>Marque esta opção para clientes especiais</FormDescription>
                        </div>
                        <FormControl>
                          <Switch checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="categoriasPreferidasString"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tags ou categorias preferidas</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: moda, eletrônicos, alimentos (separados por vírgula)" {...field} />
                      </FormControl>
                      <FormDescription>
                        Categorias de produtos que o cliente mais compra ou se interessa
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Endereço */}
          <TabsContent value="endereco">
            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Cadastre o endereço do cliente para entregas e campanhas locais.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="cep"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CEP</FormLabel>
                      <FormControl>
                        <Input placeholder="00000-000" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endereco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Rua, número, complemento, bairro" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="cidade"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                            <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Comportamento Digital */}
          <TabsContent value="comportamento">
            <Card>
              <CardHeader>
                <CardTitle>Comportamento Digital</CardTitle>
                <CardDescription>Registre informações sobre o comportamento digital do cliente.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="canalEntrada"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Canal de entrada</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="facebook">Facebook</SelectItem>
                          <SelectItem value="site">Site</SelectItem>
                          <SelectItem value="panfleto">Panfleto</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="indicacao">Indicação</SelectItem>
                          <SelectItem value="google">Google</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Como o cliente conheceu sua loja</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="preferenciaContato"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preferência de contato</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma opção" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="email">E-mail</SelectItem>
                          <SelectItem value="ligacao">Ligação</SelectItem>
                          <SelectItem value="sms">SMS</SelectItem>
                          <SelectItem value="instagram">Instagram</SelectItem>
                          <SelectItem value="nenhum">Prefere não ser contatado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Meio de contato preferido pelo cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="interacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interações com panfletos e promoções</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Abriu panfleto de Natal 2023, Clicou em promoção de Dia das Mães..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Registre como o cliente interage com suas campanhas</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="feedbacks"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Feedbacks recebidos</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Elogiou o atendimento em 12/05/2023, Reclamou de atraso na entrega em 20/06/2023..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Notas, comentários e avaliações do cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="observacoes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações adicionais</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais relevantes sobre o cliente..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Outras informações importantes sobre o cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status do Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="prospecto">Prospecto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Status atual do cliente</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/clientes")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Cliente"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
