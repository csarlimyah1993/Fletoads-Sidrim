"use client"

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
import { Checkbox } from "@/components/ui/checkbox"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
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
    })
    .optional(),

  // Dados demográficos
  demograficos: z
    .object({
      dataNascimento: z.date().optional().nullable(),
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
      proximoContato: z.date().optional().nullable(),
      frequenciaIdeal: z.string().optional().or(z.literal("")),
      responsavel: z.string().optional().or(z.literal("")),
      notas: z.string().optional().or(z.literal("")),
    })
    .optional(),

  // Dados personalizados
  camposPersonalizados: z.record(z.string()).optional(),
})

type ClienteFormValues = z.infer<typeof clienteSchema>

interface Cliente {
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

interface ClienteFormProps {
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
    return new Date(dateString)
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
    },

    // Dados demográficos
    demograficos: {
      dataNascimento: parseDate(cliente?.demograficos?.dataNascimento) || null,
      genero: cliente?.demograficos?.genero || "",
      estadoCivil: cliente?.demograficos?.estadoCivil || "",
      profissao: cliente?.demograficos?.profissao || "",
      faixaRenda: cliente?.demograficos?.faixaRenda || "",
    },

    // Dados de relacionamento
    relacionamento: {
      ultimoContato: parseDate(cliente?.relacionamento?.ultimoContato) || null,
      proximoContato: parseDate(cliente?.relacionamento?.proximoContato) || null,
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

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: ClienteFormValues) => {
    setIsSubmitting(true)
    try {
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
                    <Label htmlFor="rua">Rua</Label>
                    <Input id="rua" placeholder="Rua" {...form.register("endereco.rua")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="numero">Número</Label>
                    <Input id="numero" placeholder="Número" {...form.register("endereco.numero")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="complemento">Complemento</Label>
                    <Input id="complemento" placeholder="Complemento" {...form.register("endereco.complemento")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="bairro">Bairro</Label>
                    <Input id="bairro" placeholder="Bairro" {...form.register("endereco.bairro")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cidade">Cidade</Label>
                    <Input id="cidade" placeholder="Cidade" {...form.register("endereco.cidade")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estado">Estado</Label>
                    <Input id="estado" placeholder="Estado" {...form.register("endereco.estado")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cep">CEP</Label>
                    <Input id="cep" placeholder="CEP" {...form.register("endereco.cep")} />
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
                    <Label htmlFor="cores">Cores Preferidas</Label>
                    <Input id="cores" placeholder="Cores preferidas" {...form.register("preferencias.cores")} />
                    <p className="text-sm text-muted-foreground">Exemplo: Azul, Preto, Vermelho</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estilos">Estilos Preferidos</Label>
                    <Input id="estilos" placeholder="Estilos preferidos" {...form.register("preferencias.estilos")} />
                    <p className="text-sm text-muted-foreground">Exemplo: Casual, Esportivo, Formal</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tamanhos">Tamanhos</Label>
                    <Input id="tamanhos" placeholder="Tamanhos" {...form.register("preferencias.tamanhos")} />
                    <p className="text-sm text-muted-foreground">Exemplo: M, 42, G</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="marcas">Marcas Preferidas</Label>
                    <Input id="marcas" placeholder="Marcas preferidas" {...form.register("preferencias.marcas")} />
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
                    <Label htmlFor="canalAquisicao">Canal de Aquisição</Label>
                    <Select
                      defaultValue={form.getValues("marketing.canalAquisicao") || ""}
                      onValueChange={(value) => form.setValue("marketing.canalAquisicao", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="campanhaOrigem">Campanha de Origem</Label>
                    <Input
                      id="campanhaOrigem"
                      placeholder="Campanha que trouxe o cliente"
                      {...form.register("marketing.campanhaOrigem")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="etapaFunil">Etapa no Funil</Label>
                    <Select
                      defaultValue={form.getValues("marketing.etapaFunil") || "prospecto"}
                      onValueChange={(value) => form.setValue("marketing.etapaFunil", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="pontuacao">Pontuação (Lead Score)</Label>
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permiteEmail"
                        checked={form.getValues("marketing.permiteEmail")}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteEmail", checked === true)}
                      />
                      <Label htmlFor="permiteEmail">Permite Email Marketing</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permiteSMS"
                        checked={form.getValues("marketing.permiteSMS")}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteSMS", checked === true)}
                      />
                      <Label htmlFor="permiteSMS">Permite SMS</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="permiteWhatsapp"
                        checked={form.getValues("marketing.permiteWhatsapp")}
                        onCheckedChange={(checked) => form.setValue("marketing.permiteWhatsapp", checked === true)}
                      />
                      <Label htmlFor="permiteWhatsapp">Permite WhatsApp</Label>
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
                    <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.getValues("demograficos.dataNascimento") && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues("demograficos.dataNascimento") ? (
                            format(form.getValues("demograficos.dataNascimento") as Date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={(form.getValues("demograficos.dataNascimento") as Date) || undefined}
                          onSelect={(date) => form.setValue("demograficos.dataNascimento", date)}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="genero">Gênero</Label>
                    <Select
                      defaultValue={form.getValues("demograficos.genero") || ""}
                      onValueChange={(value) => form.setValue("demograficos.genero", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="estadoCivil">Estado Civil</Label>
                    <Select
                      defaultValue={form.getValues("demograficos.estadoCivil") || ""}
                      onValueChange={(value) => form.setValue("demograficos.estadoCivil", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="profissao">Profissão</Label>
                    <Input
                      id="profissao"
                      placeholder="Profissão do cliente"
                      {...form.register("demograficos.profissao")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="faixaRenda">Faixa de Renda</Label>
                    <Select
                      defaultValue={form.getValues("demograficos.faixaRenda") || ""}
                      onValueChange={(value) => form.setValue("demograficos.faixaRenda", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="ultimoContato">Último Contato</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.getValues("relacionamento.ultimoContato") && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues("relacionamento.ultimoContato") ? (
                            format(form.getValues("relacionamento.ultimoContato") as Date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={(form.getValues("relacionamento.ultimoContato") as Date) || undefined}
                          onSelect={(date) => form.setValue("relacionamento.ultimoContato", date)}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="proximoContato">Próximo Contato</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !form.getValues("relacionamento.proximoContato") && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {form.getValues("relacionamento.proximoContato") ? (
                            format(form.getValues("relacionamento.proximoContato") as Date, "PPP", { locale: ptBR })
                          ) : (
                            <span>Selecione uma data</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={(form.getValues("relacionamento.proximoContato") as Date) || undefined}
                          onSelect={(date) => form.setValue("relacionamento.proximoContato", date)}
                          initialFocus
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequenciaIdeal">Frequência Ideal de Contato</Label>
                    <Select
                      defaultValue={form.getValues("relacionamento.frequenciaIdeal") || ""}
                      onValueChange={(value) => form.setValue("relacionamento.frequenciaIdeal", value)}
                    >
                      <SelectTrigger>
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
                    <Label htmlFor="responsavel">Responsável pelo Cliente</Label>
                    <Input
                      id="responsavel"
                      placeholder="Nome do responsável"
                      {...form.register("relacionamento.responsavel")}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notas">Notas de Relacionamento</Label>
                  <Textarea
                    id="notas"
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
