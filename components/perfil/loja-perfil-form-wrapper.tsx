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
import { toast } from "sonner"
import { Loader2, MapPin } from "lucide-react"

const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional(),
  endereco: z.object({
    rua: z.string().min(1, { message: "A rua é obrigatória." }),
    numero: z.string().min(1, { message: "O número é obrigatório." }),
    complemento: z.string().optional(),
    bairro: z.string().min(1, { message: "O bairro é obrigatório." }),
    cidade: z.string().min(1, { message: "A cidade é obrigatória." }),
    estado: z.string().min(1, { message: "O estado é obrigatório." }),
    cep: z.string().min(1, { message: "O CEP é obrigatório." }),
    latitude: z.string().optional(),
    longitude: z.string().optional(),
  }),
  contato: z.object({
    telefone: z.string().min(1, { message: "O telefone é obrigatório." }),
    email: z.string().email({ message: "Email inválido." }),
    whatsapp: z.string().optional(),
    site: z.string().optional(),
  }),
  redesSociais: z.object({
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    twitter: z.string().optional(),
    youtube: z.string().optional(),
    linkedin: z.string().optional(),
  }),
  logo: z.string().optional(),
  banner: z.string().optional(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

interface LojaPerfilFormWrapperProps {
  lojaId: string
  initialValues?: {
    nomeLoja?: string
    descricao?: string
    logoUrl?: string
    bannerUrl?: string
  }
}

export default function LojaPerfilFormWrapper({ lojaId, initialValues }: LojaPerfilFormWrapperProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

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
    },
  })

  // Buscar dados completos da loja
  useEffect(() => {
    const fetchLojaData = async () => {
      try {
        setIsLoading(true)
        console.log(`Buscando dados da loja com ID: ${lojaId}`)
        const response = await fetch(`/api/lojas/${lojaId}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados da loja: ${response.status}`)
        }

        const data = await response.json()
        console.log("Dados da loja recebidos:", data)

        // Garantir que todos os objetos aninhados existam
        const loja = {
          ...data,
          endereco: data.endereco || {},
          contato: data.contato || {},
          redesSociais: data.redesSociais || {},
        }

        console.log("Preenchendo formulário com dados:", loja)

        // Preencher o formulário com os dados da loja
        form.reset({
          nome: loja.nome || initialValues?.nomeLoja || "",
          descricao: loja.descricao || initialValues?.descricao || "",
          logo: loja.logo || initialValues?.logoUrl || "",
          banner: loja.banner || initialValues?.bannerUrl || "",
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
            telefone: loja.contato?.telefone || "",
            email: loja.contato?.email || "",
            whatsapp: loja.contato?.whatsapp || "",
            site: loja.contato?.site || "",
          },
          redesSociais: {
            instagram: loja.redesSociais?.instagram || "",
            facebook: loja.redesSociais?.facebook || "",
            twitter: loja.redesSociais?.twitter || "",
            youtube: loja.redesSociais?.youtube || "",
            linkedin: loja.redesSociais?.linkedin || "",
          },
        })

        console.log("Formulário preenchido com sucesso")
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
        toast.error("Não foi possível carregar os dados da loja. Tente novamente mais tarde.")
      } finally {
        setIsLoading(false)
      }
    }

    if (lojaId) {
      fetchLojaData()
    }
  }, [lojaId, form, initialValues])

  // Função para atualizar as coordenadas no formulário
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
      console.log("Enviando dados da loja:", values)

      const response = await fetch(`/api/lojas/${lojaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar dados da loja")
      }

      toast.success("Dados da loja salvos com sucesso!")
      console.log("Loja atualizada com sucesso")

      // Redirecionar para a página de perfil
      router.push("/dashboard/perfil-da-loja")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar dados da loja:", error)
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar os dados da loja. Tente novamente mais tarde.",
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Carregando dados da loja...</span>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Perfil da Loja</CardTitle>
            <CardDescription>Configure as informações da sua loja que serão exibidas para os clientes.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="informacoes">
              <TabsList className="mb-6">
                <TabsTrigger value="informacoes">Informações Básicas</TabsTrigger>
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
                            <ImageUpload value={field.value || ""} onChange={field.onChange} />
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
                            <ImageUpload value={field.value || ""} onChange={field.onChange} />
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

                  <p className="text-xs text-muted-foreground mt-2">
                    As coordenadas geográficas serão salvas automaticamente quando você ajustar a localização no mapa.
                  </p>
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
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}
