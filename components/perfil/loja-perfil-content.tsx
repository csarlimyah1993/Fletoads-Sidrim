"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { GoogleMap } from "@/components/ui/google-map"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle2, Loader2, MapPin, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { HorariosFuncionamento } from "./horarios-funcionamento"

// Definir os tipos para horários de funcionamento
type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado" | "domingo"

// Definir o tipo para os horários de cada dia
interface HorarioDia {
  aberto: boolean
  horaAbertura: string
  horaFechamento: string
}

type HorariosFuncionamentoType = {
  [key in DiaSemana]?: {
    aberto: boolean
    horaAbertura: string
    horaFechamento: string
  }
}

const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional(),
  endereco: z
    .object({
      rua: z.string().min(1, { message: "A rua é obrigatória." }).optional(),
      numero: z.string().min(1, { message: "O número é obrigatório." }).optional(),
      complemento: z.string().optional(),
      bairro: z.string().min(1, { message: "O bairro é obrigatório." }).optional(),
      cidade: z.string().min(1, { message: "A cidade é obrigatória." }).optional(),
      estado: z.string().min(1, { message: "O estado é obrigatório." }).optional(),
      cep: z.string().min(1, { message: "O CEP é obrigatório." }).optional(),
      latitude: z.string().optional(),
      longitude: z.string().optional(),
    })
    .optional(),
  contato: z
    .object({
      telefone: z.string().min(1, { message: "O telefone é obrigatório." }).optional(),
      email: z.string().email({ message: "Email inválido." }).optional(),
      whatsapp: z.string().optional(),
      site: z.string().optional(),
    })
    .optional(),
  redesSociais: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      twitter: z.string().optional(),
      youtube: z.string().optional(),
      linkedin: z.string().optional(),
    })
    .optional(),
  horarioFuncionamento: z
    .record(
      z.string(),
      z.object({
        aberto: z.boolean(),
        horaAbertura: z.string(),
        horaFechamento: z.string(),
      }),
    )
    .optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

// Atualizar a interface LojaPerfilFormWrapperProps para incluir horarioFuncionamento
interface LojaPerfilFormWrapperProps {
  lojaId: string
  initialValues?: {
    nomeLoja?: string
    descricao?: string
    logoUrl?: string
    bannerUrl?: string
    horarioFuncionamento?: Record<string, any>
  }
}

export default function LojaPerfilContent({ lojaId, initialValues }: LojaPerfilFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [activeTab, setActiveTab] = useState("informacoes")
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Valores padrão para horários de funcionamento
  const horariosPadrao = {
    segunda: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    terca: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    quarta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    quinta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    sexta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    sabado: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    domingo: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
  }

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues: {
      nome: initialValues?.nomeLoja || "",
      descricao: initialValues?.descricao || "",
      logo: initialValues?.logoUrl || "",
      banner: initialValues?.bannerUrl || "",
      endereco: {
        rua: "",
        numero: "",
        complemento: "",
        bairro: "",
        cidade: "",
        estado: "",
        cep: "",
        latitude: "",
        longitude: "",
      },
      contato: {
        telefone: "",
        email: "",
        whatsapp: "",
        site: "",
      },
      redesSociais: {
        instagram: "",
        facebook: "",
        twitter: "",
        youtube: "",
        linkedin: "",
      },
      horarioFuncionamento: initialValues?.horarioFuncionamento || horariosPadrao,
    },
  })

  // Buscar dados completos da loja
  useEffect(() => {
    const fetchLojaData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!lojaId) {
          console.error("ID da loja não fornecido")
          setError("ID da loja não fornecido")
          setIsLoading(false)
          return
        }

        // Adicionar um timeout mais longo para a requisição
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos de timeout

        const response = await fetch(`/api/lojas/${lojaId}`, {
          signal: controller.signal,
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Erro ao buscar dados da loja: ${response.status}`, errorText)
          throw new Error(`Erro ao buscar dados da loja: ${response.status}`)
        }

        const data = await response.json()

        if (data) {
          // Garantir que todos os objetos aninhados existam
          const lojaData = {
            ...data,
            endereco: data.endereco || {},
            contato: data.contato || {},
            redesSociais: data.redesSociais || {},
            horarioFuncionamento: data.horarioFuncionamento || horariosPadrao,
          }

          console.log("Dados da loja carregados:", {
            logo: lojaData.logo,
            banner: lojaData.banner,
          })

          // Preencher o formulário com os dados da loja
          form.reset({
            nome: lojaData.nome || initialValues?.nomeLoja || "",
            descricao: lojaData.descricao || initialValues?.descricao || "",
            logo: lojaData.logo || initialValues?.logoUrl || "",
            banner: lojaData.banner || initialValues?.bannerUrl || "",
            endereco: {
              rua: lojaData.endereco.rua || "",
              numero: lojaData.endereco.numero || "",
              complemento: lojaData.endereco.complemento || "",
              bairro: lojaData.endereco.bairro || "",
              cidade: lojaData.endereco.cidade || "",
              estado: lojaData.endereco.estado || "",
              cep: lojaData.endereco.cep || "",
              latitude: lojaData.endereco.latitude || "",
              longitude: lojaData.endereco.longitude || "",
            },
            contato: {
              telefone: lojaData.contato.telefone || "",
              email: lojaData.contato.email || "",
              whatsapp: lojaData.contato.whatsapp || "",
              site: lojaData.contato.site || "",
            },
            redesSociais: {
              instagram: lojaData.redesSociais.instagram || "",
              facebook: lojaData.redesSociais.facebook || "",
              twitter: lojaData.redesSociais.twitter || "",
              youtube: lojaData.redesSociais.youtube || "",
              linkedin: lojaData.redesSociais.linkedin || "",
            },
            horarioFuncionamento: lojaData.horarioFuncionamento || horariosPadrao,
          })
        }
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
        setError(error instanceof Error ? error.message : "Erro desconhecido ao buscar dados da loja")
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da loja. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (lojaId) {
      fetchLojaData()
    } else {
      setIsLoading(false)
    }
  }, [lojaId, form, initialValues])

  // Função para atualizar as coordenadas no formulário (escondida do usuário)
  const handleLocationChange = (lat: number, lng: number) => {
    form.setValue("endereco.latitude", lat.toString())
    form.setValue("endereco.longitude", lng.toString())
  }

  // Função para formatar o endereço completo
  const getFormattedAddress = () => {
    const endereco = form.watch("endereco")
    if (!endereco) return ""

    const parts = []

    if (endereco.rua) parts.push(endereco.rua)
    if (endereco.numero) parts.push(endereco.numero)
    if (endereco.bairro) parts.push(endereco.bairro)
    if (endereco.cidade) {
      if (endereco.estado) {
        parts.push(`${endereco.cidade} - ${endereco.estado}`)
      } else {
        parts.push(endereco.cidade)
      }
    }
    if (endereco.cep) parts.push(endereco.cep)

    return parts.join(", ")
  }

  // Função para lidar com o envio do formulário
  const onSubmit = async (values: LojaFormValues) => {
    try {
      setIsSubmitting(true)
      setSaveSuccess(false)
      setError(null)

      if (!lojaId) {
        throw new Error("ID da loja não fornecido")
      }

      // Adicionar um timeout mais longo para a requisição
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 segundos de timeout

      // Criar uma cópia dos valores para enviar
      const dataToSend = {
        ...values,
        // Garantir que os horários estejam no formato correto
        horarioFuncionamento: values.horarioFuncionamento || horariosPadrao,
      }

      // Adicionar campos para compatibilidade com o formato antigo
      if (dataToSend.horarioFuncionamento) {
        Object.keys(dataToSend.horarioFuncionamento).forEach((dia) => {
          const horario = (dataToSend.horarioFuncionamento as Record<string, any>)[dia]
          if (horario) {
            // Adicionar campos no formato antigo para compatibilidade
            ;(horario as any).open = horario.aberto
            ;(horario as any).abertura = horario.horaAbertura
            ;(horario as any).fechamento = horario.horaFechamento
          }
        })
      }

      console.log("Enviando dados para salvar:", {
        logo: dataToSend.logo,
        banner: dataToSend.banner,
      })

      const response = await fetch(`/api/lojas/${lojaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        body: JSON.stringify(dataToSend),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      // Tentar obter o texto da resposta primeiro
      const responseText = await response.text()

      // Tentar converter para JSON
      let result
      try {
        result = JSON.parse(responseText)
      } catch (e) {
        throw new Error(`Resposta inválida do servidor: ${responseText}`)
      }

      if (!response.ok) {
        throw new Error(result.error || `Erro ao salvar dados da loja: ${response.status}`)
      }

      // Mostrar mensagem de sucesso
      setSaveSuccess(true)

      toast({
        title: "Sucesso",
        description: "Dados da loja salvos com sucesso!",
      })

      // Scroll para o topo para mostrar a mensagem de sucesso
      window.scrollTo({ top: 0, behavior: "smooth" })

      // Não redirecionar automaticamente para permitir que o usuário veja a confirmação
      setTimeout(() => {
        router.refresh()
      }, 500)
    } catch (error) {
      console.error("Erro ao salvar dados da loja:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao salvar dados da loja")
      toast({
        title: "Erro",
        description:
          error instanceof Error
            ? error.message
            : "Não foi possível salvar os dados da loja. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Função para atualizar os horários de funcionamento
  const handleHorariosSave = async (horarios: any) => {
    // Adicionar campos para compatibilidade com o formato antigo
    Object.keys(horarios).forEach((dia) => {
      const horario = horarios[dia]
      if (horario) {
        // Adicionar campos no formato antigo para compatibilidade
        horario.open = horario.aberto
        horario.abertura = horario.horaAbertura
        horario.fechamento = horario.horaFechamento
      }
    })

    form.setValue("horarioFuncionamento", horarios)
    toast({
      title: "Horários atualizados",
      description: "Os horários foram atualizados no formulário. Clique em Salvar Alterações para confirmar.",
    })
  }

  // Função para lidar com a mudança de imagens
  const handleImageChange = (fieldName: "logo" | "banner", url: string | string[]) => {
    const imageUrl = typeof url === "string" ? url : url[0] || ""
    console.log(`Atualizando ${fieldName} para:`, imageUrl)
    form.setValue(fieldName, imageUrl)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados da loja...</span>
      </div>
    )
  }

  if (error && !lojaId) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h3 className="text-lg font-medium text-red-800">Erro ao carregar dados</h3>
        <p className="text-red-700">{error}</p>
        <Button className="mt-4" onClick={() => router.push("/dashboard")}>
          Voltar para o Dashboard
        </Button>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200 text-green-800 mb-6">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Dados salvos com sucesso!</AlertTitle>
            <AlertDescription>As informações da sua loja foram atualizadas com sucesso.</AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro ao salvar dados</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Perfil da Loja</CardTitle>
            <CardDescription>Configure as informações da sua loja que serão exibidas para os clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
                <TabsTrigger value="horarios">Horários</TabsTrigger>
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="contato">Contato</TabsTrigger>
                <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
              </TabsList>

              <TabsContent value="informacoes" className="space-y-6">
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
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Descreva sua loja em poucas palavras..." {...field} />
                      </FormControl>
                      <FormDescription>Esta descrição será exibida na página principal da sua loja.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Logo</h3>
                    <FormField
                      control={form.control}
                      name="logo"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              value={field.value || ""}
                              onChange={(url) => handleImageChange("logo", url)}
                              onRemove={() => handleImageChange("logo", "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Banner</h3>
                    <FormField
                      control={form.control}
                      name="banner"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <ImageUpload
                              value={field.value || ""}
                              onChange={(url) => handleImageChange("banner", url)}
                              onRemove={() => handleImageChange("banner", "")}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-sm text-muted-foreground mt-2">
                      Recomendamos uma imagem de pelo menos 1200x400 pixels.
                    </p>
                  </div>
                </div>
              </TabsContent>

              {/* Aba de Horários de Funcionamento */}
              <TabsContent value="horarios" className="space-y-6">
                <HorariosFuncionamento
                  lojaId={lojaId}
                  horarios={form.watch("horarioFuncionamento") as Record<string, any>}
                  onSave={handleHorariosSave}
                />
              </TabsContent>

              <TabsContent value="endereco" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endereco.rua"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua/Logradouro</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua/Avenida" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.numero"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número</FormLabel>
                        <FormControl>
                          <Input placeholder="123" {...field} />
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
                          <Input placeholder="Apto, Sala, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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

                  <FormField
                    control={form.control}
                    name="endereco.estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <FormControl>
                          <Input placeholder="Estado" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endereco.cep"
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
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Localização no Mapa</h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        // Buscar localização pelo endereço
                        // O componente GoogleMap fará isso automaticamente
                      }}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Buscar no Mapa
                    </Button>
                  </div>

                  <p className="text-sm text-muted-foreground mb-4">
                    Arraste o marcador para ajustar a localização exata da sua loja.
                  </p>

                  <div className="h-[400px] w-full rounded-md overflow-hidden border">
                    <GoogleMap
                      address={getFormattedAddress()}
                      latitude={form.watch("endereco.latitude")}
                      longitude={form.watch("endereco.longitude")}
                      storeName={form.watch("nome")}
                      height="400px"
                      zoom={15}
                      onLocationChange={handleLocationChange}
                      interactive={true}
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="contato" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="contato.telefone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(00) 0000-0000" {...field} />
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
                          <Input placeholder="(00) 00000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contato.email"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
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
                    name="contato.site"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Site</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.sualoja.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </TabsContent>

              <TabsContent value="redes" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
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
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
