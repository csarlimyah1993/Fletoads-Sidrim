"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Loader2, CheckCircle2 } from "lucide-react"

// Define the form schema
const formSchema = z.object({
  webhookUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  apiKey: z.string().optional(),
  ativo: z.boolean().default(true),
  credenciais: z.record(z.string()).optional(),
  configuracoes: z.record(z.string()).optional(),
})

// Define the props for the component
interface IntegrationFormProps {
  integration: {
    id: string
    name: string
    description: string
    logo?: string
    fields?: {
      credenciais?: Array<{
        nome: string
        label: string
        tipo: string
        obrigatorio?: boolean
        opcoes?: string[]
        descricao?: string
      }>
      configuracoes?: Array<{
        nome: string
        label: string
        tipo: string
        obrigatorio?: boolean
        opcoes?: string[]
        descricao?: string
      }>
    }
    settings?: {
      webhookUrl?: string
      apiKey?: string
      credenciais?: Record<string, string>
      configuracoes?: Record<string, string>
    }
  }
  webhookUrl?: string
  apiKey?: string
}

export default function IntegrationForm({ integration, webhookUrl = "", apiKey = "" }: IntegrationFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isTested, setIsTested] = useState(false)
  const router = useRouter()

  // Initialize the form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: webhookUrl || "",
      apiKey: apiKey || "",
      ativo: true,
      credenciais: integration.settings?.credenciais || {},
      configuracoes: integration.settings?.configuracoes || {},
    },
  })

  // Handle form submission
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/integracoes/${integration.id}/configurar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao salvar configurações")
      }

      toast.success("Configurações salvas com sucesso!")
      router.push("/dashboard/integracoes")
      router.refresh()
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao salvar configurações")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle testing the integration
  async function testIntegration() {
    setIsLoading(true)
    try {
      const values = form.getValues()
      const response = await fetch(`/api/integracoes/${integration.id}/testar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Erro ao testar integração")
      }

      setIsTested(true)
      toast.success("Integração testada com sucesso!")
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro ao testar integração")
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to safely get field value
  const getFieldValue = (fieldType: "credenciais" | "configuracoes", fieldName: string): string => {
    const values = form.getValues(fieldType)
    return values && values[fieldName] ? values[fieldName] : ""
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="ativo"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Status da Integração</FormLabel>
                      <FormDescription>
                        Ative ou desative esta integração. Quando desativada, a integração não processará dados.
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <Tabs defaultValue="credenciais" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="credenciais">Credenciais</TabsTrigger>
                  <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
                  <TabsTrigger value="webhook">Webhook</TabsTrigger>
                </TabsList>

                <TabsContent value="credenciais" className="space-y-4 pt-4">
                  {integration.fields?.credenciais && integration.fields.credenciais.length > 0 ? (
                    integration.fields.credenciais.map((campo) => {
                      if (campo.tipo === "text" || campo.tipo === "password") {
                        return (
                          <FormField
                            key={campo.nome}
                            control={form.control}
                            name={`credenciais.${campo.nome}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{campo.label}</FormLabel>
                                <FormControl>
                                  <Input
                                    type={campo.tipo}
                                    placeholder={`Digite ${campo.label.toLowerCase()}`}
                                    {...field}
                                    value={field.value || ""}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                {campo.descricao && <FormDescription>{campo.descricao}</FormDescription>}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      } else if (campo.tipo === "select" && campo.opcoes) {
                        return (
                          <FormField
                            key={campo.nome}
                            control={form.control}
                            name={`credenciais.${campo.nome}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{campo.label}</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    const credenciais = form.getValues("credenciais") || {}
                                    credenciais[campo.nome] = value
                                    form.setValue("credenciais", credenciais)
                                  }}
                                  defaultValue={form.getValues("credenciais")?.[campo.nome] || ""}
                                  disabled={isLoading}
                                >
                                  <SelectTrigger id={campo.nome}>
                                    <SelectValue placeholder={`Selecione ${campo.label.toLowerCase()}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {campo.opcoes?.map((opcao) => (
                                      <SelectItem key={opcao} value={opcao}>
                                        {opcao}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {campo.descricao && <FormDescription>{campo.descricao}</FormDescription>}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      }
                      return null
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">Esta integração não requer credenciais adicionais.</p>
                  )}
                </TabsContent>

                <TabsContent value="configuracoes" className="space-y-4 pt-4">
                  {integration.fields?.configuracoes && integration.fields.configuracoes.length > 0 ? (
                    integration.fields.configuracoes.map((campo) => {
                      if (campo.tipo === "text" || campo.tipo === "number") {
                        return (
                          <FormField
                            key={campo.nome}
                            control={form.control}
                            name={`configuracoes.${campo.nome}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{campo.label}</FormLabel>
                                <FormControl>
                                  <Input
                                    type={campo.tipo}
                                    placeholder={`Digite ${campo.label.toLowerCase()}`}
                                    {...field}
                                    value={field.value || ""}
                                    disabled={isLoading}
                                  />
                                </FormControl>
                                {campo.descricao && <FormDescription>{campo.descricao}</FormDescription>}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      } else if (campo.tipo === "select") {
                        return (
                          <FormField
                            key={campo.nome}
                            control={form.control}
                            name={`configuracoes.${campo.nome}`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{campo.label}</FormLabel>
                                <Select
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    const configuracoes = form.getValues("configuracoes") || {}
                                    configuracoes[campo.nome] = value
                                    form.setValue("configuracoes", configuracoes)
                                  }}
                                  defaultValue={(form.getValues("configuracoes") || {})[campo.nome] || ""}
                                  disabled={isLoading}
                                >
                                  <SelectTrigger id={campo.nome}>
                                    <SelectValue placeholder={`Selecione ${campo.label.toLowerCase()}`} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {campo.opcoes?.map((opcao) => (
                                      <SelectItem key={opcao} value={opcao}>
                                        {opcao}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                {campo.descricao && <FormDescription>{campo.descricao}</FormDescription>}
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )
                      }
                      return null
                    })
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Esta integração não possui configurações adicionais.
                    </p>
                  )}
                </TabsContent>

                <TabsContent value="webhook" className="space-y-4 pt-4">
                  <FormField
                    control={form.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL do Webhook</FormLabel>
                        <FormControl>
                          <Input placeholder="https://seu-site.com/api/webhook" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>
                          URL para onde enviaremos notificações quando eventos ocorrerem.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chave de API</FormLabel>
                        <FormControl>
                          <Input placeholder="Sua chave de API secreta" {...field} disabled={isLoading} />
                        </FormControl>
                        <FormDescription>Chave secreta para autenticar requisições ao webhook.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={testIntegration} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : isTested ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                Testado com Sucesso
              </>
            ) : (
              "Testar Integração"
            )}
          </Button>

          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push("/dashboard/integracoes")}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Configurações"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}
