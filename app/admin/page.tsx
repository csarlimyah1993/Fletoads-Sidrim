"use client"

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
} from "recharts"
import { useEffect, useState } from "react"
import { Loader2, Users, Store, FileText, Package } from "lucide-react"

// Cores para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export default function AdminDashboardPage() {
  // Estados para armazenar dados
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [estatisticas, setEstatisticas] = useState<any>({
    totalUsuarios: 0,
    totalLojas: 0,
    totalPanfletos: 0,
    totalProdutos: 0,
    usuariosPorDia: [],
    lojasPorPlano: [],
  })

  // useEffect para garantir que o componente só renderize no cliente
  useEffect(() => {
    setMounted(true)

    const fetchDados = async () => {
      try {
        setIsLoading(true)

        // Simulação de dados para demonstração
        // Em produção, você substituiria isso por chamadas reais à API
        setTimeout(() => {
          setEstatisticas({
            totalUsuarios: 250,
            totalLojas: 120,
            totalPanfletos: 1450,
            totalProdutos: 3200,
            usuariosPorDia: [
              { data: "2023-05-01", count: 5 },
              { data: "2023-05-02", count: 8 },
              { data: "2023-05-03", count: 12 },
              { data: "2023-05-04", count: 7 },
              { data: "2023-05-05", count: 10 },
              { data: "2023-05-06", count: 15 },
              { data: "2023-05-07", count: 9 },
            ],
            lojasPorPlano: [
              { plano: "Grátis", count: 50 },
              { plano: "Básico", count: 35 },
              { plano: "Premium", count: 25 },
              { plano: "Empresarial", count: 10 },
            ],
          })
          setIsLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setError("Erro ao carregar dados do dashboard")
        setIsLoading(false)
      }
    }

    fetchDados()
  }, [])

  // Não renderizar nada até que o componente esteja montado no cliente
  if (!mounted) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Painel Administrativo</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">...</div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Painel Administrativo</h2>
      </div>

      {/* Mensagem de boas-vindas */}
      <Card className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950 border-none">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2">Área Administrativa</h3>
          <p className="text-muted-foreground">Gerencie usuários, lojas, produtos e configurações do sistema.</p>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="analytics">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center h-64">
                <p className="text-lg font-medium text-center text-red-500">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalUsuarios}</div>
                    <p className="text-xs text-muted-foreground">Usuários registrados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Lojas</CardTitle>
                    <Store className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalLojas}</div>
                    <p className="text-xs text-muted-foreground">Lojas ativas</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Panfletos</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalPanfletos}</div>
                    <p className="text-xs text-muted-foreground">Panfletos criados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                    <Package className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalProdutos}</div>
                    <p className="text-xs text-muted-foreground">Produtos cadastrados</p>
                  </CardContent>
                </Card>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                  <CardHeader>
                    <CardTitle>Novos Usuários</CardTitle>
                    <CardDescription>Registros nos últimos 7 dias</CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart data={estatisticas.usuariosPorDia}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="data"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}`
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} usuários`, "Quantidade"]}
                          labelFormatter={(value) => {
                            const date = new Date(value)
                            return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`
                          }}
                        />
                        <Bar dataKey="count" fill="#FF8042" name="Usuários" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="col-span-3">
                  <CardHeader>
                    <CardTitle>Lojas por Plano</CardTitle>
                    <CardDescription>Distribuição de lojas por plano</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={estatisticas.lojasPorPlano}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="plano"
                          label={({ plano, percent }) => `${plano} ${(percent * 100).toFixed(0)}%`}
                        >
                          {estatisticas.lojasPorPlano.map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} lojas`, name]} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </TabsContent>
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Análises Avançadas</CardTitle>
              <CardDescription>Métricas detalhadas do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Esta seção mostrará análises avançadas do sistema, incluindo métricas de desempenho, uso de recursos
                    e tendências de crescimento. Implemente as APIs necessárias para fornecer esses dados.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

