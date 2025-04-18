"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import dynamic from "next/dynamic"

// Import the wrapper component with all Recharts components
const DynamicRechartsComponents = dynamic(() => import("@/components/charts/recharts-wrapper"), {
  ssr: false,
  loading: () => <p>Loading charts...</p>,
})

// Dados de exemplo para os gráficos
const dadosVisualizacoes = [
  { mes: "Jan", quantidade: 400 },
  { mes: "Fev", quantidade: 300 },
  { mes: "Mar", quantidade: 600 },
  { mes: "Abr", quantidade: 800 },
  { mes: "Mai", quantidade: 500 },
  { mes: "Jun", quantidade: 700 },
]

const dadosConversoes = [
  { mes: "Jan", quantidade: 40 },
  { mes: "Fev", quantidade: 30 },
  { mes: "Mar", quantidade: 60 },
  { mes: "Abr", quantidade: 80 },
  { mes: "Mai", quantidade: 50 },
  { mes: "Jun", quantidade: 70 },
]

const dadosCategorias = [
  { nome: "Promocional", valor: 400 },
  { nome: "Institucional", valor: 300 },
  { nome: "Eventos", valor: 300 },
  { nome: "Outros", valor: 200 },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

// Define types for the pie chart label function
interface PieChartLabelProps {
  nome: string
  percent: number
  [key: string]: any
}

export default function RelatoriosPage() {
  const [periodoSelecionado, setPeriodoSelecionado] = useState("6meses")
  const [mounted, setMounted] = useState(false)
  const [chartsLoaded, setChartsLoaded] = useState(false)

  // Import all Recharts components
  const [RechartsComponents, setRechartsComponents] = useState<any>(null)

  // useEffect para garantir que o componente só renderize no cliente
  useEffect(() => {
    setMounted(true)

    // Import Recharts components dynamically
    import("@/components/charts/recharts-wrapper").then((module) => {
      setRechartsComponents(module)
      setChartsLoaded(true)
    })
  }, [])

  // Não renderizar os gráficos até que o componente esteja montado no cliente
  if (!mounted || !chartsLoaded) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        </div>
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Carregando...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[350px] flex items-center justify-center">
                <p>Carregando relatórios...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Destructure the components after they're loaded
  const {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart,
    Pie,
    Cell,
    Legend,
  } = RechartsComponents

  // Custom label function for pie chart with proper typing
  const renderCustomizedLabel = ({ nome, percent }: PieChartLabelProps) => {
    return `${nome} ${(percent * 100).toFixed(0)}%`
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        <div className="flex items-center gap-2">
          <Select value={periodoSelecionado} onValueChange={setPeriodoSelecionado}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="3meses">Últimos 3 meses</SelectItem>
              <SelectItem value="6meses">Últimos 6 meses</SelectItem>
              <SelectItem value="12meses">Últimos 12 meses</SelectItem>
            </SelectContent>
          </Select>
          <Button>Exportar</Button>
        </div>
      </div>

      <Tabs defaultValue="visualizacoes" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visualizacoes">Visualizações</TabsTrigger>
          <TabsTrigger value="conversoes">Conversões</TabsTrigger>
          <TabsTrigger value="categorias">Categorias</TabsTrigger>
        </TabsList>
        <TabsContent value="visualizacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Visualizações de Panfletos</CardTitle>
              <CardDescription>Número de visualizações ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dadosVisualizacoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="conversoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Taxa de Conversão</CardTitle>
              <CardDescription>Conversões ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dadosConversoes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="mes" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="quantidade" stroke="#8884d8" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categorias" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Categoria</CardTitle>
              <CardDescription>Distribuição de panfletos por categoria</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dadosCategorias}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="valor"
                      label={renderCustomizedLabel}
                    >
                      {dadosCategorias.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
