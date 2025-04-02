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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useSession } from "next-auth/react"
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Schema de validação
const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
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
  telefone: z.string().optional(),
  email: z
    .string()
    .email({
      message: "Por favor, insira um email válido.",
    })
    .optional()
    .or(z.literal("")),
  website: z
    .string()
    .url({
      message: "Por favor, insira uma URL válida.",
    })
    .optional()
    .or(z.literal("")),
  logoUrl: z.string().optional(),
  bannerUrl: z.string().optional(),
  horarioFuncionamento: z.record(z.string(), z.any()).optional(),
  redesSociais: z
    .object({
      facebook: z.string().optional(),
      instagram: z.string().optional(),
      twitter: z.string().optional(),
      linkedin: z.string().optional(),
      youtube: z.string().optional(),
    })
    .optional(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

interface LojaFormProps {
  loja?: any
  isEditing?: boolean
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

export function LojaPerfilForm({ loja, isEditing = false }: LojaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { data: session } = useSession()
  const [userPlan, setUserPlan] = useState("free")
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    // Fetch user plan
    const fetchUserPlan = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (response.ok) {
          const data = await response.json()
          setUserPlan(data.plan || "free")
        }
      } catch (error) {
        console.error("Error fetching user plan:", error)
      }
    }

    fetchUserPlan()
  }, [])

  console.log("Loja recebida no componente:", loja)

  // Valores padrão para o formulário
  const defaultValues: Partial<LojaFormValues> = {
    nome: loja?.nome || "",
    descricao: loja?.descricao || "",
    endereco: {
      rua: loja?.endereco?.rua || "",
      numero: loja?.endereco?.numero || "",
      complemento: loja?.endereco?.complemento || "",
      bairro: loja?.endereco?.bairro || "",
      cidade: loja?.endereco?.cidade || "",
      estado: loja?.endereco?.estado || "",
      cep: loja?.endereco?.cep || "",
      latitude: loja?.endereco?.latitude || "",
      longitude: loja?.endereco?.longitude || "",
    },
    telefone: loja?.telefone || "",
    email: loja?.email || "",
    website: loja?.website || "",
    logoUrl: loja?.logo || loja?.logoUrl || "",
    bannerUrl: loja?.banner || loja?.bannerUrl || "",
    horarioFuncionamento: loja?.horarioFuncionamento || defaultBusinessHours,
    redesSociais: {
      facebook: loja?.redesSociais?.facebook || "",
      instagram: loja?.redesSociais?.instagram || "",
      twitter: loja?.redesSociais?.twitter || "",
      linkedin: loja?.redesSociais?.linkedin || "",
      youtube: loja?.redesSociais?.youtube || "",
    },
  }

  console.log("Default values:", defaultValues)

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues,
  })

  // Atualizar o formulário quando os dados da loja mudarem
  useEffect(() => {
    if (loja) {
      console.log("Atualizando formulário com dados da loja:", loja)
      form.reset({
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
        telefone: loja.telefone || "",
        email: loja.email || "",
        website: loja.website || "",
        logoUrl: loja.logo || loja.logoUrl || "",
        bannerUrl: loja.banner || loja.bannerUrl || "",
        horarioFuncionamento: loja.horarioFuncionamento || defaultBusinessHours,
        redesSociais: {
          facebook: loja.redesSociais?.facebook || "",
          instagram: loja.redesSociais?.instagram || "",
          twitter: loja.redesSociais?.twitter || "",
          linkedin: loja.redesSociais?.linkedin || "",
          youtube: loja.redesSociais?.youtube || "",
        },
      })
    }
  }, [loja, form])

  const onSubmit = async (data: LojaFormValues) => {
    setIsSaving(true)
    setSaveStatus("idle")
    setErrorMessage("")

    try {
      console.log("Enviando dados para salvar:", data)

      // Mapear os campos do formulário para o formato esperado pela API
      const lojaData = {
        _id: loja?._id,
        nome: data.nome,
        descricao: data.descricao,
        endereco: data.endereco || {},
        telefone: data.telefone,
        email: data.email,
        website: data.website,
        logo: data.logoUrl, // Mapear logoUrl para logo
        banner: data.bannerUrl, // Mapear bannerUrl para banner
        horarioFuncionamento: data.horarioFuncionamento,
        redesSociais: data.redesSociais || {},
      }

      console.log("Dados formatados para API:", lojaData)

      const response = await fetch("/api/loja/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(lojaData),
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
                    <Textarea placeholder="Descreva sua loja em poucas palavras" {...field} />
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
              <p className="text-sm text-gray-500">Como seus clientes podem entrar em contato com você.</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Endereço</CardTitle>
                <CardDescription>Localização física da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endereco.rua"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Rua</FormLabel>
                        <FormControl>
                          <Input placeholder="Rua" {...field} />
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
                          <Input placeholder="Número" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {userPlan !== "free" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="endereco.latitude"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: -23.5505" {...field} />
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
                            <Input placeholder="Ex: -46.6333" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contato</CardTitle>
                <CardDescription>Informações de contato da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Telefone para contato" {...field} />
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
                        <Input placeholder="Email para contato" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.seusiteaqui.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Redes Sociais</CardTitle>
                <CardDescription>Conecte suas redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="redesSociais.instagram"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Instagram</FormLabel>
                      <FormControl>
                        <Input placeholder="@seuusuario" {...field} />
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
                        <Input placeholder="facebook.com/seuusuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {userPlan !== "free" && (
                  <>
                    <FormField
                      control={form.control}
                      name="redesSociais.twitter"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Twitter</FormLabel>
                          <FormControl>
                            <Input placeholder="@seuusuario" {...field} />
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
                            <Input placeholder="linkedin.com/in/seuusuario" {...field} />
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
                            <Input placeholder="youtube.com/@seucanal" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="horarios" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Horários de Funcionamento</h3>
              <p className="text-sm text-gray-500">Defina os horários de funcionamento da sua loja.</p>
            </div>

            <FormField
              control={form.control}
              name="horarioFuncionamento"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <BusinessHoursSelector value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="imagens" className="space-y-6">
            <div>
              <h3 className="text-lg font-medium">Imagens</h3>
              <p className="text-sm text-gray-500">Personalize sua loja com imagens de logo e banner.</p>
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Logo da Loja</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} tipo="logo" className="mt-2" />
                  </FormControl>
                  <FormDescription>Faça upload da logo da sua loja ou insira uma URL de imagem.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Banner da Loja</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value || ""} onChange={field.onChange} tipo="banner" className="mt-2" />
                  </FormControl>
                  <FormDescription>Faça upload de um banner para sua loja ou insira uma URL de imagem.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
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

