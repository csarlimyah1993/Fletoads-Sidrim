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
import UserLocationCard from "@/components/dashboard/user-location-card"
import { useEstatisticas } from "@/hooks/use-estatisticas"
import { Skeleton } from "@/components/ui/skeleton"
import { BarChart3, ShoppingBag, Users, TrendingUp, Calendar, Lightbulb, Activity, Store } from "lucide-react"
import { VendasRecentes } from "@/components/dashboard/vendas-recentes"
import { useRouter } from "next/navigation"
import { HorariosFuncionamentoCard } from "@/components/dashboard/horarios-funcionamento-card"
import { EventosCarousel } from "@/components/dashboard/eventos-carousel"

interface Cliente {
  _id: string
  nome: string
  email: string
  status: string
  cidade?: string
  estado?: string
}

interface Produto {
  _id: string
  nome: string
  preco: number
  estoque: number
  categoria?: string
  destaque?: boolean
}

interface Loja {
  _id: string
  nome: string
  endereco: any
  enderecoFormatado?: string
  telefone: string
  status: string
  horarioFuncionamento?: {
    segunda?: { open: boolean; abertura: string; fechamento: string }
    terca?: { open: boolean; abertura: string; fechamento: string }
    quarta?: { open: boolean; abertura: string; fechamento: string }
    quinta?: { open: boolean; abertura: string; fechamento: string }
    sexta?: { open: boolean; abertura: string; fechamento: string }
    sabado?: { open: boolean; abertura: string; fechamento: string }
    domingo?: { open: boolean; abertura: string; fechamento: string }
  }
  horarioFormatado?: {
    segunda?: string
    terca?: string
    quarta?: string
    quinta?: string
    sexta?: string
    sabado?: string
    domingo?: string
  }
}

interface DashboardContentProps {
  userName?: string
  plan?: string
  planExpiresAt?: string
}

export function DashboardContent({ userName, plan = "gratuito", planExpiresAt }: DashboardContentProps) {
  const { estatisticas, isLoading } = useEstatisticas()
  const [greeting, setGreeting] = useState("Bom dia")
  const [activeTab, setActiveTab] = useState("overview")
  const router = useRouter()

  // Estados para armazenar dados reais
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [loja, setLoja] = useState<Loja | null>(null)
  const [isLoadingData, setIsLoadingData] = useState({
    clientes: true,
    produtos: true,
    loja: true,
  })

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

  // Buscar dados reais
  useEffect(() => {
    async function fetchData() {
      try {
        // Buscar clientes
        const clientesResponse = await fetch("/api/dashboard/clientes")
        if (clientesResponse.ok) {
          const data = await clientesResponse.json()
          setClientes(data.clientes || [])
          console.log("Clientes carregados:", data.clientes?.length || 0)
        } else {
          console.error("Erro ao buscar clientes:", clientesResponse.status)
        }
        setIsLoadingData((prev) => ({ ...prev, clientes: false }))

        // Buscar produtos
        const produtosResponse = await fetch("/api/dashboard/produtos")
        if (produtosResponse.ok) {
          const data = await produtosResponse.json()
          setProdutos(data.produtos || [])
          console.log("Produtos carregados:", data.produtos?.length || 0)
        } else {
          console.error("Erro ao buscar produtos:", produtosResponse.status)
        }
        setIsLoadingData((prev) => ({ ...prev, produtos: false }))

        // Buscar loja
        const lojaResponse = await fetch("/api/dashboard/loja")
        if (lojaResponse.ok) {
          const data = await lojaResponse.json()
          setLoja(data.loja || null)
          console.log("Loja carregada:", data.loja ? "Sim" : "Não", data.loja?._id || "")
        } else {
          console.error("Erro ao buscar loja:", lojaResponse.status)
        }
        setIsLoadingData((prev) => ({ ...prev, loja: false }))
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
        setIsLoadingData({
          clientes: false,
          produtos: false,
          loja: false,
        })
      }
    }

    fetchData()
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

  // Formatar valor em reais
  const formatarValor = (valor: number) => {
    return valor.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  // Agrupar produtos por categoria
  const produtosPorCategoria = produtos.reduce((acc: Record<string, number>, produto) => {
    const categoria = produto.categoria || "Sem categoria"
    acc[categoria] = (acc[categoria] || 0) + 1
    return acc
  }, {})

  // Contar produtos em destaque
  const produtosDestaque = produtos.filter((p) => p.destaque).length

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
                    value={clientes.filter((c) => c.status === "ativo").length || 0}
                    description="Clientes ativos cadastrados"
                    trend={0}
                    trendLabel="em relação ao mês anterior"
                    icon={<Users className="h-5 w-5" />}
                  />
                  <StatsCard
                    title="Total de Produtos"
                    value={produtos.length || 0}
                    description="Produtos cadastrados"
                    trend={0}
                    trendLabel="em relação ao mês anterior"
                    icon={<ShoppingBag className="h-5 w-5" />}
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
          {/* Substituir o EventoCard pelo EventosCarousel */}
          {loja && loja._id && <EventosCarousel lojaId={loja._id.toString()} />}

          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Status da Loja
            </h3>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {isLoadingData.loja ? (
                <>
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                  <Skeleton className="h-[200px] w-full" />
                </>
              ) : loja ? (
                <>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Informações da Loja</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div>
                          <p className="text-sm text-muted-foreground">Nome</p>
                          <p className="font-medium">{loja.nome}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Endereço</p>
                          <p>{loja.enderecoFormatado || "Não informado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Telefone</p>
                          <p>{loja.telefone || "Não informado"}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Status</p>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              loja.status === "active"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                            }`}
                          >
                            {loja.status === "active" ? "Ativa" : "Inativa"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <UserLocationCard loja={loja} />
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm font-medium">Horário de Funcionamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <HorariosFuncionamentoCard horarios={loja.horarioFuncionamento} />
                    </CardContent>
                  </Card>
                </>
              ) : (
                <Card className="col-span-3">
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-2">Nenhuma loja cadastrada</h3>
                      <p className="text-muted-foreground mb-4">
                        Você ainda não possui uma loja cadastrada. Cadastre sua loja para começar a vender.
                      </p>
                      <button className="bg-primary text-white px-4 py-2 rounded-md">Cadastrar Loja</button>
                    </div>
                  </CardContent>
                </Card>
              )}
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
            {isLoadingData.produtos ? (
              <div className="space-y-4">
                <Skeleton className="h-[200px] w-full" />
              </div>
            ) : produtos.length > 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {produtos.slice(0, 5).map((produto) => (
                      <div key={produto._id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{produto.nome}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatarValor(produto.preco)} • Estoque: {produto.estoque}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button className="text-sm text-blue-600 hover:underline">Editar</button>
                          <button className="text-sm text-red-600 hover:underline">Excluir</button>
                        </div>
                      </div>
                    ))}
                    {produtos.length > 5 && (
                      <div className="text-center pt-2">
                        <button className="text-sm text-blue-600 hover:underline">
                          Ver todos os {produtos.length} produtos
                        </button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8">
                    <h3 className="text-lg font-medium mb-2">Nenhum produto cadastrado</h3>
                    <p className="text-muted-foreground mb-4">
                      Você ainda não possui produtos cadastrados. Cadastre produtos para começar a vender.
                    </p>
                    <button className="bg-primary text-white px-4 py-2 rounded-md">Cadastrar Produto</button>
                  </div>
                </CardContent>
              </Card>
            )}
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
                  <div className="text-2xl font-bold">{produtos.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {produtos.filter((p) => p.estoque > 0).length} em estoque
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Produtos em Destaque</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{produtosDestaque}</div>
                  <p className="text-xs text-muted-foreground">Exibidos na vitrine</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Categorias</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{Object.keys(produtosPorCategoria).length}</div>
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
                  <CardTitle>Clientes Recentes</CardTitle>
                  <CardDescription>Últimos clientes cadastrados</CardDescription>
                </CardHeader>
                <CardContent>
                  {isLoadingData.clientes ? (
                    <div className="space-y-2">
                      {[1, 2, 3].map((i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                    </div>
                  ) : clientes.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      <p>Nenhum cliente cadastrado</p>
                      <button
                        className="text-sm text-blue-600 hover:underline mt-2"
                        onClick={() => router.push("/dashboard/clientes")}
                      >
                        Cadastrar cliente
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clientes.slice(0, 5).map((cliente) => (
                        <div key={cliente._id} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{cliente.nome}</p>
                            <p className="text-sm text-muted-foreground">{cliente.email}</p>
                          </div>
                          <button
                            className="text-sm text-blue-600 hover:underline"
                            onClick={() => router.push(`/dashboard/clientes/${cliente._id}`)}
                          >
                            Ver detalhes
                          </button>
                        </div>
                      ))}
                      {clientes.length > 5 && (
                        <button
                          className="text-sm text-blue-600 hover:underline w-full text-center"
                          onClick={() => router.push("/dashboard/clientes")}
                        >
                          Ver todos os {clientes.length} clientes
                        </button>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Estatísticas de Clientes
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientes.length}</div>
                  <p className="text-xs text-muted-foreground">
                    {clientes.filter((c) => c.status === "ativo").length} ativos
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Prospectos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{clientes.filter((c) => c.status === "prospecto").length}</div>
                  <p className="text-xs text-muted-foreground">Potenciais clientes</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Regiões</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {
                      new Set(
                        clientes.map((c) => (c.cidade && c.estado ? `${c.cidade}-${c.estado}` : null)).filter(Boolean),
                      ).size
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">Cidades diferentes</p>
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
