"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/components/ui/use-toast"
import { LojaTags } from "@/components/perfil/loja-tags"
import { Loader2, Store, Image, Info, Tag, Share2 } from "lucide-react"

const lojaFormSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  descricao: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
  endereco: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional().or(z.literal("")),
  website: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  horarioFuncionamento: z.string().optional(),
  dataFundacao: z.string().optional(),
  numeroFuncionarios: z.coerce.number().optional(),
  tags: z.array(z.string()).optional(),
  redesSociais: z
    .object({
      facebook: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
      instagram: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
      twitter: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
      linkedin: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
      youtube: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
    })
    .optional(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

interface LojaPerfilFormProps {
  loja?: any
  isEditing?: boolean
}

export function LojaPerfilForm({ loja }: LojaPerfilFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<LojaFormValues> = {
    nome: loja?.nome || "",
    descricao: loja?.descricao || "",
    logo: loja?.logo || "",
    banner: loja?.banner || "",
    endereco: loja?.endereco || "",
    telefone: loja?.telefone || "",
    email: loja?.email || "",
    website: loja?.website || "",
    horarioFuncionamento: loja?.horarioFuncionamento || "",
    dataFundacao: loja?.dataFundacao || "",
    numeroFuncionarios: loja?.numeroFuncionarios || undefined,
    tags: loja?.tags || [],
    redesSociais: {
      facebook: loja?.redesSociais?.facebook || "",
      instagram: loja?.redesSociais?.instagram || "",
      twitter: loja?.redesSociais?.twitter || "",
      linkedin: loja?.redesSociais?.linkedin || "",
      youtube: loja?.redesSociais?.youtube || "",
    },
  }

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues,
  })

  const onSubmit = async (data: LojaFormValues) => {
    try {
      setIsSubmitting(true)
      const response = await fetch("/api/loja/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao salvar perfil da loja")
      }

      toast({
        title: "Sucesso",
        description: loja ? "Perfil da loja atualizado com sucesso!" : "Perfil da loja criado com sucesso!",
      })

      router.push("/perfil-da-loja")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar perfil da loja:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar perfil da loja",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleTagsChange = (tags: string[]) => {
    form.setValue("tags", tags)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Tabs defaultValue="informacoes" className="w-full">
          <TabsList className="grid grid-cols-4 mb-6">
            <TabsTrigger value="informacoes" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Informações</span>
            </TabsTrigger>
            <TabsTrigger value="imagens" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              <span>Imagens</span>
            </TabsTrigger>
            <TabsTrigger value="caracteristicas" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Características</span>
            </TabsTrigger>
            <TabsTrigger value="redes-sociais" className="flex items-center gap-2">
              <Share2 className="h-4 w-4" />
              <span>Redes Sociais</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="informacoes">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Store className="h-5 w-5" />
                  Informações da Loja
                </CardTitle>
                <CardDescription>Preencha as informações básicas da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                        <Textarea
                          placeholder="Descreva sua loja em poucas palavras"
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="endereco"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Endereço</FormLabel>
                        <FormControl>
                          <Input placeholder="Endereço completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="telefone"
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
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
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
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Website</FormLabel>
                        <FormControl>
                          <Input placeholder="https://www.sualoja.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="horarioFuncionamento"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Horário de Funcionamento</FormLabel>
                        <FormControl>
                          <Input placeholder="Seg-Sex: 9h às 18h" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dataFundacao"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Fundação</FormLabel>
                        <FormControl>
                          <Input placeholder="01/01/2020" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="numeroFuncionarios"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número de Funcionários</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="10" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="imagens">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="h-5 w-5" />
                  Imagens da Loja
                </CardTitle>
                <CardDescription>Adicione o logo e banner da sua loja</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                          tipo="logo"
                          className="mx-auto w-full max-w-[200px]"
                        />
                      </FormControl>
                      <FormDescription>Recomendado: 200x200px, formato quadrado</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="banner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Banner</FormLabel>
                      <FormControl>
                        <ImageUpload
                          value={field.value || ""}
                          onChange={field.onChange}
                          tipo="banner"
                          className="mx-auto w-full"
                        />
                      </FormControl>
                      <FormDescription>Recomendado: 1200x400px, formato retangular</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="caracteristicas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Características da Loja
                </CardTitle>
                <CardDescription>Selecione as características disponíveis na sua loja</CardDescription>
              </CardHeader>
              <CardContent>
                <LojaTags initialTags={form.getValues("tags") || []} onTagsChange={handleTagsChange} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="redes-sociais">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Redes Sociais
                </CardTitle>
                <CardDescription>Adicione os links das suas redes sociais</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
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
                  name="redesSociais.youtube"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>YouTube</FormLabel>
                      <FormControl>
                        <Input placeholder="https://youtube.com/c/sualoja" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/perfil-da-loja")}
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
            ) : (
              "Salvar"
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

