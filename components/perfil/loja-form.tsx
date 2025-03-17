"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ImageUpload } from "@/components/ui/image-upload-with-fallback"
import { Card, CardContent } from "@/components/ui/card"

// Schema de validação
const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().optional().nullable(),
  cnpj: z.string().optional().nullable(),
  endereco: z.object({
    rua: z.string().min(1, { message: "Rua é obrigatória" }),
    numero: z.string().min(1, { message: "Número é obrigatório" }),
    complemento: z.string().optional().nullable(),
    bairro: z.string().min(1, { message: "Bairro é obrigatório" }),
    cidade: z.string().min(1, { message: "Cidade é obrigatória" }),
    estado: z.string().min(1, { message: "Estado é obrigatório" }),
    cep: z.string().min(1, { message: "CEP é obrigatório" }),
  }),
  contato: z.object({
    telefone: z.string().min(1, { message: "Telefone é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }).min(1, { message: "Email é obrigatório" }),
    whatsapp: z.string().optional().nullable(),
    instagram: z.string().optional().nullable(),
    facebook: z.string().optional().nullable(),
    site: z.string().optional().nullable(),
  }),
  logoUrl: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  categorias: z.array(z.string()).optional().nullable(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

interface LojaFormProps {
  loja?: any
  isEditing?: boolean
}

export function LojaPerfilForm({ loja, isEditing = false }: LojaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formInitialized, setFormInitialized] = useState(false)

  // Ensure all form fields have defined initial values
  const defaultValues: LojaFormValues = {
    nome: "",
    descricao: "",
    cnpj: "",
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
      instagram: "",
      facebook: "",
      site: "",
    },
    logoUrl: "",
    bannerUrl: "",
    categorias: [],
  }

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues,
  })

  // Initialize form with loja data if available
  useEffect(() => {
    if (loja && !formInitialized) {
      console.log("Initializing form with loja data:", loja)

      // Make sure we're handling all fields properly
      form.reset({
        nome: loja.nome || "",
        descricao: loja.descricao || "",
        cnpj: loja.cnpj || "",
        endereco: {
          rua: loja.endereco?.rua || "",
          numero: loja.endereco?.numero || "",
          complemento: loja.endereco?.complemento || "",
          bairro: loja.endereco?.bairro || "",
          cidade: loja.endereco?.cidade || "",
          estado: loja.endereco?.estado || "",
          cep: loja.endereco?.cep || "",
        },
        contato: {
          telefone: loja.contato?.telefone || "",
          email: loja.contato?.email || "",
          whatsapp: loja.contato?.whatsapp || "",
          instagram: loja.contato?.instagram || "",
          facebook: loja.contato?.facebook || "",
          site: loja.contato?.site || "",
        },
        logoUrl: loja.logo || "",
        bannerUrl: loja.banner || "",
        categorias: loja.categorias || [],
      })

      setFormInitialized(true)
    }
  }, [loja, form, formInitialized])

  const onSubmit = async (data: LojaFormValues) => {
    console.log("Form submitted with data:", data)
    setIsLoading(true)

    try {
      // Prepare data for API
      const apiData = {
        nome: data.nome,
        descricao: data.descricao || "",
        cnpj: data.cnpj || "",
        logo: data.logoUrl || "",
        banner: data.bannerUrl || "",
        endereco: {
          rua: data.endereco.rua || "",
          numero: data.endereco.numero || "",
          complemento: data.endereco.complemento || "",
          bairro: data.endereco.bairro || "",
          cidade: data.endereco.cidade || "",
          estado: data.endereco.estado || "",
          cep: data.endereco.cep || "",
        },
        contato: {
          telefone: data.contato.telefone || "",
          email: data.contato.email || "",
          whatsapp: data.contato.whatsapp || "",
          instagram: data.contato.instagram || "",
          facebook: data.contato.facebook || "",
          site: data.contato.site || "",
        },
        categorias: data.categorias || [],
      }

      console.log("Sending data to API:", apiData)

      const response = await fetch("/api/loja/perfil", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiData),
      })

      const responseText = await response.text()
      let responseData

      try {
        responseData = JSON.parse(responseText)
      } catch (e) {
        console.error("Failed to parse response as JSON:", responseText)
        throw new Error("Resposta inválida do servidor")
      }

      if (!response.ok) {
        throw new Error(responseData.error || "Erro ao salvar dados da loja")
      }

      console.log("API response:", responseData)
      toast.success("Dados da loja salvos com sucesso!")

      // Wait a moment to ensure data is saved
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Force a refresh to ensure the profile page gets the latest data
      router.refresh()

      // Redirect to profile page
      router.push("/dashboard/perfil")
    } catch (error) {
      console.error("Erro ao salvar dados da loja:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao salvar dados da loja")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-6">
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
                  <Input placeholder="Nome da sua loja" {...field} value={field.value || ""} />
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

          <FormField
            control={form.control}
            name="cnpj"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CNPJ</FormLabel>
                <FormControl>
                  <Input placeholder="00.000.000/0001-00 (opcional)" {...field} value={field.value || ""} />
                </FormControl>
                <FormDescription>CNPJ da sua empresa (opcional).</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
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
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Endereço</h3>
              <p className="text-sm text-gray-500">Localização da sua loja.</p>
            </div>

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

              <FormField
                control={form.control}
                name="endereco.complemento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Complemento</FormLabel>
                    <FormControl>
                      <Input placeholder="Complemento (opcional)" {...field} value={field.value || ""} />
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
                      <Input placeholder="CEP" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium">Informações de Contato</h3>
              <p className="text-sm text-gray-500">Como seus clientes podem entrar em contato com você.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="contato.telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="Telefone para contato" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email para contato" {...field} value={field.value || ""} />
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
                      <Input placeholder="WhatsApp (opcional)" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato.instagram"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instagram</FormLabel>
                    <FormControl>
                      <Input placeholder="Instagram (opcional)" {...field} value={field.value || ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contato.facebook"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Facebook</FormLabel>
                    <FormControl>
                      <Input placeholder="Facebook (opcional)" {...field} value={field.value || ""} />
                    </FormControl>
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
                      <Input
                        placeholder="https://www.seusiteaqui.com (opcional)"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.push("/dashboard/perfil")} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
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

