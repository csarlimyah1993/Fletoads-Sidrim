"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Edit,
  MessageSquare,
  ShoppingBag,
  Users,
  TrendingUp,
  DollarSign,
  Activity,
  Search,
  Filter,
  ChevronRightIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"

export function DashboardContentEnhanced() {
  const [activeTab, setActiveTab] = useState("ano")
  const [selectedYear, setSelectedYear] = useState("2023")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  // Simular carregamento de dados
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)
    return () => clearTimeout(timer)
  }, [])

  // Dados para os gráficos
  const monthlyData = [
    { name: "Jan", receita: 42000, estimativa: 38000, media: 35000 },
    { name: "Fev", receita: 38000, estimativa: 36000, media: 35000 },
    { name: "Mar", receita: 45000, estimativa: 40000, media: 35000 },
    { name: "Abr", receita: 40000, estimativa: 38000, media: 35000 },
    { name: "Mai", receita: 35000, estimativa: 34000, media: 35000 },
    { name: "Jun", receita: 48000, estimativa: 42000, media: 35000 },
    { name: "Jul", receita: 52000, estimativa: 45000, media: 35000 },
    { name: "Ago", receita: 49000, estimativa: 44000, media: 35000 },
    { name: "Set", receita: 55000, estimativa: 48000, media: 35000 },
    { name: "Out", receita: 60000, estimativa: 52000, media: 35000 },
    { name: "Nov", receita: 58000, estimativa: 50000, media: 35000 },
    { name: "Dez", receita: 65000, estimativa: 55000, media: 35000 },
  ]

  const customerData = [
    { name: "Masculino", value: 55 },
    { name: "Feminino", value: 40 },
    { name: "Outros", value: 5 },
  ]

  const ageData = [
    { name: "18-24", value: 15 },
    { name: "25-34", value: 30 },
    { name: "35-44", value: 25 },
    { name: "45-54", value: 20 },
    { name: "55+", value: 10 },
  ]

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  const panAiMetrics = [
    {
      title: "Mensagens Enviadas",
      value: "1,234",
      change: "+12%",
      icon: <MessageSquare className="h-5 w-5 text-blue-500" />,
      color: "border-l-blue-500",
    },
    {
      title: "Taxa de Resposta",
      value: "87%",
      change: "+5%",
      icon: <Activity className="h-5 w-5 text-green-500" />,
      color: "border-l-green-500",
    },
    {
      title: "Conversões",
      value: "342",
      change: "+18%",
      icon: <TrendingUp className="h-5 w-5 text-orange-500" />,
      color: "border-l-orange-500",
    },
  ]

  const recentSales = [
    {
      date: "18/11/2023",
      name: "Cinto de Couro na cor preta com fivela em aço escovado",
      type: "PANFLETO",
      code: "#1233213",
      value: "85,80",
    },
    {
      date: "18/11/2023",
      name: "Tênis Branco Casual Masculino em Couro Genuíno com Cadarço",
      type: "PANFLETO",
      code: "#1233214",
      value: "159,90",
    },
    {
      date: "18/11/2023",
      name: "Sapato Oxford Clássico Marrom de Couro com Cadarço",
      type: "PANFLETO",
      code: "#1233215",
      value: "199,90",
    },
    {
      date: "18/11/2023",
      name: "Tênis Esportivo High-End EliteSport Pro Runner",
      type: "PANFLETO",
      code: "#1233216",
      value: "115,90",
    },
  ]

  // Estado para controlar o modal do mapa detalhado
  const [mapModalOpen, setMapModalOpen] = useState(false)
  const [mapTab, setMapTab] = useState("todos")
  const [selectedUser, setSelectedUser] = useState(null)
  const [userDetailOpen, setUserDetailOpen] = useState(false)

  // Dados de exemplo para os usuários próximos
  const nearbyUsers = [
    {
      id: 1,
      name: "Carlos Silva",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "male",
      distance: 0.3,
      lastSeen: "Há 5 min",
      interactions: {
        viewedPanfletos: 8,
        vitrineVisits: 3,
        contacted: true,
        lastPurchase: "18/11/2023",
      },
    },
    {
      id: 2,
      name: "Ana Oliveira",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "female",
      distance: 0.5,
      lastSeen: "Há 12 min",
      interactions: {
        viewedPanfletos: 5,
        vitrineVisits: 2,
        contacted: true,
        lastPurchase: "10/11/2023",
      },
    },
    {
      id: 3,
      name: "Marcos Pereira",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "male",
      distance: 0.7,
      lastSeen: "Há 30 min",
      interactions: {
        viewedPanfletos: 3,
        vitrineVisits: 1,
        contacted: false,
        lastPurchase: null,
      },
    },
    {
      id: 4,
      name: "Juliana Costa",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "female",
      distance: 0.4,
      lastSeen: "Há 18 min",
      interactions: {
        viewedPanfletos: 12,
        vitrineVisits: 4,
        contacted: true,
        lastPurchase: "15/11/2023",
      },
    },
    {
      id: 5,
      name: "Rafael Mendes",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "lgbt",
      distance: 0.6,
      lastSeen: "Há 8 min",
      interactions: {
        viewedPanfletos: 7,
        vitrineVisits: 3,
        contacted: false,
        lastPurchase: null,
      },
    },
    {
      id: 6,
      name: "Fernanda Lima",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "female",
      distance: 0.9,
      lastSeen: "Há 45 min",
      interactions: {
        viewedPanfletos: 2,
        vitrineVisits: 0,
        contacted: false,
        lastPurchase: null,
      },
    },
    {
      id: 7,
      name: "Lucas Santos",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "male",
      distance: 0.2,
      lastSeen: "Há 3 min",
      interactions: {
        viewedPanfletos: 15,
        vitrineVisits: 6,
        contacted: true,
        lastPurchase: "20/11/2023",
      },
    },
    {
      id: 8,
      name: "Camila Rocha",
      photo: "/placeholder.svg?height=40&width=40",
      gender: "lgbt",
      distance: 0.8,
      lastSeen: "Há 22 min",
      interactions: {
        viewedPanfletos: 9,
        vitrineVisits: 4,
        contacted: true,
        lastPurchase: "05/11/2023",
      },
    },
  ]

  // Função para filtrar usuários por gênero
  const filterUsersByGender = (gender) => {
    if (gender === "todos") return nearbyUsers
    return nearbyUsers.filter((user) => user.gender === gender)
  }

  // Função para obter a cor do círculo com base no gênero
  const getGenderColor = (gender) => {
    switch (gender) {
      case "male":
        return "border-blue-500 bg-blue-100"
      case "female":
        return "border-pink-500 bg-pink-100"
      case "lgbt":
        return "border-rainbow bg-gradient-to-r from-red-200 via-yellow-200 to-purple-200"
      default:
        return "border-gray-500 bg-gray-100"
    }
  }

  // Função para obter estatísticas de interação
  const getInteractionStats = () => {
    const stats = {
      totalViews: 0,
      totalVisits: 0,
      totalContacts: 0,
      totalPurchases: 0,
    }

    nearbyUsers.forEach((user) => {
      stats.totalViews += user.interactions.viewedPanfletos
      stats.totalVisits += user.interactions.vitrineVisits
      stats.totalContacts += user.interactions.contacted ? 1 : 0
      stats.totalPurchases += user.interactions.lastPurchase ? 1 : 0
    })

    return stats
  }

  // Referência para o canvas do mapa
  const mapCanvasRef = useRef(null)

  // Efeito para desenhar o mapa detalhado
  useEffect(() => {
    if (mapModalOpen && mapCanvasRef.current) {
      drawMap()
    }
  }, [mapModalOpen, mapTab])

  // Função para desenhar o mapa (para ser usada com os controles de zoom)
  const drawMap = () => {
    if (mapCanvasRef.current) {
      const canvas = mapCanvasRef.current
      const ctx = canvas.getContext("2d")
      const width = canvas.width
      const height = canvas.height

      // Limpar o canvas
      ctx.clearRect(0, 0, width, height)

      // Desenhar o fundo do mapa
      ctx.fillStyle = "#f0f9ff"
      ctx.fillRect(0, 0, width, height)

      // Desenhar círculos concêntricos para indicar distância
      ctx.strokeStyle = "#e5e7eb"
      ctx.lineWidth = 1

      // Círculos de distância (250m, 500m, 750m, 1km)
      for (let i = 1; i <= 4; i++) {
        const radius = (width / 2) * (i / 4)
        ctx.beginPath()
        ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2)
        ctx.stroke()

        // Adicionar texto de distância
        ctx.fillStyle = "#9ca3af"
        ctx.font = "12px sans-serif"
        ctx.textAlign = "center"
        ctx.fillText(`${i * 250}m`, width / 2, height / 2 - radius - 5)
      }

      // Desenhar a loja no centro
      ctx.fillStyle = "#fbbf24"
      ctx.beginPath()
      ctx.arc(width / 2, height / 2, 15, 0, Math.PI * 2)
      ctx.fill()

      // Ícone da loja
      ctx.fillStyle = "#ffffff"
      ctx.font = "14px sans-serif"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText("🏪", width / 2, height / 2)

      // Filtrar usuários com base na aba selecionada
      const filteredUsers = filterUsersByGender(mapTab)

      // Desenhar os usuários no mapa
      filteredUsers.forEach((user) => {
        // Calcular posição com base na distância e um ângulo aleatório
        const angle = Math.random() * Math.PI * 2
        const distance = user.distance * (width / 2)
        const x = width / 2 + Math.cos(angle) * distance
        const y = height / 2 + Math.sin(angle) * distance

        // Desenhar círculo para o usuário
        let gradient
        if (user.gender === "male") {
          ctx.fillStyle = "#93c5fd"
          ctx.strokeStyle = "#3b82f6"
        } else if (user.gender === "female") {
          ctx.fillStyle = "#fbcfe8"
          ctx.strokeStyle = "#ec4899"
        } else if (user.gender === "lgbt") {
          // Criar gradiente para representar arco-íris
          gradient = ctx.createLinearGradient(x - 10, y - 10, x + 10, y + 10)
          gradient.addColorStop(0, "#f87171")
          gradient.addColorStop(0.25, "#fbbf24")
          gradient.addColorStop(0.5, "#34d399")
          gradient.addColorStop(0.75, "#60a5fa")
          gradient.addColorStop(1, "#a78bfa")
          ctx.fillStyle = gradient
          ctx.strokeStyle = "#8b5cf6"
        }

        ctx.beginPath()
        ctx.arc(x, y, 10, 0, Math.PI * 2)
        ctx.fill()
        ctx.lineWidth = 2
        ctx.stroke()

        // Adicionar iniciais do usuário
        ctx.fillStyle = "#ffffff"
        ctx.font = "bold 10px sans-serif"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText(user.name.charAt(0), x, y)
      })
    }
  }

  // Função para lidar com o clique no usuário
  const handleUserClick = (user) => {
    setSelectedUser(user)
    setUserDetailOpen(true)
  }

  if (isLoading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center min-h-[80vh]">
          <div className="flex flex-col items-center">
            <div className="relative h-16 w-16 mb-4">
              <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-blue-500 opacity-20"></div>
            </div>
            <p className="text-gray-500">Carregando dados do dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Resumo de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Clientes Próximos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-blue-100 p-2">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">42</div>
                  <p className="text-xs text-green-500">+8% esta semana</p>
                </div>
              </div>
            </CardContent>
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600 w-3/4"></div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Vendas Hoje</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-green-100 p-2">
                  <ShoppingBag className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-green-500">+15% vs ontem</p>
                </div>
              </div>
            </CardContent>
            <div className="h-2 bg-gradient-to-r from-green-400 to-green-600 w-1/2"></div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Receita Mensal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-orange-100 p-2">
                  <DollarSign className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">R$ 58.450</div>
                  <p className="text-xs text-green-500">+23% vs mês anterior</p>
                </div>
              </div>
            </CardContent>
            <div className="h-2 bg-gradient-to-r from-orange-400 to-orange-600 w-5/6"></div>
          </Card>

          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Conversão Pan AI</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <div className="mr-4 rounded-full bg-purple-100 p-2">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <div className="text-2xl font-bold">24%</div>
                  <p className="text-xs text-green-500">+5% esta semana</p>
                </div>
              </div>
            </CardContent>
            <div className="h-2 bg-gradient-to-r from-purple-400 to-purple-600 w-1/4"></div>
          </Card>
        </div>

        {/* Clientes Próximos */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Clientes Próximos</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>Análise Demográfica</CardTitle>
                <CardDescription>Distribuição de clientes por gênero e idade</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="genero" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4">
                    <TabsTrigger value="genero" className="text-sm">
                      Gênero
                    </TabsTrigger>
                    <TabsTrigger value="idade" className="text-sm">
                      Idade
                    </TabsTrigger>
                    <TabsTrigger value="fidelizados" className="text-sm">
                      Fidelizados
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="genero">
                    <div className="h-[250px] flex justify-center items-center">
                      <div className="relative h-40 w-40 flex justify-center items-center">
                        <div className="relative h-40 w-40">
                          <svg viewBox="0 0 100 100" className="h-full w-full">
                            <circle cx="50" cy="50" r="40" fill="none" stroke="#f3f4f6" strokeWidth="20" />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="20"
                              strokeDasharray="138.2 251.2"
                              strokeDashoffset="0"
                              transform="rotate(-90 50 50)"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#4ade80"
                              strokeWidth="20"
                              strokeDasharray="100.5 251.2"
                              strokeDashoffset="-138.2"
                              transform="rotate(-90 50 50)"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="20"
                              strokeDasharray="12.5 251.2"
                              strokeDashoffset="-238.7"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-xs text-gray-500">Total</span>
                            <span className="text-2xl font-bold">40</span>
                            <span className="text-xs text-gray-500">Clientes</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="idade">
                    <div className="h-[250px] flex justify-center items-center">
                      <div className="w-full h-full flex items-end justify-between px-4">
                        {ageData.map((item, i) => (
                          <div key={item.name} className="flex flex-col items-center gap-1">
                            <div
                              className="w-12 bg-blue-500 rounded-t-sm"
                              style={{ height: `${(item.value / 30) * 180}px` }}
                            />
                            <span className="text-xs text-gray-500">{item.name}</span>
                            <span className="text-xs font-medium">{item.value}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="fidelizados">
                    <div className="flex justify-center items-center h-[250px]">
                      <div className="text-center">
                        <div className="relative h-32 w-32 mx-auto">
                          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                            <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="10" />
                            <circle
                              cx="50"
                              cy="50"
                              r="45"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="10"
                              strokeDasharray={`${65 * 2.83} 283`}
                              strokeDashoffset="0"
                            />
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold">65%</span>
                            <span className="text-xs text-gray-500">Fidelizados</span>
                          </div>
                        </div>
                        <p className="mt-4 text-sm text-gray-600">26 de 40 clientes são recorrentes</p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle>Mapa de Alcance</CardTitle>
                <CardDescription>Visualização de clientes em um raio de 1km</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="relative h-[350px] bg-blue-50 overflow-hidden">
                  <div className="absolute top-2 right-2 bg-white py-1 px-3 rounded-full text-xs font-medium z-10 shadow-sm">
                    Alcance de 1km
                  </div>
                  <div className="absolute inset-0 z-0">
                    <Image src="/placeholder.svg?height=350&width=600" alt="Map" fill className="object-cover" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <div className="h-10 w-10 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white shadow-lg">
                      <ShoppingBag className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -inset-4 bg-yellow-400 rounded-full opacity-10 animate-ping"></div>
                  </div>
                  {/* Simulated customer dots */}
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div
                      key={`dot-blue-${i}`}
                      className="absolute h-3 w-3 rounded-full bg-blue-500 z-5 shadow-md animate-pulse"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1}s`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={`dot-green-${i}`}
                      className="absolute h-3 w-3 rounded-full bg-green-400 z-5 shadow-md animate-pulse"
                      style={{
                        top: `${20 + Math.random() * 60}%`,
                        left: `${20 + Math.random() * 60}%`,
                        animationDelay: `${i * 0.1 + 1}s`,
                        opacity: 0.7,
                      }}
                    />
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between pt-4">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm">Masculino (23)</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <span className="text-sm">Feminino (15)</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => setMapModalOpen(true)}>
                  Ver Detalhes
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>

        {/* Rendimentos e Vendas */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Rendimentos e Vendas</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Edit className="h-4 w-4" />
                Editar Estimativas
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Baixar Tabela
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Análise Financeira</CardTitle>
                  <CardDescription>Acompanhe o desempenho financeiro ao longo do tempo</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span className="text-xs">Receita</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-green-400"></div>
                    <span className="text-xs">Estimativa</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                    <span className="text-xs">Média</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="ano" onValueChange={setActiveTab}>
                <div className="flex justify-between items-center mb-4">
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="ano" className="text-sm">
                      Ano
                    </TabsTrigger>
                    <TabsTrigger value="mes" className="text-sm">
                      Mês
                    </TabsTrigger>
                    <TabsTrigger value="semana" className="text-sm">
                      Semana
                    </TabsTrigger>
                    <TabsTrigger value="dia" className="text-sm">
                      Dia
                    </TabsTrigger>
                  </TabsList>

                  <Select defaultValue="2023" onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Selecione o ano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2023">2023</SelectItem>
                      <SelectItem value="2022">2022</SelectItem>
                      <SelectItem value="2021">2021</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="h-[300px] w-full bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-gray-400 text-sm">
                    Gráfico de análise financeira - {activeTab} {selectedYear}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Card className="p-4 border-l-4 border-l-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Rendimento Anual</span>
                    </div>
                    <div className="text-2xl font-bold">R$ 480.000,00</div>
                    <p className="text-xs text-green-500 mt-1">+12% vs ano anterior</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-green-500">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                      <span className="text-sm">Rendimento Estimado</span>
                    </div>
                    <div className="text-2xl font-bold">R$ 320.000,00</div>
                    <p className="text-xs text-green-500 mt-1">+8% vs estimativa anterior</p>
                  </Card>
                  <Card className="p-4 border-l-4 border-l-gray-300">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                      <span className="text-sm">Média Mensal</span>
                    </div>
                    <div className="text-2xl font-bold">R$ 250.000,00</div>
                    <p className="text-xs text-blue-500 mt-1">Valor de referência</p>
                  </Card>
                </div>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Pan AI Metrics */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Métricas Pan AI</h2>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push("/pan-ai")}>
              <MessageSquare className="h-4 w-4" />
              Acessar Pan AI
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {panAiMetrics.map((metric, index) => (
              <div key={metric.title}>
                <Card className={`p-4 border-l-4 ${metric.color} hover:shadow-md transition-shadow`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm text-gray-500 mb-1">{metric.title}</h3>
                      <p className="text-2xl font-bold">{metric.value}</p>
                      <p className="text-xs text-green-500">{metric.change} em relação ao mês anterior</p>
                    </div>
                    <div className="rounded-full bg-gray-100 p-3">{metric.icon}</div>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sales */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-800">Vendas Recentes</h2>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input placeholder="Buscar vendas..." className="pl-10 h-9 w-[200px]" />
              </div>
              <Button variant="outline" size="sm" className="gap-1">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </div>
          </div>

          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Data da Venda</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Nome do Item</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo de Oferta</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Código</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Valor</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Baixar Nota</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale, index) => (
                    <tr key={sale.code} className="border-b hover:bg-gray-50 cursor-pointer">
                      <td className="px-4 py-3 text-sm">{sale.date}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="line-clamp-1">{sale.name}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className="bg-blue-500">{sale.type}</Badge>
                      </td>
                      <td className="px-4 py-3 text-sm">{sale.code}</td>
                      <td className="px-4 py-3 text-sm font-medium">R$ {sale.value}</td>
                      <td className="px-4 py-3">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Download className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between px-4 py-3 border-t">
              <div className="text-sm text-gray-500">Mostrando 4 de 24 vendas</div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="default" size="icon" className="h-8 w-8 bg-blue-500">
                  1
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  2
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 py-4 border-t mt-8">Designed by REZZON</div>
      </div>

      {/* Modal do Mapa Detalhado */}
      <Dialog open={mapModalOpen} onOpenChange={setMapModalOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] p-4 overflow-hidden">
          <DialogHeader className="mb-2">
            <DialogTitle>Mapa Detalhado de Clientes Próximos</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col h-full overflow-hidden">
            <Tabs defaultValue="todos" onValueChange={setMapTab} className="w-full h-full flex flex-col">
              <div className="flex flex-wrap justify-between items-center mb-4 gap-2">
                <TabsList className="h-9">
                  <TabsTrigger value="todos">Todos</TabsTrigger>
                  <TabsTrigger value="male">Masculino</TabsTrigger>
                  <TabsTrigger value="female">Feminino</TabsTrigger>
                  <TabsTrigger value="lgbt">LGBT+</TabsTrigger>
                </TabsList>

                <div className="flex items-center gap-2 text-sm flex-wrap">
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                    <span>Masculino</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-pink-500"></div>
                    <span>Feminino</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-purple-400"></div>
                    <span>LGBT+</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-full overflow-hidden">
                {/* Mapa interativo */}
                <div className="lg:col-span-3 relative bg-blue-50 rounded-lg overflow-hidden border shadow-lg h-[calc(90vh-180px)]">
                  <canvas ref={mapCanvasRef} width={1200} height={800} className="w-full h-full"></canvas>
                  <div className="absolute top-4 right-4 bg-white py-1.5 px-4 rounded-full text-sm font-medium shadow-md">
                    Raio de 1km
                  </div>

                  {/* Controles flutuantes */}
                  <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100">
                    <div className="flex flex-col gap-2">
                      <div className="text-sm font-medium">Controles</div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => {
                            // Simular zoom in
                            const canvas = mapCanvasRef.current
                            if (canvas) {
                              const ctx = canvas.getContext("2d")
                              ctx.scale(1.1, 1.1)
                              // Redesenhar o mapa
                              drawMap()
                            }
                          }}
                        >
                          Zoom +
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-8"
                          onClick={() => {
                            // Simular zoom out
                            const canvas = mapCanvasRef.current
                            if (canvas) {
                              const ctx = canvas.getContext("2d")
                              ctx.scale(0.9, 0.9)
                              // Redesenhar o mapa
                              drawMap()
                            }
                          }}
                        >
                          Zoom -
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Estatísticas flutuantes */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm p-3 rounded-xl shadow-lg border border-gray-100 max-w-[200px]">
                    <div className="text-sm font-medium mb-1">Estatísticas Rápidas</div>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span>Clientes próximos:</span>
                        <span className="font-medium">{filterUsersByGender(mapTab).length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Visualizações:</span>
                        <span className="font-medium">{getInteractionStats().totalViews}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Contatos:</span>
                        <span className="font-medium">{getInteractionStats().totalContacts}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Painel lateral com abas */}
                <div className="lg:col-span-1 flex flex-col h-[calc(90vh-180px)] overflow-hidden">
                  <Tabs defaultValue="clientes" className="w-full h-full flex flex-col">
                    <TabsList className="grid grid-cols-2 mb-2">
                      <TabsTrigger value="clientes">Clientes</TabsTrigger>
                      <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
                    </TabsList>

                    <TabsContent value="clientes" className="flex-1 overflow-auto p-1">
                      <div className="space-y-2">
                        {filterUsersByGender(mapTab).map((user) => (
                          <div
                            key={user.id}
                            className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100 transition-colors cursor-pointer"
                            onClick={() => handleUserClick(user)}
                          >
                            <div className={`relative ${getGenderColor(user.gender)} p-0.5 rounded-full border-2`}>
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.photo} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{user.name}</p>
                              <p className="text-xs text-gray-500">
                                {user.distance * 1000}m • {user.lastSeen}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <span className="text-xs bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full">
                                  {user.interactions.viewedPanfletos} views
                                </span>
                                {user.interactions.contacted && (
                                  <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                    Contato
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="estatisticas" className="flex-1 overflow-auto">
                      <Card className="border-none shadow-none">
                        <CardContent className="p-3 space-y-4">
                          {(() => {
                            const stats = getInteractionStats()
                            return (
                              <div>
                                <div>
                                  <p className="text-sm text-gray-500">Visualizações de Panfletos</p>
                                  <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold">{stats.totalViews}</p>
                                    <p className="text-xs text-green-500">+12% esta semana</p>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                                    <div
                                      className="h-2 bg-blue-500 rounded-full"
                                      style={{ width: `${Math.min((stats.totalViews / 100) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <p className="text-sm text-gray-500">Visitas à Vitrine</p>
                                  <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold">{stats.totalVisits}</p>
                                    <p className="text-xs text-green-500">+8% esta semana</p>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                                    <div
                                      className="h-2 bg-green-500 rounded-full"
                                      style={{ width: `${Math.min((stats.totalVisits / 30) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <p className="text-sm text-gray-500">Contatos Realizados</p>
                                  <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold">{stats.totalContacts}</p>
                                    <p className="text-xs text-green-500">+15% esta semana</p>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                                    <div
                                      className="h-2 bg-orange-500 rounded-full"
                                      style={{ width: `${Math.min((stats.totalContacts / 10) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <div className="mt-4">
                                  <p className="text-sm text-gray-500">Compras Realizadas</p>
                                  <div className="flex items-end gap-2">
                                    <p className="text-2xl font-bold">{stats.totalPurchases}</p>
                                    <p className="text-xs text-green-500">+5% esta semana</p>
                                  </div>
                                  <div className="w-full h-2 bg-gray-100 rounded-full mt-1">
                                    <div
                                      className="h-2 bg-purple-500 rounded-full"
                                      style={{ width: `${Math.min((stats.totalPurchases / 5) * 100, 100)}%` }}
                                    ></div>
                                  </div>
                                </div>
                              </div>
                            )
                          })()}
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes do Usuário */}
      <Dialog open={userDetailOpen} onOpenChange={setUserDetailOpen}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {selectedUser && (
            <div className="flex flex-col">
              <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                <div className="flex items-center gap-4">
                  <div
                    className={`relative ${getGenderColor(selectedUser.gender)} p-1 rounded-full border-2 border-white`}
                  >
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
                      <AvatarImage src={selectedUser.photo} alt={selectedUser.name} />
                      <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 border-2 border-white"></span>
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold">{selectedUser.name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className="bg-white/20 hover:bg-white/30 text-white">
                        {selectedUser.distance * 1000}m de distância
                      </Badge>
                      <Badge className="bg-green-500/80 hover:bg-green-500/90 text-white">Online agora</Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 md:p-6 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Informações do Cliente */}
                  <div className="md:col-span-1">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          Informações do Cliente
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3 text-sm">
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-gray-500">Última visita:</span>
                          <span className="font-medium">{selectedUser.lastSeen}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-gray-500">Visualizações:</span>
                          <span className="font-medium">{selectedUser.interactions.viewedPanfletos}</span>
                        </div>
                        <div className="flex justify-between items-center border-b pb-2">
                          <span className="text-gray-500">Visitas à vitrine:</span>
                          <span className="font-medium">{selectedUser.interactions.vitrineVisits}</span>
                        </div>
                        {selectedUser.interactions.lastPurchase && (
                          <div className="flex justify-between items-center border-b pb-2">
                            <span className="text-gray-500">Última compra:</span>
                            <span className="font-medium">{selectedUser.interactions.lastPurchase}</span>
                          </div>
                        )}
                        <div className="mt-4 pt-2">
                          <p className="text-xs text-gray-500 mb-2">Nível de engajamento</p>
                          <div className="w-full h-2 bg-gray-100 rounded-full">
                            <div
                              className="h-2 bg-blue-500 rounded-full"
                              style={{
                                width: `${Math.min(((selectedUser.interactions.viewedPanfletos + selectedUser.interactions.vitrineVisits * 2) / 30) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between mt-1 text-xs">
                            <span>Baixo</span>
                            <span>Médio</span>
                            <span>Alto</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Panfletos e Produtos */}
                  <div className="md:col-span-2">
                    <Card className="h-full">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4" />
                          Panfletos e Produtos Visualizados
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Tabs defaultValue="panfletos" className="w-full">
                          <TabsList className="grid grid-cols-2 mb-4">
                            <TabsTrigger value="panfletos">Panfletos</TabsTrigger>
                            <TabsTrigger value="produtos">Produtos</TabsTrigger>
                          </TabsList>

                          <TabsContent value="panfletos" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[1, 2, 3, 4].map((item) => (
                                <div
                                  key={item}
                                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                  <div className="h-12 w-12 bg-blue-100 rounded-md flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-blue-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Panfleto #{item}</p>
                                    <p className="text-xs text-gray-500">Visualizado há {item * 2} dias</p>
                                  </div>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <ChevronRightIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </TabsContent>

                          <TabsContent value="produtos" className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {[1, 2, 3].map((item) => (
                                <div
                                  key={item}
                                  className="flex items-center gap-2 p-2 border rounded-md cursor-pointer hover:bg-gray-50"
                                >
                                  <div className="h-12 w-12 bg-green-100 rounded-md flex items-center justify-center">
                                    <ShoppingBag className="h-6 w-6 text-green-500" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">Produto #{item}</p>
                                    <p className="text-xs text-gray-500">R$ {(item * 50).toFixed(2)}</p>
                                  </div>
                                  <Badge className="bg-green-500">Em estoque</Badge>
                                </div>
                              ))}
                            </div>
                          </TabsContent>
                        </Tabs>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Ações */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-blue-100">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-blue-500" />
                        Enviar Notificação de Oferta
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                      <div>
                        <Select defaultValue="produto1">
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um produto" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="produto1">Tênis Casual Branco</SelectItem>
                            <SelectItem value="produto2">Cinto de Couro Preto</SelectItem>
                            <SelectItem value="produto3">Sapato Social Marrom</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2">
                        <Input type="number" placeholder="Desconto %" defaultValue="10" className="w-24" />
                        <span>% de desconto</span>
                      </div>

                      <div>
                        <Button className="w-full bg-blue-600 hover:bg-blue-700">Enviar Notificação</Button>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="overflow-hidden">
                    <CardHeader className="pb-2 bg-gradient-to-r from-green-50 to-green-100">
                      <CardTitle className="text-base flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        Gerar Cupom Personalizado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 p-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Valor do Desconto</label>
                          <Input type="number" placeholder="Valor" defaultValue="15" />
                        </div>
                        <div>
                          <label className="text-xs text-gray-500 mb-1 block">Validade (dias)</label>
                          <Input type="number" placeholder="Dias" defaultValue="7" />
                        </div>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-md text-center">
                        <p className="text-xs text-gray-500">Código do Cupom</p>
                        <p className="text-lg font-mono font-bold tracking-wider">CLIENTE{selectedUser.id}15OFF</p>
                      </div>

                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Button className="w-full bg-green-600 hover:bg-green-700">Enviar por Email</Button>
                        </div>
                        <div className="flex-1">
                          <Button className="w-full" variant="outline">
                            Enviar por SMS
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

