"use client"

import { useState } from "react"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Download, Edit, MessageSquare, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

interface SaleRowProps {
  date: string
  name: string
  type: string
  code: string
  value: string
}

export function DashboardContent() {
  const [activeTab, setActiveTab] = useState("ano")
  const router = useRouter()

  return (
    <>
      {/* Nearby Customers Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Clientes Próximos</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
              <Tabs defaultValue="genero">
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
                  <div className="flex justify-center mb-4">
                    <DonutChart />
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                        <span>Masculino</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">23</span>
                        <span className="text-gray-500 text-sm">(55%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-green-400"></div>
                        <span>Feminino</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">15</span>
                        <span className="text-gray-500 text-sm">(40%)</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-gray-200"></div>
                        <span>Outros</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">2</span>
                        <span className="text-gray-500 text-sm">(5%)</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
          <div className="relative h-[300px] bg-blue-100 rounded-lg overflow-hidden">
            <div className="absolute top-2 right-2 bg-white py-1 px-3 rounded-full text-xs font-medium z-10">
              Alcance de 1km
            </div>
            <div className="absolute inset-0 z-0">
              <Image src="/placeholder.svg?height=300&width=500" alt="Map" fill className="object-cover" />
            </div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
              <div className="h-8 w-8 rounded-full bg-yellow-400 flex items-center justify-center border-2 border-white">
                <ShoppingBag className="h-4 w-4 text-white" />
              </div>
            </div>
            {/* Simulated customer dots */}
            {Array.from({ length: 20 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-blue-500 z-5"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  opacity: 0.7,
                }}
              />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="absolute h-2 w-2 rounded-full bg-green-400 z-5"
                style={{
                  top: `${20 + Math.random() * 60}%`,
                  left: `${20 + Math.random() * 60}%`,
                  opacity: 0.7,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Income and Sales Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Rendimentos e Vendas</h2>
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

        <div className="bg-white rounded-lg shadow-sm p-4">
          <Tabs defaultValue="ano" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-4">
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

            <div className="mb-4">
              <Select defaultValue="2023">
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Selecione o ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2023">2023</SelectItem>
                  <SelectItem value="2022">2022</SelectItem>
                  <SelectItem value="2021">2021</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="h-[200px] mb-4 relative">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm text-gray-400">
                {activeTab === "ano" && "Gráfico de Rendimentos Anuais"}
                {activeTab === "mes" && "Gráfico de Rendimentos Mensais"}
                {activeTab === "semana" && "Gráfico de Rendimentos Semanais"}
                {activeTab === "dia" && "Gráfico de Rendimentos Diários"}
              </div>
              <BarChart />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-4 border-l-4 border-l-green-400">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-green-400"></div>
                  <span className="text-sm">Rendimento Anual</span>
                </div>
                <div className="text-2xl font-bold">R$ 480.000,00</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Rendimento Estimado</span>
                </div>
                <div className="text-2xl font-bold">R$ 320.000,00</div>
              </Card>
              <Card className="p-4 border-l-4 border-l-gray-300">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300"></div>
                  <span className="text-sm">Média Mensal</span>
                </div>
                <div className="text-2xl font-bold">R$ 250.000,00</div>
              </Card>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Pan AI Metrics Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Métricas Pan AI</h2>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => router.push("/pan-ai")}>
            <MessageSquare className="h-4 w-4" />
            Acessar Pan AI
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 border-l-4 border-l-blue-500">
            <h3 className="text-sm text-gray-500 mb-1">Mensagens Enviadas</h3>
            <p className="text-2xl font-bold">1,234</p>
            <p className="text-xs text-green-500">+12% em relação ao mês anterior</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-green-400">
            <h3 className="text-sm text-gray-500 mb-1">Taxa de Resposta</h3>
            <p className="text-2xl font-bold">87%</p>
            <p className="text-xs text-green-500">+5% em relação ao mês anterior</p>
          </Card>
          <Card className="p-4 border-l-4 border-l-orange-400">
            <h3 className="text-sm text-gray-500 mb-1">Conversões</h3>
            <p className="text-2xl font-bold">342</p>
            <p className="text-xs text-green-500">+18% em relação ao mês anterior</p>
          </Card>
        </div>
      </div>

      {/* Recent Sales Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-700">Vendas Recentes</h2>
          <Button variant="outline" size="sm">
            Ver Tabela Completa
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
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
                <SaleRow
                  date="18/11/2023"
                  name="Cinto de Couro na cor preta com fivela em aço escovado"
                  type="PANFLETO"
                  code="#1233213"
                  value="85,80"
                />
                <SaleRow
                  date="18/11/2023"
                  name="Tênis Branco Casual Masculino em Couro Genuíno com Cadarço"
                  type="PANFLETO"
                  code="#1233213"
                  value="159,90"
                />
                <SaleRow
                  date="18/11/2023"
                  name="Sapato Oxford Clássico Marrom de Couro com Cadarço"
                  type="PANFLETO"
                  code="#1233213"
                  value="199,90"
                />
                <SaleRow
                  date="18/11/2023"
                  name="Tênis Esportivo High-End EliteSport Pro Runner"
                  type="PANFLETO"
                  code="#1233213"
                  value="115,90"
                />
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-center mt-4">
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
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </>
  )
}

// Components
function DonutChart() {
  return (
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
  )
}

function BarChart() {
  const months = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]

  return (
    <div className="h-full w-full flex items-end justify-between px-4">
      {months.map((month, i) => (
        <div key={month} className="flex flex-col items-center gap-1">
          <div className="flex gap-1">
            <div className="w-4 bg-green-400 rounded-t-sm" style={{ height: `${30 + Math.random() * 70}px` }} />
            <div className="w-4 bg-blue-400 rounded-t-sm" style={{ height: `${30 + Math.random() * 70}px` }} />
          </div>
          <span className="text-xs text-gray-500">{month}</span>
        </div>
      ))}
    </div>
  )
}

function SaleRow({ date, name, type, code, value }: SaleRowProps) {
  return (
    <tr className="border-b hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{date}</td>
      <td className="px-4 py-3 text-sm">
        <div className="line-clamp-1">{name}</div>
      </td>
      <td className="px-4 py-3">
        <Badge className="bg-blue-500">{type}</Badge>
      </td>
      <td className="px-4 py-3 text-sm">{code}</td>
      <td className="px-4 py-3 text-sm font-medium">R$ {value}</td>
      <td className="px-4 py-3">
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <Download className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  )
}

