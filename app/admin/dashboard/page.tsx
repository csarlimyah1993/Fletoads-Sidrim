"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Users, CreditCard, BarChart3, FileText, ArrowUpRight, Database } from "lucide-react"
import { StatsCard } from "@/components/admin/stats-card"
import { ChartCard } from "@/components/admin/chart-card"
import { DataTable } from "@/components/admin/data-table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminDashboard() {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [userStats, setUserStats] = useState<any>({
    total: 0,
    admins: 0,
    users: 0,
    newUsers: 0,
  })
  const [planStats, setPlanStats] = useState<any>({
    total: 0,
    active: 0,
    plans: [],
  })
  const [metrics, setMetrics] = useState<any>({
    totalUsers: 0,
    totalPlans: 0,
    monthlyRegistrations: [],
    revenue: {
      total: 0,
      byPlan: [],
    },
  })
  const [systemStatus, setSystemStatus] = useState<any>({
    database: {
      connected: false,
      name: "Unknown",
    },
    collections: [],
    system: {},
    environment: {},
  })

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)

        // Fetch user stats
        try {
          const userResponse = await fetch("/api/admin/usuarios/count")
          if (userResponse.ok) {
            const userData = await userResponse.json()
            setUserStats(userData)
          }
        } catch (error) {
          console.error("Error fetching user stats:", error)
        }

        // Fetch plan stats
        try {
          const planResponse = await fetch("/api/admin/planos/stats")
          if (planResponse.ok) {
            const planData = await planResponse.json()
            setPlanStats(planData)
          }
        } catch (error) {
          console.error("Error fetching plan stats:", error)
        }

        // Fetch metrics
        try {
          const metricsResponse = await fetch("/api/admin/metricas")
          if (metricsResponse.ok) {
            const metricsData = await metricsResponse.json()
            setMetrics(metricsData)
          }
        } catch (error) {
          console.error("Error fetching metrics:", error)
        }

        // Fetch system status
        try {
          const statusResponse = await fetch("/api/admin/sistema/status")
          if (statusResponse.ok) {
            const statusData = await statusResponse.json()
            setSystemStatus(statusData)
          }
        } catch (error) {
          console.error("Error fetching system status:", error)
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  // Format monthly data for chart
  const monthlyData =
    metrics?.monthlyRegistrations?.map((item: any) => ({
      month: item.date,
      usuarios: item.count,
    })) || []

  // Format revenue data for chart
  const revenueData =
    metrics?.revenue?.byPlan?.map((item: any) => ({
      plano: item.plano,
      receita: item.receita,
    })) || []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-sm text-muted-foreground">Bem-vindo, {session?.user?.nome || "Administrador"}</p>
      </div>

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
            <StatsCard
              title="Total de Usuários"
              value={userStats?.total || 0}
              description={`${userStats?.newUsers || 0} novos nos últimos 30 dias`}
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="Planos Ativos"
              value={planStats?.active || 0}
              description={`De um total de ${planStats?.total || 0} planos`}
              icon={<CreditCard className="h-4 w-4" />}
            />
            <StatsCard
              title="Receita Mensal"
              value={`R$ ${metrics?.revenue?.total || 0}`}
              description="Baseado nos planos ativos"
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <StatsCard
              title="Panfletos Criados"
              value="125"
              description="32 criados nos últimos 7 dias"
              icon={<FileText className="h-4 w-4" />}
            />
          </>
        )}
      </div>

      <Tabs defaultValue="usuarios">
        <TabsList>
          <TabsTrigger value="usuarios">Usuários</TabsTrigger>
          <TabsTrigger value="receita">Receita</TabsTrigger>
          <TabsTrigger value="sistema">Sistema</TabsTrigger>
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
                <CardTitle>Distribuição de Planos</CardTitle>
                <CardDescription>Usuários por plano</CardDescription>
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
                    data={planStats?.plans || []}
                    columns={[
                      { key: "nome", title: "Plano" },
                      { key: "userCount", title: "Usuários" },
                      {
                        key: "ativo",
                        title: "Status",
                        render: (item) => (
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              item.ativo
                                ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                            }`}
                          >
                            {item.ativo ? "Ativo" : "Inativo"}
                          </span>
                        ),
                      },
                    ]}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <a href="/admin/usuarios">
                Ver todos os usuários
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
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

          <div className="flex justify-end">
            <Button asChild>
              <a href="/admin/metricas">
                Ver métricas detalhadas
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="sistema" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status do Sistema</CardTitle>
                <CardDescription>Informações do servidor e banco de dados</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Banco de Dados:</span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          systemStatus?.database?.connected
                            ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            systemStatus?.database?.connected ? "bg-green-600" : "bg-red-600"
                          }`}
                        />
                        {systemStatus?.database?.connected ? "Conectado" : "Desconectado"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Ambiente:</span>
                      <span>{systemStatus?.environment?.nodeEnv || "development"}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Memória:</span>
                      <span>
                        {systemStatus?.system?.freeMemory || "N/A"} livre de{" "}
                        {systemStatus?.system?.totalMemory || "N/A"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="font-medium">Uptime:</span>
                      <span>{systemStatus?.system?.uptime || "N/A"}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coleções do Banco de Dados</CardTitle>
                <CardDescription>Estrutura do banco de dados</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {systemStatus?.collections?.map((collection: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 rounded-md border p-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        <span>{collection.name}</span>
                        <span className="ml-auto text-xs text-muted-foreground">{collection.type}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-end">
            <Button asChild>
              <a href="/admin/sistema">
                Ver detalhes do sistema
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

