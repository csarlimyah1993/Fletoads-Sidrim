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
import { Loader2, ShoppingBag, Users, FileText, Calendar } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { PlanUpgradeBanner } from "@/components/planos/plan-upgrade-banner"

// Cores para os gráficos
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function DashboardClient() {
  // Estados para armazenar dados
  const [mounted, setMounted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usuario, setUsuario] = useState<any>(null)
  const [loja, setLoja] = useState<any>(null)
  const [estatisticas, setEstatisticas] = useState<any>({
    totalVendas: 0,
    valorTotal: 0,
    vendasPorStatus: [],
    vendasPorMetodoPagamento: [],
    vendasPorDia: [],
  })
  const [contadores, setContadores] = useState({
    panfletos: 0,
    clientes: 0,
    campanhas: 0,
  })

  // useEffect para garantir que o componente só renderize no cliente
  useEffect(() => {
    setMounted(true)

    const fetchDados = async () => {
      try {
        setIsLoading(true)

        // Buscar dados do usuário
        const userResponse = await fetch("/api/usuario/perfil")
        if (userResponse.ok) {
          const userData = await userResponse.json()
          setUsuario(userData)
        }

        // Buscar dados da loja
        const lojaResponse = await fetch("/api/loja/perfil")
        if (lojaResponse.ok) {
          const lojaData = await lojaResponse.json()
          setLoja(lojaData)
        }

        // Buscar estatísticas de vendas
        const vendaResponse = await fetch("/api/vendas/estatisticas?periodo=mes")
        if (vendaResponse.ok) {
          const vendaData = await vendaResponse.json()
          setEstatisticas(vendaData)
        }

        // Buscar contadores
        const [panfletosRes, clientesRes, campanhasRes] = await Promise.all([
          fetch("/api/panfletos?limit=1"),
          fetch("/api/clientes?limit=1"),
          fetch("/api/campanhas?limit=1"),
        ])

        if (panfletosRes.ok) {
          const data = await panfletosRes.json()
          setContadores((prev) => ({ ...prev, panfletos: data.pagination.total }))
        }

        if (clientesRes.ok) {
          const data = await clientesRes.json()
          setContadores((prev) => ({ ...prev, clientes: data.pagination.total }))
        }

        if (campanhasRes.ok) {
          const data = await campanhasRes.json()
          setContadores((prev) => ({ ...prev, campanhas: data.pagination.total }))
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setError("Erro ao carregar dados do dashboard")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDados()
  }, [])

  // Função para formatar o valor em reais
  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor)
  }

  // Não renderizar nada até que o componente esteja montado no cliente
  if (!mounted) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center justify-between space-y-2">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
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
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>

      {/* Banner de upgrade de plano */}
      <PlanUpgradeBanner />

      {/* Mensagem de boas-vindas personalizada */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-none">
        <CardContent className="pt-6">
          <h3 className="text-xl font-medium mb-2">Bem-vindo, {loja ? loja.nome : usuario?.nome || "Usuário"}!</h3>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
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
                    <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{estatisticas.totalVendas || 0}</div>
                    <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Faturamento</CardTitle>
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
                    <div className="text-2xl font-bold">{formatarValor(estatisticas.valorTotal || 0)}</div>
                    <p className="text-xs text-muted-foreground">Nos últimos 30 dias</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contadores.clientes}</div>
                    <p className="text-xs text-muted-foreground">Total de clientes cadastrados</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Panfletos</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{contadores.panfletos}</div>
                    <p className="text-xs text-muted-foreground">Total de panfletos criados</p>
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
                      <BarChart data={estatisticas.vendasPorDia || []}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                          dataKey="_id"
                          tickFormatter={(value) => {
                            const date = new Date(value)
                            return format(date, "dd/MM")
                          }}
                        />
                        <YAxis />
                        <Tooltip
                          formatter={(value) => [`${value} vendas`, "Quantidade"]}
                          labelFormatter={(value) => format(new Date(value), "dd 'de' MMMM", { locale: ptBR })}
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
                    <ResponsiveContainer width="100%" height={350}>
                      <PieChart>
                        <Pie
                          data={estatisticas.vendasPorStatus || []}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="_id"
                          label={({ _id, percent }) => `${_id} ${(percent * 100).toFixed(0)}%`}
                        >
                          {(estatisticas.vendasPorStatus || []).map((entry: any, index: number) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [`${value} vendas`, name]} />
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
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Distribuição por método de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={estatisticas.vendasPorMetodoPagamento || []}
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
                          return `${metodos[_id] || _id} ${(percent * 100).toFixed(0)}%`
                        }}
                      >
                        {(estatisticas.vendasPorMetodoPagamento || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [formatarValor(Number(value)), "Valor"]}
                        labelFormatter={(id) => {
                          const metodos: Record<string, string> = {
                            dinheiro: "Dinheiro",
                            cartao_credito: "Cartão de Crédito",
                            cartao_debito: "Cartão de Débito",
                            pix: "PIX",
                            boleto: "Boleto",
                            transferencia: "Transferência",
                          }
                          return metodos[id] || id
                        }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Campanhas Ativas</CardTitle>
                <CardDescription>Campanhas em andamento</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 mr-2 text-primary" />
                      <span className="font-medium">{contadores.campanhas} campanhas no total</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Acesse a seção de campanhas para ver detalhes e criar novas campanhas para seus clientes.
                    </p>
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
