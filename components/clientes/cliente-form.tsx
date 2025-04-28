"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CalendarIcon } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format, parse, isValid } from "date-fns"
import { ptBR } from "date-fns/locale"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"

// Define o schema de validação
const clienteSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  telefone: z.string().optional().or(z.literal("")),
  documento: z.string().optional().or(z.literal("")),
  status: z.string().default("prospecto"),
  endereco: z
    .object({
      rua: z.string().optional().or(z.literal("")),
      numero: z.string().optional().or(z.literal("")),
      complemento: z.string().optional().or(z.literal("")),
      bairro: z.string().optional().or(z.literal("")),
      cidade: z.string().optional().or(z.literal("")),
      estado: z.string().optional().or(z.literal("")),
      cep: z.string().optional().or(z.literal("")),
    })
    .optional(),
  categoriasPreferidasString: z.string().optional().or(z.literal("")),
  observacoes: z.string().optional().or(z.literal("")),

  // Campos adicionais para preferências e gostos
  preferencias: z
    .object({
      cores: z.string().optional().or(z.literal("")),
      estilos: z.string().optional().or(z.literal("")),
      tamanhos: z.string().optional().or(z.literal("")),
      marcas: z.string().optional().or(z.literal("")),
    })
    .optional(),

  // Campos para marketing e funil
  marketing: z
    .object({
      canalAquisicao: z.string().optional().or(z.literal("")),
      campanhaOrigem: z.string().optional().or(z.literal("")),
      etapaFunil: z.string().optional().or(z.literal("")),
      pontuacao: z.number().min(0).max(100).optional(),
      permiteEmail: z.boolean().optional(),
      permiteSMS: z.boolean().optional(),
      permiteWhatsapp: z.boolean().optional(),
      permiteInstagram: z.boolean().optional(),
    })
    .optional(),

  // Dados demográficos
  demograficos: z
    .object({
      dataNascimento: z.date().optional().nullable(),
      dataNascimentoString: z.string().optional().or(z.literal("")),
      genero: z.string().optional().or(z.literal("")),
      estadoCivil: z.string().optional().or(z.literal("")),
      profissao: z.string().optional().or(z.literal("")),
      faixaRenda: z.string().optional().or(z.literal("")),
    })
    .optional(),

  // Dados de relacionamento
  relacionamento: z
    .object({
      ultimoContato: z.date().optional().nullable(),
      ultimoContatoString: z.string().optional().or(z.literal("")),
      proximoContato: z.date().optional().nullable(),
      proximoContatoString: z.string().optional().or(z.literal("")),
      frequenciaIdeal: z.string().optional().or(z.literal("")),
      responsavel: z.string().optional().or(z.literal("")),
      notas: z.string().optional().or(z.literal("")),
    })
    .optional(),

  // Dados personalizados
  camposPersonalizados: z.record(z.string()).optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

// Exportando a interface Cliente para ser usada em outros componentes
export interface Cliente {
  _id: string
  nome: string
  email?: string
  telefone?: string
  documento?: string
  status?: string
  endereco?: {
    rua?: string
    numero?: string
    complemento?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
  }
  categoriasPreferidasArray?: string[]
  observacoes?: string
  preferencias?: {
    cores?: string
    estilos?: string
    tamanhos?: string
    marcas?: string
  }
  marketing?: {
    canalAquisicao?: string
    campanhaOrigem?: string
    etapaFunil?: string
    pontuacao?: number
    permiteEmail?: boolean
    permiteSMS?: boolean
    permiteWhatsapp?: boolean
    permiteInstagram?: boolean
  }
  demograficos?: {
    dataNascimento?: Date | string
    genero?: string
    estadoCivil?: string
    profissao?: string
    faixaRenda?: string
  }
  relacionamento?: {
    ultimoContato?: Date | string
    proximoContato?: Date | string
    frequenciaIdeal?: string
    responsavel?: string
    notas?: string
  }
  camposPersonalizados?: Record<string, string>
}

export interface ClienteFormProps {
  cliente?: Cliente
}

export function ClienteForm({ cliente }: ClienteFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const router = useRouter()

  // Função para converter string de data para objeto Date
  const parseDate = (dateString?: string | Date | null): Date | undefined => {
    if (!dateString) return undefined
    if (dateString instanceof Date) return dateString
    try {
      return new Date(dateString)
    } catch (e) {
      console.error("Erro ao converter data:", e)
      return undefined
    }
  }

  // Função para formatar data para exibição
  const formatDate = (date: Date | undefined | null): string => {
    if (!date) return ""
    try {
      return format(date, "dd/MM/yyyy", { locale: ptBR })
    } catch (e) {
      console.error("Erro ao formatar data:", e)
      return ""
    }
  }

  // Função para converter string de data para Date
  const parseDateString = (dateString: string): Date | null => {
    if (!dateString) return null
    try {
      const parsedDate = parse(dateString, "dd/MM/yyyy", new Date())
      return isValid(parsedDate) ? parsedDate : null
    } catch (e) {
      console.error("Erro ao converter string para data:", e)
      return null
    }
  }

  // Função para sincronizar input de data com o estado do formulário
  const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "demograficos.dataNascimento" | "relacionamento.ultimoContato" | "relacionamento.proximoContato",
    stringField:
      | "demograficos.dataNascimentoString"
      | "relacionamento.ultimoContatoString"
      | "relacionamento.proximoContatoString",
  ) => {
    const dateString = e.target.value
    form.setValue(stringField, dateString)

    // Tenta converter a string para data apenas se tiver o formato correto
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const parsedDate = parseDateString(dateString)
      if (parsedDate) {
        form.setValue(field, parsedDate)
      }
    }
  }

  // Preparar valores iniciais
  const defaultValues: Partial<ClienteFormValues> = {
    nome: cliente?.nome || "",
    email: cliente?.email || "",
    telefone: cliente?.telefone || "",
    documento: cliente?.documento || "",
    status: cliente?.status || "prospecto",
    endereco: {
      rua: cliente?.endereco?.rua || "",
      numero: cliente?.endereco?.numero || "",
      complemento: cliente?.endereco?.complemento || "",
      bairro: cliente?.endereco?.bairro || "",
      cidade: cliente?.endereco?.cidade || "",
      estado: cliente?.endereco?.estado || "",
      cep: cliente?.endereco?.cep || "",
    },
    categoriasPreferidasString: cliente?.categoriasPreferidasArray?.join(", ") || "",
    observacoes: cliente?.observacoes || "",

    // Preferências e gostos
    preferencias: {
      cores: cliente?.preferencias?.cores || "",
      estilos: cliente?.preferencias?.estilos || "",
      tamanhos: cliente?.preferencias?.tamanhos || "",
      marcas: cliente?.preferencias?.marcas || "",
    },

    // Marketing e funil
    marketing: {
      canalAquisicao: cliente?.marketing?.canalAquisicao || "",
      campanhaOrigem: cliente?.marketing?.campanhaOrigem || "",
      etapaFunil: cliente?.marketing?.etapaFunil || "prospecto",
      pontuacao: cliente?.marketing?.pontuacao || 0,
      permiteEmail: cliente?.marketing?.permiteEmail || false,
      permiteSMS: cliente?.marketing?.permiteSMS || false,
      permiteWhatsapp: cliente?.marketing?.permiteWhatsapp || false,
      permiteInstagram: cliente?.marketing?.permiteInstagram || false,
    },

    // Dados demográficos
    demograficos: {
      dataNascimento: parseDate(cliente?.demograficos?.dataNascimento),
      dataNascimentoString: cliente?.demograficos?.dataNascimento
        ? formatDate(parseDate(cliente?.demograficos?.dataNascimento))
        : "",
      genero: cliente?.demograficos?.genero || "",
      estadoCivil: cliente?.demograficos?.estadoCivil || "",
      profissao: cliente?.demograficos?.profissao || "",
      faixaRenda: cliente?.demograficos?.faixaRenda || "",
    },

    // Dados de relacionamento
    relacionamento: {
      ultimoContato: parseDate(cliente?.relacionamento?.ultimoContato),
      ultimoContatoString: cliente?.relacionamento?.ultimoContato
        ? formatDate(parseDate(cliente?.relacionamento?.ultimoContato))
        : "",
      proximoContato: parseDate(cliente?.relacionamento?.proximoContato),
      proximoContatoString: cliente?.relacionamento?.proximoContato
        ? formatDate(parseDate(cliente?.relacionamento?.proximoContato))
        : "",
      frequenciaIdeal: cliente?.relacionamento?.frequenciaIdeal || "",
      responsavel: cliente?.relacionamento?.responsavel || "",
      notas: cliente?.relacionamento?.notas || "",
    },

    // Campos personalizados
    camposPersonalizados: cliente?.camposPersonalizados || {},
  }

  // Inicializar formulário
  const form = useForm<ClienteFormValues>({
    resolver: zodResolver(clienteSchema),
    defaultValues,
  })

  // Função para sincronizar input de data com o estado do formulário
  /*const handleDateInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: "demograficos.dataNascimento" | "relacionamento.ultimoContato" | "relacionamento.proximoContato",
    stringField:
      | "demograficos.dataNascimentoString"
      | "relacionamento.ultimoContatoString"
      | "relacionamento.proximoContatoString",
  ) => {
    const dateString = e.target.value
    form.setValue(stringField, dateString)

    const parsedDate = parseDateString(dateString)
    if (parsedDate) {
      form.setValue(field, parsedDate)
    }
  }*/

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: ClienteFormValues) => {
    setIsSubmitting(true)
    try {
      // Processar datas a partir das strings, se necessário
      if (data.demograficos?.dataNascimentoString && !data.demograficos.dataNascimento) {
        const parsedDate = parseDateString(data.demograficos.dataNascimentoString)
        if (parsedDate) {
          data.demograficos.dataNascimento = parsedDate
        }
      }

      if (data.relacionamento?.ultimoContatoString && !data.relacionamento.ultimoContato) {
        const parsedDate = parseDateString(data.relacionamento.ultimoContatoString)
        if (parsedDate) {
          data.relacionamento.ultimoContato = parsedDate
        }
      }

      if (data.relacionamento?.proximoContatoString && !data.relacionamento.proximoContato) {
        const parsedDate = parseDateString(data.relacionamento.proximoContatoString)
        if (parsedDate) {
          data.relacionamento.proximoContato = parsedDate
        }
      }

      // Remover campos de string de data antes de enviar
      if (data.demograficos) {
        delete data.demograficos.dataNascimentoString
      }

      if (data.relacionamento) {
        delete data.relacionamento.ultimoContatoString
        delete data.relacionamento.proximoContatoString
      }

      const url = cliente ? `/api/clientes/${cliente._id}` : "/api/clientes"
      const method = cliente ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar cliente")
      }

      // Redirecionar para a lista de clientes
      router.push("/dashboard/clientes")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      alert("Erro ao salvar cliente")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div className="grid gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 md:grid-cols-6 mb-4">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="preferencias">Preferências</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="demograficos">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="relacionamento">Relacionamento</TabsTrigger>
            <TabsTrigger value="personalizados">Personalizado</TabsTrigger>
          </TabsList>

          {/* Aba de Informações Básicas */}
          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nome">Nome*</Label>
                    <Input id="nome" placeholder="Nome do cliente" {...form.register("nome")} />
                    {form.formState.errors.nome && (
                      <p className="text-sm text-red-500">{form.formState.errors.nome.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" placeholder="Email do cliente" {...form.register("email")} />
                    {form.formState.errors.email && (
                      <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" placeholder="Telefone do cliente" {...form.register("telefone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="documento">Documento (CPF/CNPJ)</Label>
                    <Input id="documento" placeholder="Documento do cliente" {...form.register("documento")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      defaultValue={form.getValues("status")}
                      onValueChange={(value) => form.setValue("status", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="prospecto">Prospecto</SelectItem>
                        <SelectItem value="ativo">Ativo</SelectItem>
                        <SelectItem value="inativo">Inativo</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="oportunidade">Oportunidade</SelectItem>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="ex-cliente">Ex-Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="endereco.rua">Rua</Label>
                    <Input id="endereco.rua" placeholder="Rua" {...form.register("endereco.rua")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco.numero">Número</Label>
                    <Input id="endereco.numero" placeholder="Número" {...form.register("endereco.numero")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco.complemento">Complemento</Label>
                    <Input
                      id="endereco.complemento"
                      placeholder="Complemento"
                      {...form.register("endereco.complemento")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco.bairro">Bairro</Label>
                    <Input id="endereco.bairro" placeholder="Bairro" {...form.register("endereco.bairro")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco.cidade">Cidade</Label>
                    <Input id="endereco.cidade" placeholder="Cidade" {...form.register("endereco.cidade")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco.estado">Estado</Label>
                    <Input id="endereco.estado" placeholder="Estado" {...form.register("endereco.estado")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endereco.cep">CEP</Label>
                    <Input id="endereco.cep" placeholder="CEP" {...form.register("endereco.cep")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Preferências */}
          <TabsContent value="preferencias">
            <Card>
              <CardHeader>
                <CardTitle>Preferências e Gostos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoriasPreferidasString">Categorias Preferidas</Label>
                    <Input
                      id="categoriasPreferidasString"
                      placeholder="Categorias separadas por vírgula"
                      {...form.register("categoriasPreferidasString")}
                    />
                    <p className="text-sm text-muted-foreground">Exemplo: Eletrônicos, Roupas, Calçados</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferencias.cores">Cores Preferidas</Label>
                    <Input
                      id="preferencias.cores"
                      placeholder="Cores preferidas"
                      {...form.register("preferencias.cores")}
                    />
                    <p className="text-sm text-muted-foreground">Exemplo: Azul, Preto, Vermelho</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferencias.estilos">Estilos Preferidos</Label>
                    <Input
                      id="preferencias.estilos"
                      placeholder="Estilos preferidos"
                      {...form.register("preferencias.estilos")}
                    />
                    <p className="text-sm text-muted-foreground">Exemplo: Casual, Esportivo, Formal</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferencias.tamanhos">Tamanhos</Label>
                    <Input
                      id="preferencias.tamanhos"
                      placeholder="Tamanhos"
                      {...form.register("preferencias.tamanhos")}
                    />
                    <p className="text-sm text-muted-foreground">Exemplo: M, 42, G</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferencias.marcas">Marcas Preferidas</Label>
                    <Input
                      id="preferencias.marcas"
                      placeholder="Marcas preferidas"
                      {...form.register("preferencias.marcas")}
                    />
                    <p className="text-sm text-muted-foreground">Exemplo: Nike, Adidas, Zara</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="observacoes">Observações sobre Preferências</Label>
                  <Textarea
                    id="observacoes"
                    placeholder="Observações sobre as preferências do cliente"
                    {...form.register("observacoes")}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Marketing */}
          <TabsContent value="marketing">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Marketing e Funil</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="marketing.canalAquisicao">Canal de Aquisição</Label>
                    <Select
                      defaultValue={form.getValues("marketing.canalAquisicao") || ""}
                      onValueChange={(value) => form.setValue("marketing.canalAquisicao", value)}
                    >
                      <SelectTrigger id="marketing.canalAquisicao">
                        <SelectValue placeholder="Selecione o canal" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="site">Site</SelectItem>
                        <SelectItem value="redes-sociais">Redes Sociais</SelectItem>
                        <SelectItem value="indicacao">Indicação</SelectItem>
                        <SelectItem value="google">Google</SelectItem>
                        <SelectItem value="email">Email Marketing</SelectItem>
                        <SelectItem value="evento">Evento</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing.campanhaOrigem">Campanha de Origem</Label>
                    <Input
                      id="marketing.campanhaOrigem"
                      placeholder="Campanha que trouxe o cliente"
                      {...form.register("marketing.campanhaOrigem")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing.etapaFunil">Etapa no Funil</Label>
                    <Select
                      defaultValue={form.getValues("marketing.etapaFunil") || "prospecto"}
                      onValueChange={(value) => form.setValue("marketing.etapaFunil", value)}
                    >
                      <SelectTrigger id="marketing.etapaFunil">
                        <SelectValue placeholder="Selecione a etapa" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visitante">Visitante</SelectItem>
                        <SelectItem value="lead">Lead</SelectItem>
                        <SelectItem value="prospecto">Prospecto</SelectItem>
                        <SelectItem value="oportunidade">Oportunidade</SelectItem>
                        <SelectItem value="negociacao">Negociação</SelectItem>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="fidelizado">Fidelizado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marketing.pontuacao">Pontuação (Lead Score)</Label>
                    <div className="pt-6 pb-2">
                      <Slider
                        defaultValue={[form.getValues("marketing.pontuacao") || 0]}
                        max={100}
                        step={1}
                        onValueChange={(value) => form.setValue("marketing.pontuacao", value[0])}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>0</span>
                      <span>50</span>
                      <span>100</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 pt-4">
                  <Label>Permissões de Contato</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing.permiteEmail"
                        checked={form.watch("marketing.permiteEmail") || false}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteEmail", checked)}
                      />
                      <Label htmlFor="marketing.permiteEmail" className="cursor-pointer">
                        Permite Email Marketing
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing.permiteSMS"
                        checked={form.watch("marketing.permiteSMS") || false}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteSMS", checked)}
                      />
                      <Label htmlFor="marketing.permiteSMS" className="cursor-pointer">
                        Permite SMS
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing.permiteWhatsapp"
                        checked={form.watch("marketing.permiteWhatsapp") || false}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteWhatsapp", checked)}
                      />
                      <Label htmlFor="marketing.permiteWhatsapp" className="cursor-pointer">
                        Permite WhatsApp
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="marketing.permiteInstagram"
                        checked={form.watch("marketing.permiteInstagram") || false}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteInstagram", checked)}
                      />
                      <Label htmlFor="marketing.permiteInstagram" className="cursor-pointer">
                        Permite Instagram
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Dados Demográficos */}
          <TabsContent value="demograficos">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais e Demográficos</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="demograficos.dataNascimentoString">Data de Nascimento</Label>
                    <div className="flex flex-col space-y-2">
                      <Input
                        id="demograficos.dataNascimentoString"
                        placeholder="DD/MM/AAAA"
                        value={form.watch("demograficos.dataNascimentoString") || ""}
                        onChange={(e) =>
                          handleDateInputChange(e, "demograficos.dataNascimento", "demograficos.dataNascimentoString")
                        }
                      />
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.getValues("demograficos.dataNascimento") && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              <span>Selecionar no calendário</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={form.getValues("demograficos.dataNascimento") as Date | undefined}
                              onSelect={(date) => {
                                if (date) {
                                  form.setValue("demograficos.dataNascimento", date)
                                  form.setValue("demograficos.dataNascimentoString", formatDate(date))
                                }
                              }}
                              disabled={(date) => date > new Date()}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demograficos.genero">Gênero</Label>
                    <Select
                      defaultValue={form.getValues("demograficos.genero") || ""}
                      onValueChange={(value) => form.setValue("demograficos.genero", value)}
                    >
                      <SelectTrigger id="demograficos.genero">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="masculino">Masculino</SelectItem>
                        <SelectItem value="feminino">Feminino</SelectItem>
                        <SelectItem value="nao-binario">Não-binário</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                        <SelectItem value="prefiro-nao-informar">Prefiro não informar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demograficos.estadoCivil">Estado Civil</Label>
                    <Select
                      defaultValue={form.getValues("demograficos.estadoCivil") || ""}
                      onValueChange={(value) => form.setValue("demograficos.estadoCivil", value)}
                    >
                      <SelectTrigger id="demograficos.estadoCivil">
                        <SelectValue placeholder="Selecione o estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="solteiro">Solteiro(a)</SelectItem>
                        <SelectItem value="casado">Casado(a)</SelectItem>
                        <SelectItem value="divorciado">Divorciado(a)</SelectItem>
                        <SelectItem value="viuvo">Viúvo(a)</SelectItem>
                        <SelectItem value="uniao-estavel">União Estável</SelectItem>
                        <SelectItem value="outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demograficos.profissao">Profissão</Label>
                    <Input
                      id="demograficos.profissao"
                      placeholder="Profissão do cliente"
                      {...form.register("demograficos.profissao")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="demograficos.faixaRenda">Faixa de Renda</Label>
                    <Select
                      defaultValue={form.getValues("demograficos.faixaRenda") || ""}
                      onValueChange={(value) => form.setValue("demograficos.faixaRenda", value)}
                    >
                      <SelectTrigger id="demograficos.faixaRenda">
                        <SelectValue placeholder="Selecione a faixa de renda" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ate-2000">Até R$ 2.000</SelectItem>
                        <SelectItem value="2000-5000">R$ 2.000 a R$ 5.000</SelectItem>
                        <SelectItem value="5000-10000">R$ 5.000 a R$ 10.000</SelectItem>
                        <SelectItem value="10000-20000">R$ 10.000 a R$ 20.000</SelectItem>
                        <SelectItem value="acima-20000">Acima de R$ 20.000</SelectItem>
                        <SelectItem value="nao-informado">Não informado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Relacionamento */}
          <TabsContent value="relacionamento">
            <Card>
              <CardHeader>
                <CardTitle>Gestão de Relacionamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="relacionamento.ultimoContatoString">Último Contato</Label>
                    <div className="flex flex-col space-y-2">
                      <Input
                        id="relacionamento.ultimoContatoString"
                        placeholder="DD/MM/AAAA"
                        value={form.watch("relacionamento.ultimoContatoString") || ""}
                        onChange={(e) =>
                          handleDateInputChange(e, "relacionamento.ultimoContato", "relacionamento.ultimoContatoString")
                        }
                      />
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.getValues("relacionamento.ultimoContato") && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              <span>Selecionar no calendário</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={form.getValues("relacionamento.ultimoContato") as Date | undefined}
                              onSelect={(date) => {
                                if (date) {
                                  form.setValue("relacionamento.ultimoContato", date)
                                  form.setValue("relacionamento.ultimoContatoString", formatDate(date))
                                }
                              }}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relacionamento.proximoContatoString">Próximo Contato</Label>
                    <div className="flex flex-col space-y-2">
                      <Input
                        id="relacionamento.proximoContatoString"
                        placeholder="DD/MM/AAAA"
                        value={form.watch("relacionamento.proximoContatoString") || ""}
                        onChange={(e) =>
                          handleDateInputChange(
                            e,
                            "relacionamento.proximoContato",
                            "relacionamento.proximoContatoString",
                          )
                        }
                      />
                      <div className="relative">
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              type="button"
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !form.getValues("relacionamento.proximoContato") && "text-muted-foreground",
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              <span>Selecionar no calendário</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={form.getValues("relacionamento.proximoContato") as Date | undefined}
                              onSelect={(date) => {
                                if (date) {
                                  form.setValue("relacionamento.proximoContato", date)
                                  form.setValue("relacionamento.proximoContatoString", formatDate(date))
                                }
                              }}
                              initialFocus
                              locale={ptBR}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relacionamento.frequenciaIdeal">Frequência Ideal de Contato</Label>
                    <Select
                      defaultValue={form.getValues("relacionamento.frequenciaIdeal") || ""}
                      onValueChange={(value) => form.setValue("relacionamento.frequenciaIdeal", value)}
                    >
                      <SelectTrigger id="relacionamento.frequenciaIdeal">
                        <SelectValue placeholder="Selecione a frequência" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semanal">Semanal</SelectItem>
                        <SelectItem value="quinzenal">Quinzenal</SelectItem>
                        <SelectItem value="mensal">Mensal</SelectItem>
                        <SelectItem value="trimestral">Trimestral</SelectItem>
                        <SelectItem value="semestral">Semestral</SelectItem>
                        <SelectItem value="anual">Anual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="relacionamento.responsavel">Responsável pelo Cliente</Label>
                    <Input
                      id="relacionamento.responsavel"
                      placeholder="Nome do responsável"
                      {...form.register("relacionamento.responsavel")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="relacionamento.notas">Notas de Relacionamento</Label>
                  <Textarea
                    id="relacionamento.notas"
                    placeholder="Notas sobre o relacionamento com o cliente"
                    {...form.register("relacionamento.notas")}
                    className="min-h-[100px]"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba de Campos Personalizados */}
          <TabsContent value="personalizados">
            <Card>
              <CardHeader>
                <CardTitle>Campos Personalizados</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Adicione campos personalizados para armazenar informações específicas do seu negócio.
                  </p>

                  {/* Campo personalizado 1 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campo1_nome">Nome do Campo 1</Label>
                      <Input
                        id="campo1_nome"
                        placeholder="Ex: Tamanho de Calçado"
                        defaultValue="Tamanho de Calçado"
                        onChange={(e) => {
                          const value = form.getValues("camposPersonalizados.campo1_valor") || ""
                          const campos = form.getValues("camposPersonalizados") || {}
                          delete campos.campo1_valor
                          form.setValue("camposPersonalizados", {
                            ...campos,
                            [e.target.value]: value,
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campo1_valor">Valor do Campo 1</Label>
                      <Input
                        id="campo1_valor"
                        placeholder="Ex: 42"
                        {...form.register("camposPersonalizados.campo1_valor")}
                      />
                    </div>
                  </div>

                  {/* Campo personalizado 2 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campo2_nome">Nome do Campo 2</Label>
                      <Input
                        id="campo2_nome"
                        placeholder="Ex: Hobby Favorito"
                        defaultValue="Hobby Favorito"
                        onChange={(e) => {
                          const value = form.getValues("camposPersonalizados.campo2_valor") || ""
                          const campos = form.getValues("camposPersonalizados") || {}
                          delete campos.campo2_valor
                          form.setValue("camposPersonalizados", {
                            ...campos,
                            [e.target.value]: value,
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campo2_valor">Valor do Campo 2</Label>
                      <Input
                        id="campo2_valor"
                        placeholder="Ex: Fotografia"
                        {...form.register("camposPersonalizados.campo2_valor")}
                      />
                    </div>
                  </div>

                  {/* Campo personalizado 3 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="campo3_nome">Nome do Campo 3</Label>
                      <Input
                        id="campo3_nome"
                        placeholder="Ex: Alergias"
                        defaultValue="Alergias"
                        onChange={(e) => {
                          const value = form.getValues("camposPersonalizados.campo3_valor") || ""
                          const campos = form.getValues("camposPersonalizados") || {}
                          delete campos.campo3_valor
                          form.setValue("camposPersonalizados", {
                            ...campos,
                            [e.target.value]: value,
                          })
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="campo3_valor">Valor do Campo 3</Label>
                      <Input
                        id="campo3_valor"
                        placeholder="Ex: Látex, Poeira"
                        {...form.register("camposPersonalizados.campo3_valor")}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <CardFooter className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/clientes")}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : cliente ? (
              "Atualizar Cliente"
            ) : (
              "Criar Cliente"
            )}
          </Button>
        </CardFooter>
      </div>
    </form>
  )
}
