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
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

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
  horarioFuncionamento: z.object({
    segunda: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
    terca: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
    quarta: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
    quinta: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
    sexta: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
    sabado: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
    domingo: z.object({
      abertura: z.string(),
      fechamento: z.string(),
      open: z.boolean(),
    }),
  }),
  configuracoes: z.object({
    mostrarHorarios: z.boolean().default(true),
    mostrarEndereco: z.boolean().default(true),
    mostrarContatos: z.boolean().default(true),
    permitirComentarios: z.boolean().default(true),
  }),
  logo: z.string().optional(),
  banner: z.string().optional(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

export function LojaForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues: {
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
      horarioFuncionamento: {
        segunda: { abertura: "08:00", fechamento: "18:00", open: true },
        terca: { abertura: "08:00", fechamento: "18:00", open: true },
        quarta: { abertura: "08:00", fechamento: "18:00", open: true },
        quinta: { abertura: "08:00", fechamento: "18:00", open: true },
        sexta: { abertura: "08:00", fechamento: "18:00", open: true },
        sabado: { abertura: "08:00", fechamento: "18:00", open: true },
        domingo: { abertura: "08:00", fechamento: "18:00", open: false },
      },
      configuracoes: {
        mostrarHorarios: true,
        mostrarEndereco: true,
        mostrarContatos: true,
        permitirComentarios: true,
      },
      logo: "",
      banner: "",
    },
  })

  // Buscar dados da loja ao carregar o componente
  useEffect(() => {
    const fetchLojaData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/loja/perfil")

        if (!response.ok) {
          if (response.status === 404) {
            // Loja não encontrada, usar valores padrão
            setIsLoading(false)
            return
          }
          throw new Error("Erro ao buscar dados da loja")
        }

        const data = await response.json()

        if (data.loja) {
          // Preencher o formulário com os dados da loja
          form.reset({
            nome: data.loja.nome || "",
            descricao: data.loja.descricao || "",
            logo: data.loja.logo || "",
            banner: data.loja.banner || "",
            endereco: {
              rua: data.loja.endereco?.rua || "",
              numero: data.loja.endereco?.numero || "",
              complemento: data.loja.endereco?.complemento || "",
              bairro: data.loja.endereco?.bairro || "",
              cidade: data.loja.endereco?.cidade || "",
              estado: data.loja.endereco?.estado || "",
              cep: data.loja.endereco?.cep || "",
            },
            contato: {
              telefone: data.loja.contato?.telefone || "",
              email: data.loja.contato?.email || "",
              whatsapp: data.loja.contato?.whatsapp || "",
              site: data.loja.contato?.site || "",
            },
            redesSociais: {
              instagram: data.loja.redesSociais?.instagram || "",
              facebook: data.loja.redesSociais?.facebook || "",
              twitter: data.loja.redesSociais?.twitter || "",
              youtube: data.loja.redesSociais?.youtube || "",
              linkedin: data.loja.redesSociais?.linkedin || "",
            },
            horarioFuncionamento: data.loja.horarioFuncionamento || {
              segunda: { abertura: "08:00", fechamento: "18:00", open: true },
              terca: { abertura: "08:00", fechamento: "18:00", open: true },
              quarta: { abertura: "08:00", fechamento: "18:00", open: true },
              quinta: { abertura: "08:00", fechamento: "18:00", open: true },
              sexta: { abertura: "08:00", fechamento: "18:00", open: true },
              sabado: { abertura: "08:00", fechamento: "18:00", open: true },
              domingo: { abertura: "08:00", fechamento: "18:00", open: false },
            },
            configuracoes: data.loja.configuracoes || {
              mostrarHorarios: true,
              mostrarEndereco: true,
              mostrarContatos: true,
              permitirComentarios: true,
            },
          })
        }
      } catch (error) {
        console.error("Erro ao buscar dados da loja:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados da loja. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchLojaData()
  }, [form, toast])

  // Função para lidar com o envio do formulário
  const onSubmit = async (values: LojaFormValues) => {
    try {
      setIsSubmitting(true)

      const response = await fetch("/api/loja/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar dados da loja")
      }

      toast({
        title: "Sucesso",
        description: "Dados da loja salvos com sucesso!",
      })

      // Redirecionar para a página de perfil
      router.push("/dashboard/perfil-da-loja")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar dados da loja:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar os dados da loja. Tente novamente mais tarde.",
        variant: "destructive",
      })
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
                <TabsTrigger value="horarios">Horários</TabsTrigger>
                <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
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

              {/* Outras abas do formulário... */}
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-end">
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
