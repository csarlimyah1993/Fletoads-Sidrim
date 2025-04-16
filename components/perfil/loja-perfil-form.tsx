"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ImageUpload } from "@/components/ui/image-upload"

// Definir o tipo para a loja
interface RedesSociais {
  facebook?: string
  instagram?: string
  twitter?: string
  youtube?: string
  linkedin?: string
  tiktok?: string
}

interface Endereco {
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
  cep?: string
  latitude?: string
  longitude?: string
}

interface Contato {
  telefone?: string
  email?: string
  whatsapp?: string
}

interface HorarioFuncionamento {
  segunda?: { open: boolean; abertura: string; fechamento: string }
  terca?: { open: boolean; abertura: string; fechamento: string }
  quarta?: { open: boolean; abertura: string; fechamento: string }
  quinta?: { open: boolean; abertura: string; fechamento: string }
  sexta?: { open: boolean; abertura: string; fechamento: string }
  sabado?: { open: boolean; abertura: string; fechamento: string }
  domingo?: { open: boolean; abertura: string; fechamento: string }
}

interface LojaData {
  _id: string
  nome: string
  cnpj?: string
  descricao?: string
  endereco?: Endereco | string
  contato?: Contato
  categorias?: string[]
  horarioFuncionamento?: HorarioFuncionamento
  redesSociais?: RedesSociais
  banner?: string
  logo?: string
  [key: string]: any // Para outras propriedades que possam existir
}

// Estados brasileiros para o select
const estados = [
  "Acre",
  "Alagoas",
  "Amapá",
  "Amazonas",
  "Bahia",
  "Ceará",
  "Distrito Federal",
  "Espírito Santo",
  "Goiás",
  "Maranhão",
  "Mato Grosso",
  "Mato Grosso do Sul",
  "Minas Gerais",
  "Pará",
  "Paraíba",
  "Paraná",
  "Pernambuco",
  "Piauí",
  "Rio de Janeiro",
  "Rio Grande do Norte",
  "Rio Grande do Sul",
  "Rondônia",
  "Roraima",
  "Santa Catarina",
  "São Paulo",
  "Sergipe",
  "Tocantins",
]

// Schema de validação com Zod
const lojaFormSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  cnpj: z.string().optional(),
  descricao: z.string().optional(),
  endereco: z
    .object({
      rua: z.string().optional(),
      numero: z.string().optional(),
      complemento: z.string().optional(),
      bairro: z.string().optional(),
      cidade: z.string().optional(),
      estado: z.string().optional(),
      cep: z.string().optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    })
    .optional(),
  contato: z
    .object({
      telefone: z.string().optional(),
      email: z.string().email("Email inválido").optional().or(z.literal("")),
      whatsapp: z.string().optional(),
    })
    .optional(),
  categorias: z.array(z.string()).optional(),
  redesSociais: z
    .object({
      facebook: z.string().url("URL inválida").optional().or(z.literal("")),
      instagram: z.string().url("URL inválida").optional().or(z.literal("")),
      twitter: z.string().url("URL inválida").optional().or(z.literal("")),
      youtube: z.string().url("URL inválida").optional().or(z.literal("")),
      linkedin: z.string().url("URL inválida").optional().or(z.literal("")),
      tiktok: z.string().url("URL inválida").optional().or(z.literal("")),
    })
    .optional(),
})

type FormValues = z.infer<typeof lojaFormSchema>

export function LojaPerfilForm({ loja }: { loja: LojaData }) {
  // Add this at the beginning of the component function to debug the received data
  console.log("LojaPerfilForm recebeu dados:", JSON.stringify(loja, null, 2))

  // Add this check to handle potential undefined values
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("informacoes")
  const [isLoadingCep, setIsLoadingCep] = useState(false)
  const [logoUrl, setLogoUrl] = useState<string>(loja?.logo || "")
  const [bannerUrl, setBannerUrl] = useState<string>(loja?.banner || "")
  const [horarios, setHorarios] = useState<HorarioFuncionamento>(
    loja?.horarioFuncionamento || {
      segunda: { open: true, abertura: "08:00", fechamento: "18:00" },
      terca: { open: true, abertura: "08:00", fechamento: "18:00" },
      quarta: { open: true, abertura: "08:00", fechamento: "18:00" },
      quinta: { open: true, abertura: "08:00", fechamento: "18:00" },
      sexta: { open: true, abertura: "08:00", fechamento: "18:00" },
      sabado: { open: true, abertura: "08:00", fechamento: "18:00" },
      domingo: { open: false, abertura: "00:00", fechamento: "00:00" },
    },
  )
  const [categorias, setCategorias] = useState<string[]>(loja?.categorias || ["Geral"])
  const [novaCategoria, setNovaCategoria] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!loja || !loja._id) {
    console.error("Dados da loja inválidos:", loja)
    return (
      <Card>
        <CardHeader>
          <CardTitle>Erro ao carregar dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Não foi possível carregar os dados da loja. Por favor, tente novamente.</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/perfil-da-loja")}>
            Voltar
          </Button>
        </CardContent>
      </Card>
    )
  }

  // Preparar o endereço inicial
  const enderecoInicial =
    typeof loja?.endereco === "string"
      ? {
          rua: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
          latitude: "",
          longitude: "",
        }
      : {
          rua: loja?.endereco?.rua || "",
          numero: loja?.endereco?.numero || "",
          complemento: loja?.endereco?.complemento || "",
          bairro: loja?.endereco?.bairro || "",
          cidade: loja?.endereco?.cidade || "",
          estado: loja?.endereco?.estado || "",
          cep: loja?.endereco?.cep || "",
          latitude: loja?.endereco?.latitude || "",
          longitude: loja?.endereco?.longitude || "",
        }

  // Preparar valores iniciais para o formulário
  const defaultValues: FormValues = {
    nome: loja?.nome || "",
    cnpj: loja?.cnpj || "",
    descricao: loja?.descricao || "",
    endereco: enderecoInicial,
    contato: {
      telefone: loja?.contato?.telefone || "",
      email: loja?.contato?.email || "",
      whatsapp: loja?.contato?.whatsapp || "",
    },
    categorias: loja?.categorias || ["Geral"],
    redesSociais: {
      facebook: loja?.redesSociais?.facebook || "",
      instagram: loja?.redesSociais?.instagram || "",
      twitter: loja?.redesSociais?.twitter || "",
      linkedin: loja?.redesSociais?.linkedin || "",
      youtube: loja?.redesSociais?.youtube || "",
      tiktok: loja?.redesSociais?.tiktok || "",
    },
  }

  const form = useForm<FormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues,
  })

  // Funções para formatação de campos
  const formatCNPJ = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Limita a 14 dígitos
    const limitedNumbers = numbers.slice(0, 14)

    // Aplica a máscara do CNPJ: 00.000.000/0000-00
    if (limitedNumbers.length <= 2) {
      return limitedNumbers
    } else if (limitedNumbers.length <= 5) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2)}`
    } else if (limitedNumbers.length <= 8) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5)}`
    } else if (limitedNumbers.length <= 12) {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8)}`
    } else {
      return `${limitedNumbers.slice(0, 2)}.${limitedNumbers.slice(2, 5)}.${limitedNumbers.slice(5, 8)}/${limitedNumbers.slice(8, 12)}-${limitedNumbers.slice(12)}`
    }
  }

  const formatCEP = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Limita a 8 dígitos
    const limitedNumbers = numbers.slice(0, 8)

    // Aplica a máscara do CEP: 00000-000
    if (limitedNumbers.length <= 5) {
      return limitedNumbers
    } else {
      return `${limitedNumbers.slice(0, 5)}-${limitedNumbers.slice(5)}`
    }
  }

  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)

    // Aplica a máscara
    if (limitedNumbers.length <= 2) {
      // Apenas DDD
      return limitedNumbers.length ? `(${limitedNumbers}` : ""
    } else if (limitedNumbers.length <= 6) {
      // DDD + início do número
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
    } else if (limitedNumbers.length <= 10) {
      // Formato (99) 9999-9999 (sem o 9 inicial)
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
    } else {
      // Formato (99) 99999-9999 (com o 9 inicial)
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  // Handlers para campos formatados
  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCNPJ(e.target.value)
    form.setValue("cnpj", formattedValue)
  }

  const handleCEPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatCEP(e.target.value)
    form.setValue("endereco.cep", formattedValue as string)
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value)
    form.setValue("contato.telefone", formattedValue as string)
  }

  const handleWhatsappChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value)
    form.setValue("contato.whatsapp", formattedValue)
  }

  // Buscar endereço pelo CEP
  const buscarEnderecoPorCEP = async (cep: string) => {
    // Remover caracteres não numéricos
    const cepLimpo = cep.replace(/\D/g, "")

    if (cepLimpo.length !== 8) return

    setIsLoadingCep(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await response.json()

      if (!data.erro) {
        form.setValue("endereco.rua", data.logradouro || "")
        form.setValue("endereco.bairro", data.bairro || "")
        form.setValue("endereco.cidade", data.localidade || "")
        form.setValue("endereco.estado", data.uf || "")

        // Buscar coordenadas geográficas
        try {
          const endereco = `${data.logradouro}, ${data.bairro}, ${data.localidade}, ${data.uf}`
          const geoResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}`,
          )
          const geoData = await geoResponse.json()

          if (geoData && geoData.length > 0) {
            form.setValue("endereco.latitude", geoData[0].lat)
            form.setValue("endereco.longitude", geoData[0].lon)
          }
        } catch (error) {
          console.error("Erro ao buscar coordenadas:", error)
        }
      } else {
        toast.error("CEP não encontrado")
      }
    } catch (error) {
      toast.error("Erro ao buscar CEP")
      console.error(error)
    } finally {
      setIsLoadingCep(false)
    }
  }

  // Gerenciamento de horários
  const handleHorarioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    const [day, field] = name.split(".")

    setHorarios((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof HorarioFuncionamento],
        [field]: value,
      } as any,
    }))
  }

  const handleHorarioOpenChange = (day: string, open: boolean) => {
    setHorarios((prev) => ({
      ...prev,
      [day]: {
        ...prev[day as keyof HorarioFuncionamento],
        open,
      } as any,
    }))
  }

  // Gerenciamento de categorias
  const adicionarCategoria = () => {
    if (novaCategoria.trim() && !categorias.includes(novaCategoria.trim())) {
      setCategorias([...categorias, novaCategoria.trim()])
      setNovaCategoria("")
    }
  }

  const removerCategoria = (categoria: string) => {
    setCategorias(categorias.filter((cat) => cat !== categoria))
  }

  // Lista corrigida de dias da semana (sem duplicatas)
  const diasDaSemana = [
    { id: "segunda", label: "Segunda-feira" },
    { id: "terca", label: "Terça-feira" },
    { id: "quarta", label: "Quarta-feira" },
    { id: "quinta", label: "Quinta-feira" },
    { id: "sexta", label: "Sexta-feira" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ]

  const onSubmit = async (data: FormValues) => {
    setIsSubmitting(true)
    try {
      // Adicionar horários, categorias e imagens ao payload
      const payload = {
        ...data,
        horarioFuncionamento: horarios,
        categorias: categorias,
        logo: logoUrl,
        banner: bannerUrl,
      }

      const response = await fetch(`/api/lojas/${loja?._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar perfil da loja")
      }

      toast.success("Perfil da loja atualizado com sucesso!")
      router.push("/dashboard/perfil-da-loja")
      router.refresh()
    } catch (error) {
      toast.error((error as Error).message || "Erro ao atualizar perfil da loja")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar Perfil da Loja</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
            <TabsTrigger value="imagens">Imagens</TabsTrigger>
            <TabsTrigger value="endereco">Endereço</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="categorias">Categorias</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <TabsContent value="informacoes">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="nome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Loja</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da sua loja" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="cnpj"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CNPJ</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="00.000.000/0000-00"
                            value={field.value}
                            onChange={(e) => handleCNPJChange(e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="descricao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descrição</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Descreva sua loja em poucas palavras"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="imagens">
                <div className="space-y-6">
                  <div>
                    <FormLabel>Logo da Loja</FormLabel>
                    <div className="mt-2">
                      <ImageUpload
                        value={logoUrl}
                        onChange={(url) => setLogoUrl(url)}
                        onRemove={() => setLogoUrl("")}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recomendado: imagem quadrada de pelo menos 200x200 pixels.
                    </p>
                  </div>

                  <div>
                    <FormLabel>Banner da Loja</FormLabel>
                    <div className="mt-2">
                      <ImageUpload
                        value={bannerUrl}
                        onChange={(url) => setBannerUrl(url)}
                        onRemove={() => setBannerUrl("")}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      Recomendado: imagem retangular de pelo menos 1200x400 pixels.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="endereco">
                <div className="space-y-6">
                  <div>
                    <FormLabel>CEP</FormLabel>
                    <div className="flex gap-2">
                      <FormField
                        control={form.control}
                        name="endereco.cep"
                        render={({ field }) => (
                          <FormItem className="flex-1">
                            <FormControl>
                              <Input
                                placeholder="00000-000"
                                value={field.value}
                                onChange={(e) => {
                                  handleCEPChange(e)
                                  // Se o CEP estiver completo, buscar endereço
                                  if (e.target.value.replace(/\D/g, "").length === 8) {
                                    buscarEnderecoPorCEP(e.target.value)
                                  }
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          const cep = form.getValues("endereco.cep")
                          if (cep) buscarEnderecoPorCEP(cep)
                        }}
                        disabled={isLoadingCep}
                      >
                        {isLoadingCep ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Digite o CEP para preencher automaticamente o endereço.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco.rua"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua/Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da rua" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endereco.numero"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número</FormLabel>
                          <FormControl>
                            <Input placeholder="Número" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endereco.complemento"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input placeholder="Complemento" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endereco.bairro"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bairro</FormLabel>
                          <FormControl>
                            <Input placeholder="Bairro" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endereco.cidade"
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
                  </div>

                  <FormField
                    control={form.control}
                    name="endereco.estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select value={field.value} onValueChange={(value) => form.setValue("endereco.estado", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um estado" />
                          </SelectTrigger>
                          <SelectContent>
                            {estados.map((estado) => (
                              <SelectItem key={estado} value={estado}>
                                {estado}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endereco.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="Latitude (preenchido automaticamente)" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="endereco.longitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input placeholder="Longitude (preenchido automaticamente)" {...field} disabled />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contato">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="contato.email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@sualoja.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contato.telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 0000-0000"
                            value={field.value}
                            onChange={(e) => handleTelefoneChange(e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contato.whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="(00) 00000-0000"
                            value={field.value}
                            onChange={(e) => handleWhatsappChange(e)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="categorias">
                <div className="space-y-6">
                  <div>
                    <FormLabel>Categorias</FormLabel>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {categorias.map((categoria) => (
                        <div key={categoria} className="bg-gray-100 px-3 py-1 rounded-full flex items-center gap-2">
                          <span>{categoria}</span>
                          <button
                            type="button"
                            onClick={() => removerCategoria(categoria)}
                            className="text-gray-500 hover:text-red-500"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Input
                      placeholder="Nova categoria"
                      value={novaCategoria}
                      onChange={(e) => setNovaCategoria(e.target.value)}
                    />
                    <Button type="button" onClick={adicionarCategoria} variant="outline">
                      Adicionar
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="horarios">
                <div className="space-y-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Horários de Funcionamento</h3>
                  </div>

                  <div className="space-y-4">
                    {diasDaSemana.map((dia) => (
                      <div key={dia.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border-b pb-4">
                        <div className="flex items-center justify-between md:justify-start">
                          <span className="font-medium">{dia.label}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Select
                            value={horarios[dia.id as keyof HorarioFuncionamento]?.open ? "open" : "closed"}
                            onValueChange={(value) => handleHorarioOpenChange(dia.id, value === "open")}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="open">Aberto</SelectItem>
                              <SelectItem value="closed">Fechado</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:col-span-2">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <Input
                              type="time"
                              name={`${dia.id}.abertura`}
                              value={horarios[dia.id as keyof HorarioFuncionamento]?.abertura || ""}
                              onChange={handleHorarioChange}
                              disabled={!horarios[dia.id as keyof HorarioFuncionamento]?.open}
                            />
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <Input
                              type="time"
                              name={`${dia.id}.fechamento`}
                              value={horarios[dia.id as keyof HorarioFuncionamento]?.fechamento || ""}
                              onChange={handleHorarioChange}
                              disabled={!horarios[dia.id as keyof HorarioFuncionamento]?.open}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="redes">
                <div className="space-y-6">
                  <h3 className="text-lg font-medium">Redes Sociais</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redesSociais.facebook"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Facebook</FormLabel>
                          <FormControl>
                            <Input placeholder="https://facebook.com/sualoja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redesSociais.instagram"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Instagram</FormLabel>
                          <FormControl>
                            <Input placeholder="https://instagram.com/sualoja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redesSociais.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="https://twitter.com/sualoja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redesSociais.youtube"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>YouTube</FormLabel>
                          <FormControl>
                            <Input placeholder="https://youtube.com/sualoja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="redesSociais.linkedin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>LinkedIn</FormLabel>
                          <FormControl>
                            <Input placeholder="https://linkedin.com/company/sualoja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="redesSociais.tiktok"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>TikTok</FormLabel>
                          <FormControl>
                            <Input placeholder="https://tiktok.com/@sualoja" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </TabsContent>

              <div className="flex justify-end space-x-4">
                <Button type="button" variant="outline" onClick={() => router.push("/dashboard/perfil-da-loja")}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  )
}

export default LojaPerfilForm
