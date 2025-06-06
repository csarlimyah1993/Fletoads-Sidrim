"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Função para fazer requisições com retry
async function fetchWithRetry(url: string, options: RequestInit = {}, retries = 3, delay = 1000) {
  try {
    console.log(`Fazendo requisição para ${url}`, options)
    const response = await fetch(url, options)
    console.log(`Resposta de ${url}:`, response.status)
    return response
  } catch (err) {
    console.error(`Erro na requisição para ${url}:`, err)
    if (retries <= 1) throw err
    console.log(`Tentando novamente em ${delay}ms...`)
    await new Promise((resolve) => setTimeout(resolve, delay))
    return fetchWithRetry(url, options, retries - 1, delay * 2)
  }
}

// Schema de validação
const perfilSchema = z.object({
  nome: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  cpf: z.string().min(11, { message: "CPF deve ter 11 dígitos" }).max(14).optional(),
  perfil: z
    .object({
      foto: z.string().optional(),
      telefone: z.string().optional(),
      bio: z.string().optional(),
      endereco: z
        .object({
          rua: z.string().optional(),
          numero: z.string().optional(),
          complemento: z.string().optional(),
          bairro: z.string().optional(),
          cidade: z.string().optional(),
          estado: z.string().optional(),
          cep: z.string().optional(),
        })
        .optional(),
      redesSociais: z
        .object({
          instagram: z.string().optional(),
          facebook: z.string().optional(),
          linkedin: z.string().optional(),
          twitter: z.string().optional(),
        })
        .optional(),
      preferencias: z
        .object({
          notificacoes: z.boolean().optional(),
          temaEscuro: z.boolean().optional(),
          idioma: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
})

type PerfilFormValues = z.infer<typeof perfilSchema>

interface UsuarioPerfilFormProps {
  initialData?: any
}

export function UsuarioPerfilForm({ initialData }: UsuarioPerfilFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [usuario, setUsuario] = useState<any>(initialData || null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const form = useForm<PerfilFormValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nome: "",
      cpf: "",
      perfil: {
        foto: "",
        telefone: "",
        bio: "",
        endereco: {
          rua: "",
          numero: "",
          complemento: "",
          bairro: "",
          cidade: "",
          estado: "",
          cep: "",
        },
        redesSociais: {
          instagram: "",
          facebook: "",
          linkedin: "",
          twitter: "",
        },
        preferencias: {
          notificacoes: true,
          temaEscuro: false,
          idioma: "pt-BR",
        },
      },
    },
  })

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUsuario = async () => {
      // If we already have initialData, use it
      if (initialData) {
        console.log("Usando initialData:", initialData)
        setUsuario(initialData)

        // Preencher o formulário com os dados iniciais
        form.reset({
          nome: initialData.nome || "",
          cpf: initialData.cpf || "",
          perfil: {
            foto: initialData.perfil?.foto || "",
            telefone: initialData.perfil?.telefone || "",
            bio: initialData.perfil?.bio || "",
            endereco: {
              rua: initialData.perfil?.endereco?.rua || "",
              numero: initialData.perfil?.endereco?.numero || "",
              complemento: initialData.perfil?.endereco?.complemento || "",
              bairro: initialData.perfil?.endereco?.bairro || "",
              cidade: initialData.perfil?.endereco?.cidade || "",
              estado: initialData.perfil?.endereco?.estado || "",
              cep: initialData.perfil?.endereco?.cep || "",
            },
            redesSociais: {
              instagram: initialData.perfil?.redesSociais?.instagram || "",
              facebook: initialData.perfil?.redesSociais?.facebook || "",
              linkedin: initialData.perfil?.redesSociais?.linkedin || "",
              twitter: initialData.perfil?.redesSociais?.twitter || "",
            },
            preferencias: {
              notificacoes: initialData.perfil?.preferencias?.notificacoes ?? true,
              temaEscuro: initialData.perfil?.preferencias?.temaEscuro ?? false,
              idioma: initialData.perfil?.preferencias?.idioma || "pt-BR",
            },
          },
        })
        return
      }

      try {
        setIsLoading(true)
        setLoadError(null)
        console.log("Buscando dados do usuário...")

        const response = await fetchWithRetry(
          "/api/usuario/perfil",
          {
            headers: {
              "Cache-Control": "no-cache",
              Pragma: "no-cache",
            },
          },
          3,
          1000,
        )

        if (response.status === 404) {
          console.warn("Usuário não encontrado")
          setLoadError("Usuário não encontrado. Por favor, faça login novamente.")
          return
        }

        if (!response.ok) {
          throw new Error(`Falha ao buscar dados do usuário: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dados do usuário recebidos:", data)
        setUsuario(data)

        // Preencher o formulário com os dados do usuário
        form.reset({
          nome: data.nome || "",
          cpf: data.cpf || "",
          perfil: {
            foto: data.perfil?.foto || "",
            telefone: data.perfil?.telefone || "",
            bio: data.perfil?.bio || "",
            endereco: {
              rua: data.perfil?.endereco?.rua || "",
              numero: data.perfil?.endereco?.numero || "",
              complemento: data.perfil?.endereco?.complemento || "",
              bairro: data.perfil?.endereco?.bairro || "",
              cidade: data.perfil?.endereco?.cidade || "",
              estado: data.perfil?.endereco?.estado || "",
              cep: data.perfil?.endereco?.cep || "",
            },
            redesSociais: {
              instagram: data.perfil?.redesSociais?.instagram || "",
              facebook: data.perfil?.redesSociais?.facebook || "",
              linkedin: data.perfil?.redesSociais?.linkedin || "",
              twitter: data.perfil?.redesSociais?.twitter || "",
            },
            preferencias: {
              notificacoes: data.perfil?.preferencias?.notificacoes ?? true,
              temaEscuro: data.perfil?.preferencias?.temaEscuro ?? false,
              idioma: data.perfil?.preferencias?.idioma || "pt-BR",
            },
          },
        })
      } catch (error) {
        console.error("Erro ao buscar perfil:", error)
        setLoadError("Erro ao carregar dados do perfil. Por favor, recarregue a página.")
        toast.error("Erro ao carregar dados do perfil. Por favor, recarregue a página.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchUsuario()
  }, [form, initialData])

  async function onSubmit(values: PerfilFormValues) {
    try {
      setIsSaving(true)
      setSaveSuccess(false)
      console.log("Enviando dados do formulário:", values)

      const response = await fetchWithRetry(
        "/api/usuario/perfil",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        },
        3,
        1000,
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Falha ao atualizar perfil: ${response.status}`)
      }

      const data = await response.json()
      console.log("Resposta da atualização:", data)
      setUsuario(data)

      // Mostrar mensagem de sucesso
      setSaveSuccess(true)
      toast.success("Perfil atualizado com sucesso!")

      // Esconder a mensagem de sucesso após 3 segundos
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error)
      toast.error("Erro ao atualizar perfil. Por favor, tente novamente.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !usuario) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert className="bg-red-50 border-red-200 mb-4">
        <AlertDescription className="text-red-600">{loadError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {saveSuccess && (
          <Alert className="bg-green-50 border-green-200 mb-4">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-600">Perfil atualizado com sucesso!</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col md:flex-row gap-6">
          <Card className="flex-1">
            <CardHeader>
              <CardTitle>Informações Pessoais</CardTitle>
              <CardDescription>Atualize suas informações pessoais</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col items-center mb-6">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={form.watch("perfil.foto")} alt={form.watch("nome")} />
                  <AvatarFallback className="text-2xl">
                    {form
                      .watch("nome")
                      ?.split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <FormField
                  control={form.control}
                  name="perfil.foto"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>URL da Foto</FormLabel>
                      <FormControl>
                        <Input placeholder="https://exemplo.com/foto.jpg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cpf"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF</FormLabel>
                    <FormControl>
                      <Input placeholder="000.000.000-00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perfil.telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(00) 00000-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="perfil.bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografia</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Conte um pouco sobre você" {...field} rows={4} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex-1 space-y-6">
            <Tabs defaultValue="endereco">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="endereco">Endereço</TabsTrigger>
                <TabsTrigger value="redes">Redes Sociais</TabsTrigger>
              </TabsList>
              <TabsContent value="endereco">
                <Card>
                  <CardHeader>
                    <CardTitle>Endereço</CardTitle>
                    <CardDescription>Atualize seu endereço</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="perfil.endereco.rua"
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
                        name="perfil.endereco.numero"
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
                      name="perfil.endereco.complemento"
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
                        name="perfil.endereco.bairro"
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
                        name="perfil.endereco.cidade"
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
                        name="perfil.endereco.estado"
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
                        name="perfil.endereco.cep"
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
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="redes">
                <Card>
                  <CardHeader>
                    <CardTitle>Redes Sociais</CardTitle>
                    <CardDescription>Conecte suas redes sociais</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="perfil.redesSociais.instagram"
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
                      name="perfil.redesSociais.facebook"
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

                    <FormField
                      control={form.control}
                      name="perfil.redesSociais.linkedin"
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
                      name="perfil.redesSociais.twitter"
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <Card>
              <CardHeader>
                <CardTitle>Preferências</CardTitle>
                <CardDescription>Configure suas preferências</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="perfil.preferencias.notificacoes"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Notificações</FormLabel>
                        <FormDescription>Receber notificações por email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="perfil.preferencias.temaEscuro"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Tema Escuro</FormLabel>
                        <FormDescription>Usar tema escuro por padrão</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="perfil.preferencias.idioma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Idioma</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="pt-BR">Português (Brasil)</SelectItem>
                          <SelectItem value="en-US">English (US)</SelectItem>
                          <SelectItem value="es">Español</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Alterações"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
