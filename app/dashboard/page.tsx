"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ResourceLimitsCard } from "@/components/planos/resource-limits-card"
import { PlanUpgradeBanner } from "@/components/planos/plan-upgrade-banner"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { useSession } from "next-auth/react"

// Componentes específicos para cada plano
import { ClientesProximosMap } from "@/components/dashboard/clientes-proximos-map"
import { VendasStats } from "@/components/dashboard/vendas-stats"
import { PanAssistantPreview } from "@/components/dashboard/pan-assistant-preview"
import { IntegracoesPreview } from "@/components/dashboard/integracoes-preview"

export default function DashboardPage() {
  const { data: session } = useSession()
  const { planName, hasFeature, isLoading } = usePlanFeatures()
  const [activeTab, setActiveTab] = useState("overview")

  if (isLoading) {
    return <DashboardLoading />
  }

  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Bem-vindo, {session?.user?.name || "Usuário"}! Aqui está um resumo da sua loja.
          </p>
        </div>

        <PlanUpgradeBanner />

        <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="resources">Recursos</TabsTrigger>
            {hasFeature("analytics") && <TabsTrigger value="analytics">Análises</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">R$ 1.250,00</div>
                  <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Panfletos Ativos</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">+10.5% em relação ao mês passado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Produtos</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <rect width="20" height="14" x="2" y="5" rx="2" />
                    <path d="M2 10h20" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">+7% em relação ao mês passado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Clientes Alcançados</CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">573</div>
                  <p className="text-xs text-muted-foreground">+18.2% em relação ao mês passado</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>Visão Geral de Vendas</CardTitle>
                  <CardDescription>Suas vendas nos últimos 30 dias</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <VendasStats />
                </CardContent>
              </Card>

              {hasFeature("clientesProximos") && (
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Clientes Próximos</CardTitle>
                    <CardDescription>Clientes em um raio de 5km da sua loja</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ClientesProximosMap />
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {hasFeature("panAssistant") && (
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Pan Assistant</CardTitle>
                    <CardDescription>Seu assistente de marketing inteligente</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <PanAssistantPreview />
                  </CardContent>
                </Card>
              )}

              {hasFeature("integracoes") && (
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Integrações</CardTitle>
                    <CardDescription>Conecte-se com outras plataformas</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <IntegracoesPreview />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-4">
            <ResourceLimitsCard />
          </TabsContent>

          {hasFeature("analytics") && (
            <TabsContent value="analytics" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Análise Detalhada</CardTitle>
                  <CardDescription>Métricas avançadas e insights para sua loja</CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Conteúdo de análises avançadas disponível apenas para planos premium.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  )
}

function DashboardLoading() {
  return (
    <div className="flex flex-col min-h-screen w-full">
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <div className="h-8 w-48 bg-muted rounded-md animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded-md animate-pulse" />
        </div>

        <div className="h-10 w-full max-w-md bg-muted rounded-md animate-pulse" />

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-24 bg-muted rounded-md animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-20 bg-muted rounded-md animate-pulse mb-2" />
                <div className="h-3 w-32 bg-muted rounded-md animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse mb-2" />
              <div className="h-4 w-48 bg-muted rounded-md animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-muted rounded-md animate-pulse" />
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <div className="h-5 w-32 bg-muted rounded-md animate-pulse mb-2" />
              <div className="h-4 w-48 bg-muted rounded-md animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[200px] w-full bg-muted rounded-md animate-pulse" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

