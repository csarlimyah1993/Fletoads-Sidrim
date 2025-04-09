"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, BarChart3, PieChart, LineChart, Store, FileText } from "lucide-react"

interface MetricasData {
  totalVisualizacoes: number
  totalCliques: number
  totalVendas: number
  totalPanfletos: number
  totalProdutos: number
  totalLojas: number
  visualizacoesPorDia: { data: string; count: number }[]
  cliquesPorDia: { data: string; count: number }[]
  vendasPorDia: { data: string; count: number }[]
  visualizacoesPorCategoria: { categoria: string; count: number }[]
  cliquesPorCategoria: { categoria: string; count: number }[]
  vendasPorCategoria: { categoria: string; count: number }[]
}

export default function MetricasPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metricas, setMetricas] = useState<MetricasData | null>(null)

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/admin/metricas")

        if (!response.ok) {
          throw new Error(`Erro ao buscar métricas: ${response.status}`)
        }

        const data = await response.json()
        setMetricas(data)
      } catch (error) {
        console.error("Erro ao buscar métricas:", error)
        setError("Não foi possível carregar as métricas")
      } finally {
        setIsLoading(false)
      }
    }

    fetchMetricas()
  }, [])

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
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Métricas da Plataforma</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Visualizações</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas?.totalVisualizacoes.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Cliques</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas?.totalCliques.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15.2% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metricas?.totalVendas.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+12.5% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Panfletos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.totalPanfletos.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Produtos</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.totalProdutos.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lojas</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metricas?.totalLojas.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="visualizacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visualizacoes">Visualizações</TabsTrigger>
          <TabsTrigger value="cliques">Cliques</TabsTrigger>
          <TabsTrigger value="vendas">Vendas</TabsTrigger>
        </TabsList>
        <TabsContent value="visualizacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações por Dia</CardTitle>
              <CardDescription>Total de visualizações nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-center justify-center">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Gráfico de visualizações por dia</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visualizações por Categoria</CardTitle>
              <CardDescription>Distribuição de visualizações por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-center justify-center">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Gráfico de visualizações por categoria</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cliques" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cliques por Dia</CardTitle>
              <CardDescription>Total de cliques nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-center justify-center">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Gráfico de cliques por dia</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Cliques por Categoria</CardTitle>
              <CardDescription>Distribuição de cliques por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-center justify-center">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Gráfico de cliques por categoria</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="vendas" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Dia</CardTitle>
              <CardDescription>Total de vendas nos últimos 30 dias</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-center justify-center">
                <LineChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Gráfico de vendas por dia</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Vendas por Categoria</CardTitle>
              <CardDescription>Distribuição de vendas por categoria</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              <div className="h-full flex items-center justify-center">
                <PieChart className="h-16 w-16 text-muted-foreground" />
                <p className="ml-4 text-muted-foreground">Gráfico de vendas por categoria</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

