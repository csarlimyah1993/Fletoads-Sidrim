"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts"
import { Loader2, Users, Store, FileText, Activity, TrendingUp, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

// Cores para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

// Definindo interfaces para os tipos de dados
interface SystemHealth {
  cpu: number
  memory: number
  disk: number
  network: number
}

interface UserPlan {
  name: string
  value: number
}

interface MonthlyUser {
  month: string
  users: number
}

interface MonthlySales {
  month: string
  sales: number
}

interface Alert {
  id: number
  type: string
  message: string
  time: string
}

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalStores: number
  totalProducts: number
  totalPanfletos: number
  totalSales: number
  totalRevenue: number
  systemHealth: SystemHealth
  usersByPlan: UserPlan[]
  userRegistrationByMonth: MonthlyUser[]
  salesByMonth: MonthlySales[]
  recentAlerts: Alert[]
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalPanfletos: 0,
    totalSales: 0,
    totalRevenue: 0,
    systemHealth: {
      cpu: 0,
      memory: 0,
      disk: 0,
      network: 0,
    },
    usersByPlan: [],
    userRegistrationByMonth: [],
    salesByMonth: [],
    recentAlerts: [],
  })

  const fetchData = async () => {
    try {
      setIsLoading(true)
      // Buscar dados reais da API
      const response = await fetch("/api/admin/dashboard")

      if (!response.ok) {
        throw new Error(`Erro ao buscar dados: ${response.status}`)
      }

      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error("Erro ao buscar dados do dashboard:", error)
      setError("Não foi possível carregar os dados do dashboard")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  if (isLoading && Object.values(stats).every((value) => value === 0 || (Array.isArray(value) && value.length === 0))) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Administrativo</h2>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Baixar Relatório
          </Button>
          <Button size="sm" onClick={() => fetchData()}>
            Atualizar Dados
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.activeUsers.toLocaleString()} usuários ativos (
                  {Math.round((stats.activeUsers / stats.totalUsers) * 100) || 0}%)
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
                <Store className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalStores.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {Math.round((stats.totalStores / stats.totalUsers) * 100) || 0}% dos usuários têm lojas
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Panfletos</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalPanfletos.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Média de {Math.round(stats.totalPanfletos / stats.totalStores) || 0} por loja
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatarValor(stats.totalRevenue)}</div>
                <p className="text-xs text-muted-foreground">{stats.totalSales.toLocaleString()} vendas registradas</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Novos Usuários por Mês</CardTitle>
                <CardDescription>Crescimento de usuários nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={stats.userRegistrationByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} usuários`, "Novos Usuários"]} />
                    <Bar dataKey="users" fill="#8884d8" name="Novos Usuários" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Distribuição por Plano</CardTitle>
                <CardDescription>Usuários por tipo de plano</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={stats.usersByPlan}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.usersByPlan.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} usuários`, "Quantidade"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Faturamento Mensal</CardTitle>
                <CardDescription>Faturamento nos últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={stats.salesByMonth}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [formatarValor(Number(value)), "Faturamento"]} />
                    <Line type="monotone" dataKey="sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Alertas Recentes</CardTitle>
                <CardDescription>Últimas notificações do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.recentAlerts.length > 0 ? (
                    stats.recentAlerts.map((alert) => (
                      <div key={alert.id} className="flex items-start space-x-2">
                        <AlertTriangle
                          className={`h-5 w-5 ${
                            alert.type === "error"
                              ? "text-red-500"
                              : alert.type === "warning"
                                ? "text-amber-500"
                                : "text-blue-500"
                          }`}
                        />
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{alert.message}</p>
                          <p className="text-xs text-muted-foreground">{alert.time}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum alerta recente</p>
                  )}
                  <Button variant="outline" className="w-full mt-2">
                    Ver Todos os Alertas
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Análise de Engajamento</CardTitle>
                <CardDescription>Métricas de uso da plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Taxa de Conversão</span>
                      <span className="text-sm font-medium">8.5%</span>
                    </div>
                    <Progress value={8.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Taxa de Retenção</span>
                      <span className="text-sm font-medium">72%</span>
                    </div>
                    <Progress value={72} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Usuários Ativos Diários</span>
                      <span className="text-sm font-medium">65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">Tempo Médio de Sessão</span>
                      <span className="text-sm font-medium">12min</span>
                    </div>
                    <Progress value={50} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Principais Fontes de Tráfego</CardTitle>
                <CardDescription>Como os usuários encontram a plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Pesquisa Orgânica</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tráfego Direto</span>
                    <span className="text-sm font-medium">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Redes Sociais</span>
                    <span className="text-sm font-medium">15%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Referências</span>
                    <span className="text-sm font-medium">10%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Campanhas Pagas</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stats.systemHealth.cpu}%</div>
                  <Progress value={stats.systemHealth.cpu} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memória</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stats.systemHealth.memory}%</div>
                  <Progress value={stats.systemHealth.memory} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disco</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stats.systemHealth.disk}%</div>
                  <Progress value={stats.systemHealth.disk} className="h-2" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rede</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{stats.systemHealth.network}%</div>
                  <Progress value={stats.systemHealth.network} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Status dos Serviços</CardTitle>
                <CardDescription>Estado atual dos serviços do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">API Principal</span>
                    <span className="text-sm font-medium text-green-500">Operacional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Banco de Dados</span>
                    <span className="text-sm font-medium text-green-500">Operacional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Serviço de Email</span>
                    <span className="text-sm font-medium text-green-500">Operacional</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Processamento de Pagamentos</span>
                    <span className="text-sm font-medium text-amber-500">Degradado</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Armazenamento de Arquivos</span>
                    <span className="text-sm font-medium text-green-500">Operacional</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Últimos Backups</CardTitle>
                <CardDescription>Status dos backups do sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Diário</span>
                    <span className="text-sm font-medium text-green-500">Concluído (hoje às 03:15)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Semanal</span>
                    <span className="text-sm font-medium text-green-500">Concluído (domingo às 02:30)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Mensal</span>
                    <span className="text-sm font-medium text-green-500">Concluído (01/03 às 01:45)</span>
                  </div>
                  <Button variant="outline" className="w-full mt-2">
                    Iniciar Backup Manual
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

