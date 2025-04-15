"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Percent, DollarSign, Truck, Loader2 } from "lucide-react"

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
import { Check, ChevronsUpDown } from "lucide-react"

// Definir o esquema de validação com Zod
const cupomFormSchema = z.object({
  codigo: z.string().min(3, { message: "Código deve ter pelo menos 3 caracteres" }),
  tipo: z.enum(["percentual", "valor_fixo", "frete_gratis"]),
  valor: z.number().min(0).optional(),
  valorMinimo: z.number().min(0).optional(),
  dataInicio: z.date(),
  dataExpiracao: z.date(),
  limitePorUsuario: z.number().int().min(0).optional(),
  limiteUsos: z.number().int().min(0).optional(),
  ativo: z.boolean().default(true),
  descricao: z.string().optional(),
  categorias: z.array(z.string()).optional(),
  produtos: z.array(z.string()).optional(),
  clientesEspecificos: z.array(z.string()).optional(),
})

type CupomFormValues = z.infer<typeof cupomFormSchema>

interface CupomFormProps {
  cupom?: any
}

interface Produto {
  _id: string
  nome: string
  preco: number
}

interface Cliente {
  _id: string
  nome: string
  email?: string
}

interface Categoria {
  id: string
  nome: string
}

export function CupomForm({ cupom }: CupomFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [isLoadingProdutos, setIsLoadingProdutos] = useState(false)
  const [isLoadingClientes, setIsLoadingClientes] = useState(false)
  const router = useRouter()

  // Definir valores padrão do formulário
  const defaultValues: Partial<CupomFormValues> = {
    codigo: cupom?.codigo || "",
    tipo: cupom?.tipo || "percentual",
    valor: cupom?.valor || 0,
    valorMinimo: cupom?.valorMinimo || undefined,
    dataInicio: cupom?.dataInicio ? new Date(cupom.dataInicio) : new Date(),
    dataExpiracao: cupom?.dataExpiracao
      ? new Date(cupom.dataExpiracao)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 dias
    limitePorUsuario: cupom?.limitePorUsuario || undefined,
    limiteUsos: cupom?.limiteUsos || undefined,
    ativo: cupom?.ativo !== undefined ? cupom.ativo : true,
    descricao: cupom?.descricao || "",
    categorias: cupom?.categorias || [],
    produtos: cupom?.produtos || [],
    clientesEspecificos: cupom?.clientesEspecificos || [],
  }

  const form = useForm<CupomFormValues>({
    resolver: zodResolver(cupomFormSchema),
    defaultValues,
  })

  // Carregar produtos, clientes e categorias
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

    const fetchClientes = async () => {
      setIsLoadingClientes(true)
      try {
        const response = await fetch("/api/clientes?limit=100")
        if (response.ok) {
          const data = await response.json()
          setClientes(data.clientes || [])
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
      } finally {
        setIsLoadingClientes(false)
      }
    }

    const fetchCategorias = async () => {
      try {
        const response = await fetch("/api/categorias")
        if (response.ok) {
          const data = await response.json()
          setCategorias(data.categorias || [])
        }
      } catch (error) {
        console.error("Erro ao carregar categorias:", error)
        // Usar categorias padrão se não conseguir carregar
        setCategorias([
          { id: "roupas", nome: "Roupas" },
          { id: "calcados", nome: "Calçados" },
          { id: "acessorios", nome: "Acessórios" },
          { id: "eletronicos", nome: "Eletrônicos" },
          { id: "moveis", nome: "Móveis" },
        ])
      }
    }

    fetchProdutos()
    fetchClientes()
    fetchCategorias()
  }, [])

  // Observar mudanças no tipo de cupom
  const watchTipo = form.watch("tipo")

  async function onSubmit(data: CupomFormValues) {
    setIsSubmitting(true)

    try {
      // Validar valor para tipos específicos
      if (data.tipo !== "frete_gratis" && (data.valor === undefined || data.valor <= 0)) {
        throw new Error("Valor do cupom é obrigatório para este tipo de desconto")
      }

      // Validar datas
      if (data.dataExpiracao < data.dataInicio) {
        throw new Error("A data de expiração deve ser posterior à data de início")
      }

      // Preparar dados para enviar
      const cupomData = {
        ...data,
        // Garantir que valor seja 0 para frete grátis
        valor: data.tipo === "frete_gratis" ? 0 : data.valor,
      }

      // Determinar se é criação ou atualização
      const method = cupom?._id ? "PUT" : "POST"
      const url = cupom?._id ? `/api/cupons/${cupom._id}` : "/api/cupons"

      // Enviar dados para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(cupomData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar cupom")
      }

      toast({
        title: cupom?._id ? "Cupom atualizado com sucesso!" : "Cupom criado com sucesso!",
        description: "Os dados do cupom foram salvos.",
      })

      // Redirecionar para a lista de cupons
      router.push("/dashboard/cupons")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar cupom:", error)
      toast({
        title: "Erro ao salvar cupom",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar os dados do cupom",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="grid grid-cols-3 mb-8">
            <TabsTrigger value="geral">Informações Gerais</TabsTrigger>
            <TabsTrigger value="restricoes">Restrições</TabsTrigger>
            <TabsTrigger value="aplicabilidade">Aplicabilidade</TabsTrigger>
          </TabsList>

          {/* Aba de Informações Gerais */}
          <TabsContent value="geral">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Cupom</CardTitle>
                <CardDescription>Configure as informações básicas do cupom de desconto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="codigo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código do cupom*</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: VERAO2023" {...field} className="uppercase" />
                      </FormControl>
                      <FormDescription>Código que os clientes usarão para aplicar o desconto</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de desconto*</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo de desconto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="percentual">
                            <div className="flex items-center">
                              <Percent className="mr-2 h-4 w-4" />
                              <span>Percentual (%)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="valor_fixo">
                            <div className="flex items-center">
                              <DollarSign className="mr-2 h-4 w-4" />
                              <span>Valor Fixo (R$)</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="frete_gratis">
                            <div className="flex items-center">
                              <Truck className="mr-2 h-4 w-4" />
                              <span>Frete Grátis</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>Determina como o desconto será aplicado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {watchTipo !== "frete_gratis" && (
                  <FormField
                    control={form.control}
                    name="valor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Valor do desconto*</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step={watchTipo === "percentual" ? "1" : "0.01"}
                            min="0"
                            max={watchTipo === "percentual" ? "100" : undefined}
                            placeholder={watchTipo === "percentual" ? "10" : "50.00"}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          {watchTipo === "percentual"
                            ? "Porcentagem de desconto (0-100%)"
                            : "Valor fixo de desconto em reais (R$)"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="valorMinimo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor mínimo de compra</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          {...field}
                          value={field.value ?? 0}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>Valor mínimo de compra para o cupom ser válido (opcional)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="dataInicio"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de início*</FormLabel>
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
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Data a partir da qual o cupom estará válido</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataExpiracao"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Data de expiração*</FormLabel>
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
                            <Calendar mode="single" selected={field.value} onSelect={field.onChange} initialFocus />
                          </PopoverContent>
                        </Popover>
                        <FormDescription>Data até a qual o cupom será válido</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Ex: Cupom de desconto para o verão 2023"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Descrição interna do cupom (não será exibida para os clientes)</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Cupom ativo</FormLabel>
                        <FormDescription>Desative para suspender temporariamente o uso deste cupom</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Restrições */}
          <TabsContent value="restricoes">
            <Card>
              <CardHeader>
                <CardTitle>Restrições de Uso</CardTitle>
                <CardDescription>Configure limites e restrições para o uso do cupom.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="limiteUsos"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite total de usos</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ilimitado"
                            {...field}
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Número máximo de vezes que este cupom pode ser usado (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="limitePorUsuario"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limite por cliente</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="0"
                            placeholder="Ilimitado"
                            {...field}
                            value={field.value === undefined ? "" : field.value}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          />
                        </FormControl>
                        <FormDescription>
                          Número máximo de vezes que cada cliente pode usar este cupom (opcional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Aplicabilidade */}
          <TabsContent value="aplicabilidade">
            <Card>
              <CardHeader>
                <CardTitle>Aplicabilidade do Cupom</CardTitle>
                <CardDescription>
                  Configure para quais produtos, categorias ou clientes este cupom é válido.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="categorias"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categorias aplicáveis</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !(field.value && field.value.length) && "text-muted-foreground",
                                )}
                              >
                                {(field.value && field.value.length) > 0
                                  ? `${field.value.length} categoria(s) selecionada(s)`
                                  : "Selecione as categorias"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar categoria..." />
                              <CommandList>
                                <CommandEmpty>Nenhuma categoria encontrada.</CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto">
                                  {categorias.map((categoria) => (
                                    <CommandItem
                                      key={categoria.id}
                                      value={categoria.id}
                                      onSelect={() => {
                                        const currentValue = field.value ? [...field.value] : []
                                        const index = currentValue.indexOf(categoria.id)

                                        if (index === -1) {
                                          field.onChange([...currentValue, categoria.id])
                                        } else {
                                          currentValue.splice(index, 1)
                                          field.onChange(currentValue)
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value?.includes(categoria.id) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      {categoria.nome}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((categoriaId) => {
                            const categoria = categorias.find((c) => c.id === categoriaId)
                            return categoria ? (
                              <Badge key={categoriaId} variant="secondary" className="flex items-center gap-1">
                                {categoria.nome}
                                <button
                                  type="button"
                                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    const currentValue = field.value ? [...field.value] : []
                                    const index = currentValue.indexOf(categoriaId)
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
                      <FormDescription>
                        Selecione as categorias para as quais este cupom é válido (opcional, se vazio, vale para todas)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="produtos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produtos aplicáveis</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !(field.value && field.value.length) && "text-muted-foreground",
                                )}
                              >
                                {(field.value && field.value.length) > 0
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
                                        const currentValue = field.value ? [...field.value] : []
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
                                          field.value?.includes(produto._id) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{produto.nome}</span>
                                        <span className="text-xs text-muted-foreground">
                                          {produto.preco.toLocaleString("pt-BR", {
                                            style: "currency",
                                            currency: "BRL",
                                          })}
                                        </span>
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {field.value && field.value.length > 0 && (
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
                                    const currentValue = field.value ? [...field.value] : []
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
                      <FormDescription>
                        Selecione os produtos para os quais este cupom é válido (opcional, se vazio, vale para todos)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientesEspecificos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Clientes específicos</FormLabel>
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant="outline"
                                role="combobox"
                                className={cn(
                                  "w-full justify-between",
                                  !(field.value && field.value.length) && "text-muted-foreground",
                                )}
                              >
                                {(field.value && field.value.length) > 0
                                  ? `${field.value.length} cliente(s) selecionado(s)`
                                  : "Selecione os clientes"}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0">
                            <Command>
                              <CommandInput placeholder="Buscar cliente..." />
                              <CommandList>
                                <CommandEmpty>
                                  {isLoadingClientes ? "Carregando..." : "Nenhum cliente encontrado."}
                                </CommandEmpty>
                                <CommandGroup className="max-h-64 overflow-auto">
                                  {clientes.map((cliente) => (
                                    <CommandItem
                                      key={cliente._id}
                                      value={cliente._id}
                                      onSelect={() => {
                                        const currentValue = field.value ? [...field.value] : []
                                        const index = currentValue.indexOf(cliente._id)

                                        if (index === -1) {
                                          field.onChange([...currentValue, cliente._id])
                                        } else {
                                          currentValue.splice(index, 1)
                                          field.onChange(currentValue)
                                        }
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          field.value?.includes(cliente._id) ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span>{cliente.nome}</span>
                                        {cliente.email && (
                                          <span className="text-xs text-muted-foreground">{cliente.email}</span>
                                        )}
                                      </div>
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {field.value.map((clienteId) => {
                            const cliente = clientes.find((c) => c._id === clienteId)
                            return cliente ? (
                              <Badge key={clienteId} variant="secondary" className="flex items-center gap-1">
                                {cliente.nome}
                                <button
                                  type="button"
                                  className="ml-1 rounded-full outline-none ring-offset-background focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                  onClick={() => {
                                    const currentValue = field.value ? [...field.value] : []
                                    const index = currentValue.indexOf(clienteId)
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
                      <FormDescription>
                        Selecione os clientes para os quais este cupom é válido (opcional, se vazio, vale para todos)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/cupons")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Cupom"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
