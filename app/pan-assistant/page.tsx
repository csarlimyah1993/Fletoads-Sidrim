"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Bot, Plus, MessageSquare, Settings, Zap } from "lucide-react"
import { usePlanFeatures } from "@/hooks/use-plan-features"

export default function PanAssistantPage() {
  const { planLevel } = usePlanFeatures()
  const [activeTab, setActiveTab] = useState("assistants")

  // Determinar quantos assistentes o usuário pode ter com base no plano
  let assistantLimit = 0
  if (planLevel === "start") {
    assistantLimit = 1
  } else if (planLevel === "pro" || planLevel === "business") {
    assistantLimit = 3
  } else if (planLevel === "enterprise" || planLevel === "premium") {
    assistantLimit = Number.POSITIVE_INFINITY
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">Pan Assistant</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Criar Assistente
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Seus Assistentes</CardTitle>
          <CardDescription>
            {assistantLimit === Number.POSITIVE_INFINITY
              ? "Você pode criar assistentes ilimitados"
              : `Você pode criar até ${assistantLimit} assistente${assistantLimit > 1 ? "s" : ""}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="assistants" onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="assistants">Assistentes</TabsTrigger>
              <TabsTrigger value="conversations">Conversas</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>

            <TabsContent value="assistants" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Bot className="h-5 w-5 text-violet-500" />
                      Assistente de Vendas
                    </CardTitle>
                    <CardDescription>Criado em 10/03/2023</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Este assistente ajuda a responder perguntas sobre produtos e promoções.
                    </p>
                    <div className="mt-4 flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                      <span className="text-xs">Ativo</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" /> Conversar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="mr-2 h-4 w-4" /> Configurar
                    </Button>
                  </CardFooter>
                </Card>

                {assistantLimit > 1 && (
                  <Card className="border-dashed">
                    <CardHeader>
                      <CardTitle>Criar Novo Assistente</CardTitle>
                      <CardDescription>Configure um assistente para uma função específica</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-6">
                      <div className="rounded-full bg-violet-100 p-3 dark:bg-violet-900">
                        <Plus className="h-6 w-6 text-violet-500" />
                      </div>
                      <p className="mt-4 text-sm text-center text-muted-foreground">
                        Crie um assistente personalizado para atender suas necessidades
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">
                        <Plus className="mr-2 h-4 w-4" /> Criar Assistente
                      </Button>
                    </CardFooter>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="conversations" className="mt-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Conversa com Cliente</CardTitle>
                    <CardDescription>Última atualização: 2 horas atrás</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      Cliente perguntando sobre disponibilidade de produtos.
                    </p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <MessageSquare className="mr-2 h-4 w-4" /> Ver Conversa
                    </Button>
                    <Button variant="outline" size="sm">
                      <Zap className="mr-2 h-4 w-4" /> Responder
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações do Assistente</CardTitle>
                  <CardDescription>Personalize o comportamento dos seus assistentes</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium">Personalização</h3>
                      <p className="text-sm text-muted-foreground">
                        Configure o tom, estilo e conhecimento dos seus assistentes.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Integrações</h3>
                      <p className="text-sm text-muted-foreground">
                        Conecte seus assistentes com outras ferramentas e plataformas.
                      </p>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium">Análise de Desempenho</h3>
                      <p className="text-sm text-muted-foreground">
                        Veja estatísticas de uso e eficácia dos seus assistentes.
                      </p>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>Salvar Configurações</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

