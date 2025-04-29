"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"
import { toast } from "@/hooks/use-toast"

// Esquema de validação com Zod
const panfletoFormSchema = z.object({
  titulo: z.string().min(3, { message: "O título deve ter pelo menos 3 caracteres" }),
  descricao: z.string().min(10, { message: "A descrição deve ter pelo menos 10 caracteres" }),
  conteudo: z.string().min(20, { message: "O conteúdo deve ter pelo menos 20 caracteres" }),
  imagem: z.string().min(1, { message: "A imagem é obrigatória" }),
  categoria: z.string().min(1, { message: "A categoria é obrigatória" }),
  tags: z.string().optional(),
  preco: z.string().optional(),
  precoPromocional: z.string().optional(),
  tipo: z.string().default("ativo"),
  status: z.string().default("active"),
  dataInicio: z.date().optional().nullable(),
  dataFim: z.date().optional().nullable(),
  ativo: z.boolean().default(true),
  destaque: z.boolean().default(false),
  botaoAcao: z.string().optional(),
  botaoLink: z.string().optional(),
  codigo: z.string().optional(),
})

type PanfletoFormValues = z.infer<typeof panfletoFormSchema>

interface PanfletoFormProps {
  panfleto?: any
  lojaId: string
}

export function PanfletoForm({ panfleto, lojaId }: PanfletoFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Valores padrão para o formulário
  const defaultValues: Partial<PanfletoFormValues> = {
    titulo: panfleto?.titulo || "",
    descricao: panfleto?.descricao || "",
    conteudo: panfleto?.conteudo || "",
    imagem: panfleto?.imagem || "",
    categoria: panfleto?.categoria || "",
    tags: panfleto?.tags?.join(", ") || "",
    preco: panfleto?.preco?.toString() || "",
    precoPromocional: panfleto?.precoPromocional?.toString() || "",
    tipo: panfleto?.tipo || "ativo",
    status: panfleto?.status || "active",
    dataInicio: panfleto?.dataInicio ? new Date(panfleto.dataInicio) : null,
    dataFim: panfleto?.dataFim ? new Date(panfleto.dataFim) : null,
    ativo: panfleto?.ativo !== undefined ? panfleto.ativo : true,
    destaque: panfleto?.destaque || false,
    botaoAcao: panfleto?.botaoAcao || "",
    botaoLink: panfleto?.botaoLink || "",
    codigo: panfleto?.codigo || "",
  }

  // Inicializar o formulário
  const form = useForm<PanfletoFormValues>({
    resolver: zodResolver(panfletoFormSchema),
    defaultValues,
  })

  // Função para lidar com o envio do formulário
  const onSubmit = async (data: PanfletoFormValues) => {
    try {
      setIsSubmitting(true)

      // Preparar os dados para envio
      const formattedData = {
        ...data,
        lojaId,
        tags: data.tags ? data.tags.split(",").map((tag) => tag.trim()) : [],
        preco: data.preco ? Number.parseFloat(data.preco) : undefined,
        precoPromocional: data.precoPromocional ? Number.parseFloat(data.precoPromocional) : undefined,
      }

      // Determinar se é uma criação ou atualização
      const url = panfleto?._id ? `/api/panfletos/${panfleto._id}` : "/api/panfletos"

      const method = panfleto?._id ? "PUT" : "POST"

      // Enviar os dados para a API
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formattedData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Erro ao salvar o panfleto")
      }

      // Mostrar mensagem de sucesso
      toast({
        title: panfleto?._id ? "Panfleto atualizado" : "Panfleto criado",
        description: panfleto?._id ? "O panfleto foi atualizado com sucesso." : "O panfleto foi criado com sucesso.",
      })

      // Redirecionar para a página de detalhes ou lista
      if (panfleto?._id) {
        router.refresh()
      } else {
        router.push("/dashboard/panfletos")
      }
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

  // Modifique a função handleImageUpload para aceitar string ou string[]
  // Substitua a função atual:

  const handleImageUpload = (value: string | string[]) => {
    // Como nosso campo imagem espera uma string, pegamos apenas a primeira imagem se for um array
    const imageUrl = Array.isArray(value) ? value[0] : value
    form.setValue("imagem", imageUrl, { shouldValidate: true })
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{panfleto?._id ? "Editar Panfleto" : "Criar Novo Panfleto"}</CardTitle>
        <CardDescription>
          {panfleto?._id
            ? "Atualize as informações do seu panfleto"
            : "Preencha os campos abaixo para criar um novo panfleto"}
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            {/* Seção de informações básicas */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Informações Básicas</h3>

              <FormField
                control={form.control}
                name="titulo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Título</FormLabel>
                    <FormControl>
                      <Input placeholder="Digite o título do panfleto" {...field} />
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
                      <Textarea placeholder="Digite uma breve descrição do panfleto" {...field} rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="conteudo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Conteúdo</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Digite o conteúdo detalhado do panfleto" {...field} rows={5} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="imagem"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imagem</FormLabel>
                    <FormControl>
                      <div className="space-y-2">
                        <ImageUpload
                          value={field.value}
                          onChange={handleImageUpload}
                          onRemove={() => form.setValue("imagem", "", { shouldValidate: true })}
                        />
                        {!field.value && <Input placeholder="URL da imagem" {...field} />}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de categorização */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Categorização</h3>

              <FormField
                control={form.control}
                name="categoria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="alimentos">Alimentos</SelectItem>
                        <SelectItem value="vestuario">Vestuário</SelectItem>
                        <SelectItem value="eletronicos">Eletrônicos</SelectItem>
                        <SelectItem value="moveis">Móveis</SelectItem>
                        <SelectItem value="servicos">Serviços</SelectItem>
                        <SelectItem value="promocoes">Promoções</SelectItem>
                        <SelectItem value="eventos">Eventos</SelectItem>
                        <SelectItem value="outros">Outros</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input placeholder="Digite as tags separadas por vírgula" {...field} />
                    </FormControl>
                    <FormDescription>Ex: promoção, desconto, oferta</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Seção de preços */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Preços</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="preco"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Preço Regular</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
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
                        <Input type="number" step="0.01" placeholder="0.00" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção de configurações */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Configurações</h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="programado">Programado</SelectItem>
                          <SelectItem value="hotpromo">Hot Promo</SelectItem>
                          <SelectItem value="evento">Evento</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="draft">Rascunho</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="dataInicio"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Início</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dataFim"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Data de Término</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                              ) : (
                                <span>Selecione uma data</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                            locale={ptBR}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="ativo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Ativo</FormLabel>
                        <FormDescription>Determina se o panfleto está ativo e visível para os usuários</FormDescription>
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
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Destaque</FormLabel>
                        <FormDescription>Coloca o panfleto em destaque na página inicial</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Seção de chamada para ação */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Chamada para Ação</h3>

              <FormField
                control={form.control}
                name="botaoAcao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto do Botão</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Comprar Agora, Saiba Mais" {...field} />
                    </FormControl>
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
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="codigo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código Promocional</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PROMO10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {panfleto?._id ? "Atualizar Panfleto" : "Criar Panfleto"}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}
