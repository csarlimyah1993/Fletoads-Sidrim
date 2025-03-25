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
import { Loader2, ShoppingBag, Users, Eye, MousePointerClick, TrendingUp } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Cores para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

interface DashboardData {
  panfletos: any[]
  vendas: any[]
  clientes: any[]
  estatisticas: {
    totalVisualizacoes: number
    totalCliques: number
    totalVendas: number
    totalClientes: number
  }
  totalViews?: number // Tornando opcional
  totalClicks?: number // Tornando opcional
  totalSales?: number // Tornando opcional
  totalRevenue?: number // Tornando opcional
  salesByStatus?: any[]
  salesByPaymentMethod?: any[]
  salesByDay?: any[]
}

export function DashboardContent() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<DashboardData>({
    panfletos: [],
    vendas: [],
    clientes: [],
    estatisticas: {
      totalVisualizacoes: 0,
      totalCliques: 0,
      totalVendas: 0,
      totalClientes: 0,
    },
    totalViews: 0,
    totalClicks: 0,
    totalSales: 0,
    totalRevenue: 0,
    salesByStatus: [],
    salesByPaymentMethod: [],
    salesByDay: [],
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/dashboard")

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados: ${response.status}`)
        }

        const dashboardData = await response.json()
        setData({
          ...dashboardData,
          totalViews: dashboardData.estatisticas?.totalVisualizacoes || 0,
          totalClicks: dashboardData.estatisticas?.totalCliques || 0,
          totalSales: dashboardData.estatisticas?.totalVendas || 0,
          totalRevenue: 0, // Valor padrão se não existir
          salesByStatus: dashboardData.vendasPorStatus || [],
          salesByPaymentMethod: dashboardData.vendasPorMetodoPagamento || [],
          salesByDay: dashboardData.vendasPorDia || [],
        })
      } catch (error) {
        console.error("Erro ao buscar dados do dashboard:", error)
        setError("Não foi possível carregar os dados do dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  if (isLoading) {
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
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Visão Geral</TabsTrigger>
        <TabsTrigger value="analytics">Análises</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data.totalViews || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cliques</CardTitle>
              <MousePointerClick className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data.totalClicks || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(data.totalSales || 0).toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">+12.5% em relação ao mês anterior</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatarValor(data.totalRevenue || 0)}</div>
              <p className="text-xs text-muted-foreground">+18.2% em relação ao mês anterior</p>
            </CardContent>
          </Card>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
              <CardDescription>Vendas nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.salesByDay || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="_id"
                    tickFormatter={(value) => {
                      if (!value) return ""
                      const date = new Date(value)
                      return isNaN(date.getTime()) ? value : format(date, "dd/MM")
                    }}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => [`${value} vendas`, "Quantidade"]}
                    labelFormatter={(value) => {
                      if (!value) return ""
                      const date = new Date(value)
                      return isNaN(date.getTime()) ? value : format(date, "dd 'de' MMMM", { locale: ptBR })
                    }}
                  />
                  <Bar dataKey="count" fill="#8884d8" name="Vendas" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Vendas por Status</CardTitle>
              <CardDescription>Distribuição de vendas por status</CardDescription>
            </CardHeader>
            <CardContent>
              {data.salesByStatus && data.salesByStatus.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={data.salesByStatus}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="_id"
                      label={({ _id, percent }) => `${_id || "N/A"} ${((percent || 0) * 100).toFixed(0)}%`}
                    >
                      {(data.salesByStatus || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value} vendas`, name || "N/A"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="analytics" className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Métodos de Pagamento</CardTitle>
              <CardDescription>Distribuição por método de pagamento</CardDescription>
            </CardHeader>
            <CardContent>
              {data.salesByPaymentMethod && data.salesByPaymentMethod.length > 0 ? (
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={data.salesByPaymentMethod}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                      nameKey="_id"
                      label={({ _id, percent }) => {
                        const metodos: Record<string, string> = {
                          dinheiro: "Dinheiro",
                          cartao_credito: "Cartão de Crédito",
                          cartao_debito: "Cartão de Débito",
                          pix: "PIX",
                          boleto: "Boleto",
                          transferencia: "Transferência",
                        }
                        return `${metodos[_id || ""] || _id || "N/A"} ${((percent || 0) * 100).toFixed(0)}%`
                      }}
                    >
                      {(data.salesByPaymentMethod || []).map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatarValor(Number(value) || 0), "Valor"]}
                      labelFormatter={(id) => {
                        const metodos: Record<string, string> = {
                          dinheiro: "Dinheiro",
                          cartao_credito: "Cartão de Crédito",
                          cartao_debito: "Cartão de Débito",
                          pix: "PIX",
                          boleto: "Boleto",
                          transferencia: "Transferência",
                        }
                        return metodos[id || ""] || id || "N/A"
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex justify-center items-center h-64">
                  <p className="text-muted-foreground">Nenhum dado disponível</p>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Clientes</CardTitle>
              <CardDescription>Total de clientes cadastrados</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Users className="h-5 w-5 mr-2 text-primary" />
                  <span className="font-medium">
                    {(data.estatisticas?.totalClientes || 0).toLocaleString()} clientes no total
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Acesse a seção de clientes para ver detalhes e gerenciar seus clientes.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  )
}

