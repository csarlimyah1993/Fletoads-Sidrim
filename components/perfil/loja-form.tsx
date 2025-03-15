"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Upload, ImagePlus } from "lucide-react"
import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

// Schema de validação
const lojaFormSchema = z.object({
  nome: z.string().min(2, {
    message: "O nome da loja deve ter pelo menos 2 caracteres.",
  }),
  descricao: z.string().min(10, { message: "Descrição deve ter pelo menos 10 caracteres" }),
  logo: z.string().optional(),
  banner: z.string().optional(),
  endereco: z.object({
    rua: z.string().min(1, { message: "Rua é obrigatória" }),
    numero: z.string().min(1, { message: "Número é obrigatório" }),
    complemento: z.string().optional(),
    bairro: z.string().min(1, { message: "Bairro é obrigatório" }),
    cidade: z.string().min(1, { message: "Cidade é obrigatória" }),
    estado: z.string().min(1, { message: "Estado é obrigatório" }),
    cep: z.string().min(1, { message: "CEP é obrigatório" }),
  }),
  contato: z.object({
    telefone: z.string().min(1, { message: "Telefone é obrigatório" }),
    email: z.string().email({ message: "Email inválido" }),
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    facebook: z.string().optional(),
    site: z.string().optional(),
  }),
  categorias: z.array(z.string()).optional(),
  horarioFuncionamento: z
    .object({
      segunda: z.string().optional(),
      terca: z.string().optional(),
      quarta: z.string().optional(),
      quinta: z.string().optional(),
      sexta: z.string().optional(),
      sabado: z.string().optional(),
      domingo: z.string().optional(),
    })
    .optional(),
  status: z.enum(["ativo", "inativo", "pendente"]).optional(),
})

type LojaFormValues = z.infer<typeof lojaFormSchema>

interface LojaFormProps {
  initialData?: any
  loja?: any
  isEditing?: boolean
}

export function LojaPerfilForm({ initialData, loja, isEditing = false }: LojaFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  // Use initialData ou loja, o que estiver disponível
  const lojaData = initialData || loja || {}

  // Valores padrão para o formulário
  const defaultValues: Partial<LojaFormValues> = {
    nome: lojaData?.nome || "",
    descricao: lojaData?.descricao || "",
    logo: lojaData?.logo || "",
    banner: lojaData?.banner || "",
    endereco: {
      rua: lojaData?.endereco?.rua || "",
      numero: lojaData?.endereco?.numero || "",
      complemento: lojaData?.endereco?.complemento || "",
      bairro: lojaData?.endereco?.bairro || "",
      cidade: lojaData?.endereco?.cidade || "",
      estado: lojaData?.endereco?.estado || "",
      cep: lojaData?.endereco?.cep || "",
    },
    contato: {
      telefone: lojaData?.contato?.telefone || "",
      email: lojaData?.contato?.email || "",
      whatsapp: lojaData?.contato?.whatsapp || "",
      instagram: lojaData?.contato?.instagram || "",
      facebook: lojaData?.contato?.facebook || "",
      site: lojaData?.contato?.site || "",
    },
    categorias: lojaData?.categorias || [],
    horarioFuncionamento: {
      segunda: lojaData?.horarioFuncionamento?.segunda || "",
      terca: lojaData?.horarioFuncionamento?.terca || "",
      quarta: lojaData?.horarioFuncionamento?.quarta || "",
      quinta: lojaData?.horarioFuncionamento?.quinta || "",
      sexta: lojaData?.horarioFuncionamento?.sexta || "",
      sabado: lojaData?.horarioFuncionamento?.sabado || "",
      domingo: lojaData?.horarioFuncionamento?.domingo || "",
    },
    status: lojaData?.status || "pendente",
  }

  const form = useForm<LojaFormValues>({
    resolver: zodResolver(lojaFormSchema),
    defaultValues,
  })

  // Atualizar o formulário quando os dados mudarem
  useEffect(() => {
    if (lojaData && Object.keys(lojaData).length > 0) {
      form.reset({
        nome: lojaData?.nome || "",
        descricao: lojaData?.descricao || "",
        logo: lojaData?.logo || "",
        banner: lojaData?.banner || "",
        endereco: {
          rua: lojaData?.endereco?.rua || "",
          numero: lojaData?.endereco?.numero || "",
          complemento: lojaData?.endereco?.complemento || "",
          bairro: lojaData?.endereco?.bairro || "",
          cidade: lojaData?.endereco?.cidade || "",
          estado: lojaData?.endereco?.estado || "",
          cep: lojaData?.endereco?.cep || "",
        },
        contato: {
          telefone: lojaData?.contato?.telefone || "",
          email: lojaData?.contato?.email || "",
          whatsapp: lojaData?.contato?.whatsapp || "",
          instagram: lojaData?.contato?.instagram || "",
          facebook: lojaData?.contato?.facebook || "",
          site: lojaData?.contato?.site || "",
        },
        categorias: lojaData?.categorias || [],
        horarioFuncionamento: {
          segunda: lojaData?.horarioFuncionamento?.segunda || "",
          terca: lojaData?.horarioFuncionamento?.terca || "",
          quarta: lojaData?.horarioFuncionamento?.quarta || "",
          quinta: lojaData?.horarioFuncionamento?.quinta || "",
          sexta: lojaData?.horarioFuncionamento?.sexta || "",
          sabado: lojaData?.horarioFuncionamento?.sabado || "",
          domingo: lojaData?.horarioFuncionamento?.domingo || "",
        },
        status: lojaData?.status || "pendente",
      })
    }
  }, [lojaData, form])

  // Add this state for file uploads
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const bannerInputRef = useRef<HTMLInputElement>(null)

  // Add this function to handle file uploads
  async function handleFileUpload(file: File, fieldName: "logo" | "banner") {
    try {
      setUploading(true)
      setUploadError(null)

      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao fazer upload da imagem")
      }

      if (data.warning) {
        toast.warning(data.warning)
      }

      // Atualizar o campo do formulário com a URL da imagem
      form.setValue(fieldName, data.url)

      toast.success(`${fieldName === "logo" ? "Logo" : "Banner"} atualizado com sucesso!`)
    } catch (error) {
      console.error("Erro no upload:", error)
      setUploadError(error instanceof Error ? error.message : "Erro desconhecido no upload")
      toast.error(`Falha ao fazer upload: ${error instanceof Error ? error.message : "Erro desconhecido"}`)
    } finally {
      setUploading(false)
    }
  }

  const onSubmit = async (data: LojaFormValues) => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/loja/perfil", {
        method: "PUT", // Alterado para PUT para atualizar
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao salvar dados da loja")
      }

      toast.success("Dados da loja salvos com sucesso!")
      router.refresh()

      if (!isEditing) {
        router.push("/dashboard/perfil")
      }
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
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Imagens</h3>
            <p className="text-sm text-gray-500">Personalize sua loja com imagens de logo e banner.</p>
          </div>

          <div className="flex items-center gap-4 mb-6">
            <div
              className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 cursor-pointer relative"
              onClick={() => logoInputRef.current?.click()}
            >
              {form.watch("logo") ? (
                <img
                  src={form.watch("logo") || "/placeholder.svg"}
                  alt="Logo da loja"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImagePlus size={24} />
                  <span className="text-xs mt-1">Logo</span>
                </div>
              )}
              <input
                type="file"
                ref={logoInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file, "logo")
                  }
                }}
              />
            </div>
            <FormField
              control={form.control}
              name="logo"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Logo da Loja</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="URL do logo" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex flex-col items-center mb-6">
            <div
              className="w-full h-40 bg-gray-100 dark:bg-gray-800 rounded-lg mb-4 overflow-hidden cursor-pointer relative"
              onClick={() => bannerInputRef.current?.click()}
            >
              {form.watch("banner") ? (
                <img
                  src={form.watch("banner") || "/placeholder.svg"}
                  alt="Banner da loja"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                  <ImagePlus size={32} />
                  <span className="mt-2">Clique para adicionar um banner</span>
                </div>
              )}
              <input
                type="file"
                ref={bannerInputRef}
                className="hidden"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) {
                    handleFileUpload(file, "banner")
                  }
                }}
              />
            </div>
            <FormField
              control={form.control}
              name="banner"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Banner da Loja</FormLabel>
                  <div className="flex gap-2">
                    <FormControl>
                      <Input placeholder="URL do banner" {...field} />
                    </FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => bannerInputRef.current?.click()}
                      disabled={uploading}
                    >
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Informações de Contato</h3>
            <p className="text-sm text-gray-500">Como seus clientes podem entrar em contato com você.</p>
          </div>

          <FormField
            control={form.control}
            name="contato.telefone"
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
            name="contato.email"
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
            name="contato.whatsapp"
            render={({ field }) => (
              <FormItem>
                <FormLabel>WhatsApp</FormLabel>
                <FormControl>
                  <Input placeholder="WhatsApp para contato" {...field} />
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
                  <Input placeholder="https://www.seusiteaqui.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Endereço</h3>
            <p className="text-sm text-gray-500">Localização da sua loja.</p>
          </div>

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

          <div className="grid grid-cols-2 gap-4">
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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

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

        {uploadError && (
          <Alert variant="destructive" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{uploadError}</AlertDescription>
          </Alert>
        )}

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

