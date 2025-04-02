"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BusinessHoursSelector, type BusinessHoursSchedule } from "@/components/ui/business-hours-selector"
import { useSession } from "next-auth/react"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Schema de validação
const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional(),
  endereco: z.object({
    rua: z.string().optional(),
    numero: z.string().optional(),
    complemento: z.string().optional(),
    bairro: z.string().optional(),
    cidade: z.string().optional(),
    estado: z.string().optional(),
    cep: z.string().optional(),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }),
  contato: z.object({
    telefone: z.string().optional(),
    whatsapp: z.string().optional(),
    email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
    site: z.string().optional(),
  }),
  logo: z.string().optional(),
  banner: z.string().optional(),
  horarioFuncionamento: z.record(z.string(), z.any()).optional(),
  redesSociais: z.object({
    facebook: z.string().optional(),
    instagram: z.string().optional(),
    twitter: z.string().optional(),
    linkedin: z.string().optional(),
    youtube: z.string().optional(),
  }),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

export interface LojaFormProps {
  loja?: any
}

// Default business hours
const defaultBusinessHours: BusinessHoursSchedule = {
  segunda: { open: true, abertura: "08:00", fechamento: "18:00" },
  terca: { open: true, abertura: "08:00", fechamento: "18:00" },
  quarta: { open: true, abertura: "08:00", fechamento: "18:00" },
  quinta: { open: true, abertura: "08:00", fechamento: "18:00" },
  sexta: { open: true, abertura: "08:00", fechamento: "18:00" },
  sabado: { open: true, abertura: "09:00", fechamento: "13:00" },
  domingo: { open: false, abertura: "00:00", fechamento: "00:00" },
}

export function LojaPerfilForm({ loja }: LojaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { data: session } = useSession()
  const [userPlan, setUserPlan] = useState("free")
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  console.log("Loja recebida no componente:", loja)

  // Preparar os valores iniciais do formulário
  const prepareDefaultValues = () => {
    if (!loja)
      return {
        nome: "",
        descricao: "",
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
          whatsapp: "",
          email: "",
          site: "",
        },
        logo: "",
        banner: "",
        horarioFuncionamento: defaultBusinessHours,
        redesSociais: {
          facebook: "",
          instagram: "",
          twitter: "",
          linkedin: "",
          youtube: "",
        },
      }

    // Extrair dados de contato da loja
    const telefone = loja?.contato?.telefone || loja?.telefone || ""
    const email = loja?.contato?.email || loja?.email || ""
    const whatsapp = loja?.contato?.whatsapp || loja?.whatsapp || ""
    const site = loja?.contato?.site || loja?.website || ""

    return {
      nome: loja.nome || "",
      descricao: loja.descricao || "",
      endereco: {
        rua: loja.endereco?.rua || "",
        numero: loja.endereco?.numero || "",
        complemento: loja.endereco?.complemento || "",
        bairro: loja.endereco?.bairro || "",
        cidade: loja.endereco?.cidade || "",
        estado: loja.endereco?.estado || "",
        cep: loja.endereco?.cep || "",
        latitude: loja.endereco?.latitude || "",
        longitude: loja.endereco?.longitude || "",
      },
      contato: {
        telefone: telefone,
        whatsapp: whatsapp,
        email: email,
        site: site,
      },
      logo: loja.logo || "",
      banner: loja.banner || "",
      horarioFuncionamento: loja.horarioFuncionamento || defaultBusinessHours,
      redesSociais: {
        facebook: loja.redesSociais?.facebook || "",
        instagram: loja.redesSociais?.instagram || "",
        twitter: loja.redesSociais?.twitter || "",
        linkedin: loja.redesSociais?.linkedin || "",
        youtube: loja.redesSociais?.youtube || "",
      },
    }
  }

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues: prepareDefaultValues(),
  })

  // Atualizar o formulário quando os dados da loja mudarem
  useEffect(() => {
    if (loja) {
      console.log("Atualizando formulário com dados da loja:", loja)
      form.reset(prepareDefaultValues())
    }
  }, [loja, form])

  // Buscar o plano do usuário
  useEffect(() => {
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.plan || "free")
        }
      } catch (error) {
        console.error("Erro ao buscar plano do usuário:", error)
      }
    }

    fetchUserPlan()
  }, [])

  const onSubmit = async (data: LojaFormValues) => {
    setIsSaving(true)
    setSaveStatus("idle")
    setErrorMessage("")

    try {
      console.log("Enviando dados para salvar:", data)

      // Preparar os dados para envio
      const lojaDataToSubmit = {
        _id: loja?._id,
        nome: data.nome,
        descricao: data.descricao,
        endereco: data.endereco,
        contato: {
          telefone: data.contato.telefone || "",
          email: data.contato.email || "",
          whatsapp: data.contato.whatsapp || "",
          site: data.contato.site || "",
        },
        logo: data.logo,
        banner: data.banner,
        horarioFuncionamento: data.horarioFuncionamento,
        redesSociais: data.redesSociais,
      }

      console.log("Dados formatados para API:", lojaDataToSubmit)

      const response = await fetch("/api/loja/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lojaDataToSubmit),
      })

      const responseData = await response.json()
      console.log("Resposta da API:", responseData)

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao salvar dados da loja")
      }

      // Mostrar mensagem de sucesso
      toast.success("Dados da loja salvos com sucesso!")
      setSaveStatus("success")

      // Redirecionar para a página de perfil da loja após salvar
      setTimeout(() => {
        router.push("/dashboard/perfil-da-loja")
        router.refresh()
      }, 2000)
    } catch (error) {
      console.error("Erro ao salvar dados da loja:", error)
      const message = error instanceof Error ? error.message : "Erro ao salvar dados da loja"
      toast.error(message)
      setErrorMessage(message)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="informacoes">Informações</TabsTrigger>
            <TabsTrigger value="contato">Contato</TabsTrigger>
            <TabsTrigger value="horarios">Horários</TabsTrigger>
            <TabsTrigger value="imagens">Imagens</TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Informações Básicas</h3>
              <p className="text-sm text-gray-500">Informações gerais sobre sua loja.</p>
            </div>

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da Loja</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da sua loja" {...field} />
                  </FormControl>
                  <FormDescription>Este é o nome que será exibido para seus clientes.</FormDescription>
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
                    <Textarea placeholder="Descreva sua loja em poucas palavras" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormDescription>Uma breve descrição da sua loja e dos produtos que você vende.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="contato" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Informações de Contato</h3>
              <p className="text-sm text-gray-500">
                Detalhes para que seus clientes possam entrar em contato com você.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contato.telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Número de telefone para contato.</FormDescription>
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
                      <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Número de WhatsApp para contato.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contato.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email de Contato</FormLabel>
                    <FormControl>
                      <Input placeholder="contato@sualoja.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Endereço de email para contato.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato.site"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website</FormLabel>
                    <FormControl>
                      <Input placeholder="https://www.sualoja.com" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormDescription>Endereço do seu website (opcional).</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <h3 className="text-lg font-medium">Endereço</h3>
            <p className="text-sm text-gray-500">
              Localização da sua loja para que seus clientes possam encontrá-la facilmente.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.rua"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Rua</FormLabel>
                    <FormControl>
                      <Input placeholder="Rua" {...field} value={field.value || ""} />
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
                      <Input placeholder="Número" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="endereco.complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Complemento" {...field} value={field.value || ""} />
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
                      <Input placeholder="Bairro" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="endereco.cidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cidade</FormLabel>
                    <FormControl>
                      <Input placeholder="Cidade" {...field} value={field.value || ""} />
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
                      <Input placeholder="Estado" {...field} value={field.value || ""} />
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
                      <Input placeholder="00000-000" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="horarios">
            <div>
              <h3 className="text-lg font-medium">Horário de Funcionamento</h3>
              <p className="text-sm text-gray-500">
                Defina o horário de funcionamento da sua loja para cada dia da semana.
              </p>
            </div>
            <FormField
              control={form.control}
              name="horarioFuncionamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Horário de Funcionamento</FormLabel>
                  <FormControl>
                    <BusinessHoursSelector value={field.value || defaultBusinessHours} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>Configure os horários de abertura e fechamento da sua loja.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="imagens" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Imagens da Loja</h3>
              <p className="text-sm text-gray-500">Adicione o logo e o banner da sua loja para personalizá-la.</p>
            </div>

            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo da Loja</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} tipo="logo" />
                  </FormControl>
                  <FormDescription>Adicione o logo da sua loja para identificação visual.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner da Loja</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} tipo="banner" />
                  </FormControl>
                  <FormDescription>Adicione um banner para destacar sua loja.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <h3 className="text-lg font-medium">Redes Sociais</h3>
            <p className="text-sm text-gray-500">Links para as redes sociais da sua loja.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="redesSociais.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="URL do Facebook" {...field} value={field.value || ""} />
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
                      <Input placeholder="URL do Instagram" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>
        </Tabs>

        {saveStatus === "success" && (
          <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle>Sucesso!</AlertTitle>
            <AlertDescription>Dados da loja salvos com sucesso. Redirecionando...</AlertDescription>
          </Alert>
        )}

        {saveStatus === "error" && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>{errorMessage || "Ocorreu um erro ao salvar os dados da loja."}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/perfil-da-loja")}
            disabled={isSaving}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

