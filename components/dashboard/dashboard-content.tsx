"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/admin/stats-card"
import { PanfletosPorCategoria } from "@/components/dashboard/panfletos-por-categoria"
import { PanfletosPorMes } from "@/components/dashboard/panfletos-por-mes"
import { CampanhasPerformance } from "@/components/dashboard/campanhas-performace"
import { ClientesAtivos } from "@/components/dashboard/clientes-ativos"
import { TipsCard } from "@/components/dashboard/tips-card"
import { PlanCard } from "@/components/planos/plano-card"
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card"
import { UserLocationCard } from "@/components/dashboard/user-location-card"
import { useEstatisticas } from "@/hooks/use-estatisticas"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, ShoppingBag, Users, TrendingUp, Calendar, Lightbulb, Activity, Store } from "lucide-react"
import { ClientesProximosCard } from "@/components/dashboard/clientes-proximos"
import { ProdutosRecentes } from "@/components/dashboard/produtos-recentes"
import { VendasRecentes } from "@/components/dashboard/vendas-recentes"
import { LojaStatusCard } from "./loja-status-card"

interface DashboardContentProps {
  userName?: string
  plan?: string
  planExpiresAt?: string
}

export function DashboardContent({ userName, plan = "gratuito", planExpiresAt  }: DashboardContentProps) {
  const { estatisticas, isLoading } = useEstatisticas()
  const [greeting, setGreeting] = useState("Bom dia")
  const [activeTab, setActiveTab] = useState("overview")

  useEffect(() => {
    const hour = new Date().getHours()
    if (hour >= 5 && hour < 12) {
      setGreeting("Bom dia")
    } else if (hour >= 12 && hour < 18) {
      setGreeting("Boa tarde")
    } else {
      setGreeting("Boa noite")
    }
  }, [])

  // Função para transformar os dados de campanhas para o formato esperado
  const transformCampanhasData = () => {
    if (!estatisticas?.campanhas?.performance) return []

    return estatisticas.campanhas.performance.map((item: any) => ({
      status: item.campanha || "N/A",
      quantidade: item.conversoes || 0,
    }))
  }

  // Função para transformar os dados de clientes para o formato esperado
  const transformClientesData = () => {
    if (!estatisticas?.clientes?.porSegmento) return []

    return estatisticas.clientes.porSegmento.map((item: any) => ({
      periodo: item.segmento || "N/A",
      quantidade: item.quantidade || 0,
    }))
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Cabeçalho */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-muted-foreground mt-1">Acompanhe o desempenho da sua loja e campanhas</p>
        </div>
        {userName && (
          <div className="bg-muted/50 px-4 py-2 rounded-lg">
            <p className="text-muted-foreground">
              {greeting}, <span className="font-medium">{userName}</span>!
            </p>
          </div>
        )}
      </div>

      {/* Tabs para organizar o conteúdo */}
      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
          <TabsTrigger value="visao-geral" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visão Geral</span>
          </TabsTrigger>
          <TabsTrigger value="loja" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Minha Loja</span>
          </TabsTrigger>
          <TabsTrigger value="produtos" className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Produtos</span>
          </TabsTrigger>
          <TabsTrigger value="clientes" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">Clientes</span>
          </TabsTrigger>
          <TabsTrigger value="recursos" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span className="hidden sm:inline">Recursos</span>
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba Visão Geral */}
        <TabsContent value="visao-geral" className="space-y-6">
          {/* Seção de métricas principais */}
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Métricas Principais
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                <>
                  <Skeleton className="h-[120px] w-full" />
                  <Skeleton className="h-[120px] w-full" />
                  <Skeleton className="h-[120px] w-full" />
                  <Skeleton className="h-[120px] w-full" />
                </>
              ) : (
                <>
                  <StatsCard
                    title="Total de Panfletos"
                    value={estatisticas?.panfletos?.total || 0}
                    description="Total de panfletos criados"
                    trend={estatisticas?.panfletos?.crescimento || 0}
                    trendLabel="em relação ao mês anterior"
                    icon={<Calendar className="h-5 w-5" />}
                  />
                  <StatsCard
                    title="Clientes Ativos"
                    value={estatisticas?.clientes?.ativos || 0}
                    description="Clientes com campanhas ativas"
                    trend={estatisticas?.clientes?.crescimento || 0}
                    trendLabel="em relação ao mês anterior"
                    icon={<Users className="h-5 w-5" />}
                  />
                  <StatsCard
                    title="Campanhas Ativas"
                    value={estatisticas?.campanhas?.ativas || 0}
                    description="Campanhas em andamento"
                    trend={estatisticas?.campanhas?.crescimento || 0}
                    trendLabel="em relação ao mês anterior"
                    icon={<TrendingUp className="h-5 w-5" />}
                  />
                  <StatsCard
                    title="Taxa de Conversão"
                    value={`${estatisticas?.geral?.taxaConversao || 0}%`}
                    description="Média de conversão das campanhas"
                    trend={estatisticas?.geral?.crescimentoConversao || 0}
                    trendLabel="em relação ao mês anterior"
                    icon={<BarChart3 className="h-5 w-5" />}
                  />
                </>
              )}
            </div>
          </section>

          {/* Seção de gráficos */}
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Desempenho
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Panfletos por Mês</CardTitle>
                  <CardDescription>Número de panfletos criados nos últimos 6 meses</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <PanfletosPorMes data={estatisticas?.panfletos?.porMes || []} isLoading={isLoading} />
                </CardContent>
              </Card>
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Panfletos por Categoria</CardTitle>
                  <CardDescription>Distribuição de panfletos por categoria</CardDescription>
                </CardHeader>
                <CardContent>
                  <PanfletosPorCategoria data={estatisticas?.panfletos?.porCategoria || []} isLoading={isLoading} />
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Seção de atividades recentes e plano */}
          <section className="grid gap-4 md:grid-cols-2">
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Atividades Recentes
              </h3>
              <RecentActivityCard />
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Store className="h-5 w-5 text-primary" />
                Seu Plano
              </h3>
              <PlanCard />
            </div>
          </section>
        </TabsContent>

        {/* Conteúdo da aba Minha Loja */}
        <TabsContent value="loja" className="space-y-6">
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Status da Loja
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <LojaStatusCard />
              <UserLocationCard />
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Horário de Funcionamento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Segunda-Sexta:</span>
                      <span className="font-medium">09:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábado:</span>
                      <span className="font-medium">10:00 - 15:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingo:</span>
                      <span className="font-medium">Fechado</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Desempenho da Loja
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Performance de Campanhas</CardTitle>
                  <CardDescription>Taxa de conversão das campanhas ativas</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <CampanhasPerformance data={transformCampanhasData()} isLoading={isLoading} />
                </CardContent>
              </Card>
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Vendas Recentes</CardTitle>
                  <CardDescription>Últimas vendas registradas</CardDescription>
                </CardHeader>
                <CardContent>
                  <VendasRecentes />
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* Conteúdo da aba Produtos */}
        <TabsContent value="produtos" className="space-y-6">
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary" />
              Produtos Recentes
            </h3>
            <ProdutosRecentes />
          </section>

          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Estatísticas de Produtos
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">24</div>
                  <p className="text-xs text-muted-foreground">+3 novos este mês</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Produtos em Destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">5</div>
                  <p className="text-xs text-muted-foreground">Exibidos na vitrine</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">Categorias ativas</p>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* Conteúdo da aba Clientes */}
        <TabsContent value="clientes" className="space-y-6">
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Segmentação de Clientes
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Clientes por Segmento</CardTitle>
                  <CardDescription>Distribuição de clientes por segmento</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientesAtivos data={transformClientesData()} isLoading={isLoading} />
                </CardContent>
              </Card>
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Clientes Próximos</CardTitle>
                  <CardDescription>Clientes na sua região</CardDescription>
                </CardHeader>
                <CardContent>
                  <ClientesProximosCard />
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>

        {/* Conteúdo da aba Recursos */}
        <TabsContent value="recursos" className="space-y-6">
          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-primary" />
              Dicas e Recursos
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <TipsCard />
              <Card>
                <CardHeader>
                  <CardTitle>Recursos Disponíveis</CardTitle>
                  <CardDescription>Ferramentas para impulsionar seu negócio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Gerador de Panfletos com IA</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Integração com WhatsApp</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <span>Vitrine Digital</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                      <span>Análise de Campanhas</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                      <span className="text-muted-foreground">Integração com E-commerce (Premium)</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  )
}
