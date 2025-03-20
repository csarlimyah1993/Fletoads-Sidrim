"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ChartCard } from "@/components/admin/chart-card"
import { DataTable } from "@/components/admin/data-table"
import { StatsCard } from "@/components/admin/stats-card"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowUpRight, Users, CreditCard, BarChart3, FileText } from "lucide-react"

interface DashboardStats {
  totalUsers: number
  activeUsers: number
  totalPlans: number
  activePlans: number
  totalRevenue: number
  totalPanfletos: number
  recentPanfletos: number
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalPlans: 0,
    activePlans: 0,
    totalRevenue: 0,
    totalPanfletos: 0,
    recentPanfletos: 0,
  })
  const [usersByPlan, setUsersByPlan] = useState<any[]>([])
  const [monthlyRegistrations, setMonthlyRegistrations] = useState<any[]>([])
  const [revenueByPlan, setRevenueByPlan] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        setError(null)

        // Fetch dashboard data
        const response = await fetch("/api/admin/dashboard")

        if (!response.ok) {
          throw new Error(`Error fetching dashboard data: ${response.status}`)
        }

        const data = await response.json()

        // Safely set stats with fallbacks for missing data
        setStats({
          totalUsers: data.usuarios?.total || 0,
          activeUsers: data.usuarios?.ativos || 0,
          totalPlans: data.planos?.total || 0,
          activePlans: data.planos?.ativos || 0,
          totalRevenue: data.receita?.total || 0,
          totalPanfletos: data.panfletos?.total || 0,
          recentPanfletos: data.panfletos?.recentes || 0,
        })

        // Set other data with fallbacks
        setUsersByPlan(data.usuarios?.porPlano || [])
        setMonthlyRegistrations(data.usuarios?.registrosMensais || [])
        setRevenueByPlan(data.receita?.porPlano || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        setError("Falha ao carregar dados do dashboard. Por favor, tente novamente.")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
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
            <StatsCard
              title="Total de Usuários"
              value={stats.totalUsers}
              description={`${stats.activeUsers} usuários ativos`}
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="Planos Ativos"
              value={stats.activePlans}
              description={`De um total de ${stats.totalPlans} planos`}
              icon={<CreditCard className="h-4 w-4" />}
            />
            <StatsCard
              title="Receita Mensal"
              value={`R$ ${stats.totalRevenue}`}
              description="Baseado nos planos ativos"
              icon={<BarChart3 className="h-4 w-4" />}
            />
            <StatsCard
              title="Panfletos Criados"
              value={stats.totalPanfletos}
              description={`${stats.recentPanfletos} criados nos últimos 7 dias`}
              icon={<FileText className="h-4 w-4" />}
            />
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
              data={monthlyRegistrations}
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
                    data={usersByPlan}
                    columns={[
                      { key: "nome", title: "Plano" },
                      { key: "usuarios", title: "Usuários" },
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
              data={revenueByPlan}
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
                    data={revenueByPlan}
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

        <TabsContent value="atividade" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas ações no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      {
                        user: "João Silva",
                        action: "Criou um novo panfleto",
                        time: "Há 2 horas",
                      },
                      {
                        user: "Maria Oliveira",
                        action: "Atualizou perfil da loja",
                        time: "Há 3 horas",
                      },
                      {
                        user: "Carlos Santos",
                        action: "Iniciou nova campanha",
                        time: "Há 5 horas",
                      },
                      {
                        user: "Ana Pereira",
                        action: "Alterou plano para Premium",
                        time: "Há 1 dia",
                      },
                    ].map((activity, i) => (
                      <div key={i} className="flex items-start gap-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                          {activity.user.charAt(0)}
                        </div>
                        <div>
                          <div className="font-medium">{activity.user}</div>
                          <div className="text-sm text-muted-foreground">{activity.action}</div>
                          <div className="mt-1 text-xs text-muted-foreground">{activity.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Uso do Sistema</CardTitle>
                <CardDescription>Métricas de uso da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-8 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Panfletos Criados</div>
                        <div className="text-sm font-medium">75%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "75%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Campanhas Ativas</div>
                        <div className="text-sm font-medium">60%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "60%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Uso de Armazenamento</div>
                        <div className="text-sm font-medium">45%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "45%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Uso de API</div>
                        <div className="text-sm font-medium">30%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "30%" }}></div>
                      </div>
                    </div>
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

