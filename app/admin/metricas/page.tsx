"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartCard } from "@/components/admin/chart-card"
import { DataTable } from "@/components/admin/data-table"
import { Skeleton } from "@/components/ui/skeleton"
import { TrendingUp, Users, CreditCard, FileText, Calendar } from "lucide-react"

interface MetricsData {
  totalUsers: number
  totalPlans: number
  monthlyRegistrations: Array<{
    date: string
    count: number
  }>
  revenue: {
    total: number
    byPlan: Array<{
      plano: string
      preco: number
      usuarios: number
      receita: number
    }>
  }
}

export default function AdminMetricsPage() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<MetricsData | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchMetrics() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/admin/metricas")

        if (!response.ok) {
          throw new Error(`Error fetching metrics: ${response.status}`)
        }

        const data = await response.json()
        setMetrics(data)
      } catch (error) {
        console.error("Failed to fetch metrics:", error)
        setError("Falha ao carregar métricas. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [])

  // Format monthly data for chart
  const monthlyData =
    metrics?.monthlyRegistrations?.map((item) => ({
      month: item.date,
      usuarios: item.count,
    })) || []

  // Format revenue data for chart
  const revenueData =
    metrics?.revenue?.byPlan?.map((item) => ({
      plano: item.plano,
      receita: item.receita,
    })) || []

  // Calculate growth rates (mock data for now)
  const userGrowth = 12.5 // percentage
  const revenueGrowth = 8.3 // percentage

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Métricas e Análises</h1>
        <div className="text-sm text-muted-foreground">Dados atualizados em {new Date().toLocaleDateString()}</div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="p-4 text-red-800 dark:text-red-300">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-24" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-20" />
                  <Skeleton className="mt-2 h-4 w-full" />
                </CardContent>
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalUsers || 0}</div>
                <p className={`text-xs ${userGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {userGrowth >= 0 ? "↑" : "↓"} {Math.abs(userGrowth)}% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ {metrics?.revenue?.total || 0}</div>
                <p className={`text-xs ${revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {revenueGrowth >= 0 ? "↑" : "↓"} {Math.abs(revenueGrowth)}% em relação ao mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Planos Ativos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalPlans || 0}</div>
                <p className="text-xs text-muted-foreground">
                  {metrics?.revenue?.byPlan?.length || 0} planos com usuários ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Panfletos Criados</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">125</div>
                <p className="text-xs text-muted-foreground">32 criados nos últimos 7 dias</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="atividade">Atividade</TabsTrigger>
        </TabsList>

        <TabsContent value="usuarios" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard
              title="Novos Usuários por Mês"
              description="Registros nos últimos 6 meses"
              data={monthlyData}
              type="line"
              xKey="month"
              yKey="usuarios"
            />

            <Card>
              <CardHeader>
                <CardTitle>Retenção de Usuários</CardTitle>
                <CardDescription>Taxa de retenção mensal</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Mês atual</div>
                        <div className="text-sm font-medium">92%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "92%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Mês anterior</div>
                        <div className="text-sm font-medium">88%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "88%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Média anual</div>
                        <div className="text-sm font-medium">85%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "85%" }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="receita" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard
              title="Receita por Plano"
              description="Distribuição da receita mensal"
              data={revenueData}
              type="bar"
              xKey="plano"
              yKey="receita"
            />

            <Card>
              <CardHeader>
                <CardTitle>Detalhes de Receita</CardTitle>
                <CardDescription>Receita por plano</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <DataTable
                    data={metrics?.revenue?.byPlan || []}
                    columns={[
                      { key: "plano", title: "Plano" },
                      {
                        key: "preco",
                        title: "Preço",
                        render: (item) => `R$ ${item.preco}`,
                      },
                      { key: "usuarios", title: "Usuários" },
                      {
                        key: "receita",
                        title: "Receita",
                        render: (item) => `R$ ${item.receita}`,
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="atividade" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Diária</CardTitle>
                <CardDescription>Usuários ativos por dia</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="space-y-8">
                    <div className="grid grid-cols-7 gap-2">
                      {Array.from({ length: 7 }).map((_, i) => {
                        const activity = Math.floor(Math.random() * 100)
                        const height = 20 + (activity / 100) * 80

                        return (
                          <div key={i} className="flex flex-col items-center">
                            <div className="flex h-32 items-end">
                              <div className="w-full rounded-t-md bg-blue-500" style={{ height: `${height}%` }}></div>
                            </div>
                            <div className="mt-2 text-xs text-muted-foreground">
                              {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"][i]}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-2xl font-bold">78%</div>
                        <div className="text-xs text-muted-foreground">Taxa de atividade</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">23 min</div>
                        <div className="text-xs text-muted-foreground">Tempo médio</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-xs text-muted-foreground">Ações por sessão</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calendário de Eventos</CardTitle>
                <CardDescription>Próximos eventos importantes</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      {
                        date: new Date(Date.now() + 86400000 * 2),
                        title: "Lançamento de Novos Recursos",
                        description: "Atualização da plataforma com novos recursos",
                      },
                      {
                        date: new Date(Date.now() + 86400000 * 5),
                        title: "Manutenção Programada",
                        description: "Janela de manutenção de 2 horas",
                      },
                      {
                        date: new Date(Date.now() + 86400000 * 10),
                        title: "Campanha de Marketing",
                        description: "Início da campanha de marketing Q2",
                      },
                    ].map((event, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          <Calendar className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <div className="text-sm text-muted-foreground">{event.description}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{event.date.toLocaleDateString()}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

