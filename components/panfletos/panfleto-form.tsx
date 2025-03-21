"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MultipleImageUpload } from "../multiple-image-upload"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save } from "lucide-react"
import { Switch } from "@/components/ui/switch"

const panfletoFormSchema = z.object({
  title: z.string().min(3, {
    message: "O título deve ter pelo menos 3 caracteres.",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres.",
  }),
  content: z.string().optional(),
  images: z
    .array(z.string())
    .min(1, {
      message: "Adicione pelo menos uma imagem.",
    })
    .max(5, {
      message: "Você pode adicionar no máximo 5 imagens.",
    }),
  status: z.enum(["draft", "published"]),
})

type PanfletoFormValues = z.infer<typeof panfletoFormSchema>

interface PanfletoFormProps {
  panfleto?: any
}

export function PanfletoForm({ panfleto }: PanfletoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const defaultValues: Partial<PanfletoFormValues> = {
    title: panfleto?.title || "",
    description: panfleto?.description || "",
    content: panfleto?.content || "",
    images: panfleto?.images || [],
    status: panfleto?.status || "draft",
  }

  const form = useForm<PanfletoFormValues>({
    resolver: zodResolver(panfletoFormSchema),
    defaultValues,
  })

  async function onSubmit(data: PanfletoFormValues) {
    setIsSubmitting(true)
    try {
      const url = panfleto ? `/api/panfletos/${panfleto._id}` : "/api/panfletos"

      const method = panfleto ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar panfleto")
      }

      toast({
        title: panfleto ? "Panfleto atualizado" : "Panfleto criado",
        description: panfleto ? "Seu panfleto foi atualizado com sucesso." : "Seu panfleto foi criado com sucesso.",
      })

      router.push("/panfletos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao salvar panfleto:", error)
      toast({
        title: "Erro",
        description: "Não foi possível salvar o panfleto. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Panfleto</CardTitle>
            <CardDescription>Preencha as informações básicas do seu panfleto digital.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite o título do panfleto" {...field} />
                  </FormControl>
                  <FormDescription>Um título atrativo aumenta as chances de conversão.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Digite uma breve descrição do panfleto" {...field} rows={3} />
                  </FormControl>
                  <FormDescription>Uma descrição clara ajuda seus clientes a entenderem sua oferta.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Tabs defaultValue="images" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="images">Imagens</TabsTrigger>
            <TabsTrigger value="content">Conteúdo</TabsTrigger>
          </TabsList>
          <TabsContent value="images" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Imagens do Panfleto</CardTitle>
                <CardDescription>
                  Adicione até 5 imagens para o seu panfleto. A primeira imagem será usada como capa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="images"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <MultipleImageUpload value={field.value} onChange={field.onChange} maxImages={5} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="content" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Conteúdo do Panfleto</CardTitle>
                <CardDescription>Adicione o conteúdo detalhado do seu panfleto.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea placeholder="Digite o conteúdo detalhado do panfleto" {...field} rows={10} />
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
            <CardTitle>Publicação</CardTitle>
            <CardDescription>Defina se o panfleto será publicado ou salvo como rascunho.</CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Publicar panfleto</FormLabel>
                    <FormDescription>
                      {field.value === "published"
                        ? "Seu panfleto estará visível para o público."
                        : "Seu panfleto será salvo como rascunho."}
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value === "published"}
                      onCheckedChange={(checked) => field.onChange(checked ? "published" : "draft")}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push("/panfletos")} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Panfleto
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  )
}

