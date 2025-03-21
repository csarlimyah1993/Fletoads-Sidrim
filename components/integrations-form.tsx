"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { AlertCircle, Copy, RefreshCw } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const formSchema = z.object({
  webhookUrl: z.string().url({ message: "URL inválida" }).optional().or(z.literal("")),
  apiKey: z.string().optional(),
  notificationsEnabled: z.boolean().default(true),
  syncInterval: z.enum(["realtime", "hourly", "daily"]).default("realtime"),
  notes: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

interface IntegrationFormProps {
  integration: {
    id: string
    name: string
    type: string
    userId: string
    settings?: {
      webhookUrl?: string
      apiKey?: string
      notificationsEnabled?: boolean
      syncInterval?: "realtime" | "hourly" | "daily"
      notes?: string
    }
  }
  webhookUrl?: string
  apiKey?: string
}

export default function IntegrationForm({ integration, webhookUrl, apiKey }: IntegrationFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      webhookUrl: webhookUrl || "",
      apiKey: apiKey || "",
      notificationsEnabled: integration.settings?.notificationsEnabled !== false,
      syncInterval: integration.settings?.syncInterval || "realtime",
      notes: integration.settings?.notes || "",
    },
  })

  async function onSubmit(values: FormValues) {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/integrations/${integration.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: {
            ...values,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar a integração")
      }

      toast.success("Integração atualizada com sucesso")
      router.refresh()
    } catch (error) {
      console.error(error)
      toast.error("Erro ao atualizar a integração")
    } finally {
      setIsSubmitting(false)
    }
  }

  function regenerateApiKey() {
    const newApiKey = Array.from({ length: 24 }, () => Math.floor(Math.random() * 36).toString(36)).join("")

    form.setValue("apiKey", newApiKey)
    toast.success("Nova chave API gerada")
  }

  function copyToClipboard(text: string | undefined, message: string) {
    if (text) {
      navigator.clipboard.writeText(text)
      toast.success(message)
    }
  }

  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="mb-4">
        <TabsTrigger value="settings">Configurações</TabsTrigger>
        <TabsTrigger value="api">API</TabsTrigger>
        <TabsTrigger value="logs">Logs</TabsTrigger>
      </TabsList>

      <TabsContent value="settings">
        <Card>
          <CardHeader>
            <CardTitle>Configurações da Integração</CardTitle>
            <CardDescription>Configure como a integração com {integration.name} deve funcionar.</CardDescription>
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Webhook</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." {...field} />
                      </FormControl>
                      <FormDescription>URL para onde enviaremos notificações de eventos.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notificationsEnabled"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Notificações</FormLabel>
                        <FormDescription>Receba notificações sobre eventos desta integração.</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="syncInterval"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intervalo de Sincronização</FormLabel>
                      <div className="flex gap-4">
                        <FormControl>
                          <div className="flex flex-col space-y-2">
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="realtime"
                                value="realtime"
                                checked={field.value === "realtime"}
                                onChange={() => field.onChange("realtime")}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="realtime" className="text-sm font-medium">
                                Tempo real
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="hourly"
                                value="hourly"
                                checked={field.value === "hourly"}
                                onChange={() => field.onChange("hourly")}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="hourly" className="text-sm font-medium">
                                A cada hora
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="radio"
                                id="daily"
                                value="daily"
                                checked={field.value === "daily"}
                                onChange={() => field.onChange("daily")}
                                className="h-4 w-4 border-gray-300 text-primary focus:ring-primary"
                              />
                              <label htmlFor="daily" className="text-sm font-medium">
                                Diariamente
                              </label>
                            </div>
                          </div>
                        </FormControl>
                      </div>
                      <FormDescription>Define com que frequência os dados serão sincronizados.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notas</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Adicione notas sobre esta integração..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>Notas internas sobre esta integração.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" type="button" onClick={() => router.back()}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar alterações"}
                </Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </TabsContent>

      <TabsContent value="api">
        <Card>
          <CardHeader>
            <CardTitle>Configurações de API</CardTitle>
            <CardDescription>Gerencie as credenciais de API para esta integração.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <div className="text-sm font-medium">Chave de API</div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm" onClick={() => setShowApiKey(!showApiKey)}>
                    {showApiKey ? "Ocultar" : "Mostrar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(form.getValues("apiKey"), "Chave API copiada")}
                  >
                    <Copy className="h-4 w-4 mr-1" />
                    Copiar
                  </Button>
                  <Button variant="outline" size="sm" onClick={regenerateApiKey}>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerar
                  </Button>
                </div>
              </div>
              <div className="p-3 bg-muted rounded-md font-mono text-sm">
                {showApiKey ? form.getValues("apiKey") || "Nenhuma chave API gerada" : "••••••••••••••••••••••••"}
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Atenção</AlertTitle>
              <AlertDescription>
                Regenerar a chave API invalidará a chave anterior. Todos os serviços que usam a chave atual precisarão
                ser atualizados.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <div className="text-sm font-medium">URL da API</div>
              <div className="p-3 bg-muted rounded-md font-mono text-sm break-all">
                https://api.fletoads.com/v1/integrations/{integration.id}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() =>
                  copyToClipboard(`https://api.fletoads.com/v1/integrations/${integration.id}`, "URL da API copiada")
                }
              >
                <Copy className="h-4 w-4 mr-1" />
                Copiar URL
              </Button>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="logs">
        <Card>
          <CardHeader>
            <CardTitle>Logs da Integração</CardTitle>
            <CardDescription>Visualize os logs recentes desta integração.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border p-4 text-sm">
              <p className="text-muted-foreground">Nenhum log disponível para esta integração.</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

