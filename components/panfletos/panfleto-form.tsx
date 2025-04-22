"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/ui/image-upload"

// Define the form schema with zod
const panfletoSchema = z.object({
  titulo: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  descricao: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  conteudo: z.string().min(10, { message: "O conteúdo deve ter pelo menos 10 caracteres" }),
  imagem: z.string().min(1, { message: "A imagem é obrigatória" }),
  categoria: z.string().min(1, { message: "A categoria é obrigatória" }),
  tags: z.string().optional(),
  preco: z.coerce.number().min(0).optional(),
  precoPromocional: z.coerce.number().min(0).optional(),
  tipo: z.enum(["ativo", "programado", "hotpromo", "evento"]).default("ativo"),
  status: z.enum(["draft", "active", "inactive", "scheduled"]).default("active"),
  dataInicio: z.date().optional(),
  dataFim: z.date().optional(),
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
  botaoAcao: z.string().optional(),
  botaoLink: z.string().url().optional().or(z.literal("")),
  codigo: z.string().optional(),
  eventoId: z.string().optional(), // Add eventoId to the schema
})

type PanfletoFormValues = z.infer<typeof panfletoSchema>

interface PanfletoFormProps {
  panfleto?: any
  eventoId?: string
}

export function PanfletoForm({ panfleto, eventoId }: PanfletoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // Prepare default values
  const defaultValues: Partial<PanfletoFormValues> = {
    titulo: panfleto?.titulo || "",
    descricao: panfleto?.descricao || "",
    conteudo: panfleto?.conteudo || "",
    imagem: panfleto?.imagem || "",
    categoria: panfleto?.categoria || "",
    tags: panfleto?.tags?.join(", ") || "",
    preco: panfleto?.preco || 0,
    precoPromocional: panfleto?.precoPromocional || undefined,
    tipo: panfleto?.tipo || (eventoId ? "evento" : "ativo"),
    status: panfleto?.status || "active",
    dataInicio: panfleto?.dataInicio ? new Date(panfleto.dataInicio) : undefined,
    dataFim: panfleto?.dataFim ? new Date(panfleto.dataFim) : undefined,
    ativo: panfleto?.ativo !== undefined ? panfleto.ativo : true,
    destaque: panfleto?.destaque || false,
    botaoAcao: panfleto?.botaoAcao || "",
    botaoLink: panfleto?.botaoLink || "",
    codigo: panfleto?.codigo || "",
    eventoId: eventoId, // Set the eventoId
  }

  // Initialize form
  const form = useForm<PanfletoFormValues>({
    resolver: zodResolver(panfletoSchema),
    defaultValues,
  })

  // Handle form submission
  async function onSubmit(data: PanfletoFormValues) {
    setIsSubmitting(true)
    try {
      // Convert tags from string to array
      const formData = {
        ...data,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
      }

      const url = panfleto?._id ? `/api/panfletos/${panfleto._id}` : "/api/panfletos"
      const method = panfleto?._id ? "PUT" : "POST"

      console.log("Enviando dados para:", url, "Método:", method, "Dados:", JSON.stringify(formData))

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        let errorData
        try {
          errorData = await response.json()
        } catch (jsonError) {
          console.error("Erro ao parsear JSON:", jsonError)
          errorData = { error: `Falha ao salvar panfleto: ${response.statusText}` }
        }
        console.error("Erro na resposta:", errorData)
        throw new Error(errorData.error || `Falha ao salvar panfleto: ${response.statusText}`)
      }

      toast({
        title: panfleto?._id ? "Panfleto atualizado!" : "Panfleto criado!",
        description: "O panfleto foi salvo com sucesso.",
      })

      router.push("/dashboard/panfletos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar panfleto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao salvar o panfleto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="titulo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título*</FormLabel>
                  <FormControl>
                    <Input placeholder="Título do panfleto" {...field} />
                  </FormControl>
                  <FormDescription>O título que será exibido no panfleto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição*</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descrição do panfleto" {...field} />
                  </FormControl>
                  <FormDescription>Uma breve descrição do panfleto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="conteudo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo*</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Conteúdo detalhado do panfleto" className="min-h-[150px]" {...field} />
                  </FormControl>
                  <FormDescription>O conteúdo completo do panfleto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoria"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria*</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="alimentos">Alimentos</SelectItem>
                      <SelectItem value="bebidas">Bebidas</SelectItem>
                      <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                      <SelectItem value="moda">Moda</SelectItem>
                      <SelectItem value="casa">Casa e Decoração</SelectItem>
                      <SelectItem value="saude">Saúde e Beleza</SelectItem>
                      <SelectItem value="servicos">Serviços</SelectItem>
                      <SelectItem value="outros">Outros</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>A categoria do panfleto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="Tags separadas por vírgula" {...field} />
                  </FormControl>
                  <FormDescription>Tags para ajudar na busca (ex: promoção, desconto, verão)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Imagem</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="imagem"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Imagem do Panfleto*</FormLabel>
                  <FormControl>
                    <ImageUpload value={field.value} onChange={field.onChange} onRemove={() => field.onChange("")} />
                  </FormControl>
                  <FormDescription>A imagem principal do panfleto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preços</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="preco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Original</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" min="0" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormDescription>Preço original do produto</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="precoPromocional"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço Promocional</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={field.value === undefined ? "" : field.value}
                        onChange={(e) =>
                          field.onChange(e.target.value === "" ? undefined : Number.parseFloat(e.target.value))
                        }
                      />
                    </FormControl>
                    <FormDescription>Preço promocional (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="tipo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Panfleto</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="programado">Programado</SelectItem>
                      <SelectItem value="hotpromo">Hotpromo</SelectItem>
                      <SelectItem value="evento">Evento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>O tipo de panfleto determina como ele será exibido</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>O status atual do panfleto</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="botaoAcao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Botão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Comprar Agora" {...field} />
                    </FormControl>
                    <FormDescription>Texto para o botão de ação (opcional)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="botaoLink"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link do Botão</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormDescription>URL para onde o botão irá direcionar</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Ativo</FormLabel>
                      <FormDescription>Panfletos ativos são exibidos na vitrine</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="destaque"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Destaque</FormLabel>
                      <FormDescription>Panfletos em destaque aparecem no topo da vitrine</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <CardFooter className="flex justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/panfletos")}
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
            ) : panfleto ? (
              "Atualizar Panfleto"
            ) : (
              "Criar Panfleto"
            )}
          </Button>
        </CardFooter>
      </form>
    </Form>
  )
}
