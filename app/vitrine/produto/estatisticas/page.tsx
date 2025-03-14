"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Eye, ShoppingCart, ArrowUpRight, ArrowDownRight, TrendingUp, Users, Calendar } from "lucide-react"
import { useState } from "react"

export default function ProdutoEstatisticasPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")
  const [periodo, setPeriodo] = useState("30dias")

  // Dados para os gráficos
  const labels = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul"]

  // Dados para os cards de estatísticas
  const estatisticas = [
    {
      titulo: "Visualizações",
      valor: "4.580",
      variacao: "+12.5%",
      positivo: true,
      icone: Eye,
    },
    {
      titulo: "Vendas",
      valor: "125",
      variacao: "+8.2%",
      positivo: true,
      icone: ShoppingCart,
    },
    {
      titulo: "Taxa de Conversão",
      valor: "2.7%",
      variacao: "-0.3%",
      positivo: false,
      icone: TrendingUp,
    },
    {
      titulo: "Clientes Únicos",
      valor: "3.210",
      variacao: "+5.1%",
      positivo: true,
      icone: Users,
    },
  ]

  if (!produtoId) {
    return <div className="p-4">Nenhum produto selecionado</div>
  }

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-4rem)]">
        <VitrineSidebar />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <h1 className="text-2xl font-bold">Estatísticas do Produto</h1>

              <div className="flex items-center gap-2">
                <Select value={periodo} onValueChange={setPeriodo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Selecione o período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7dias">Últimos 7 dias</SelectItem>
                    <SelectItem value="30dias">Últimos 30 dias</SelectItem>
                    <SelectItem value="90dias">Últimos 90 dias</SelectItem>
                    <SelectItem value="12meses">Últimos 12 meses</SelectItem>
                  </SelectContent>
                </Select>

                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Personalizar
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {estatisticas.map((estatistica, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500">{estatistica.titulo}</p>
                        <h3 className="text-2xl font-bold mt-1">{estatistica.valor}</h3>
                        <div
                          className={`flex items-center mt-1 text-sm ${estatistica.positivo ? "text-green-600" : "text-red-600"}`}
                        >
                          {estatistica.positivo ? (
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1" />
                          )}
                          <span>{estatistica.variacao}</span>
                        </div>
                      </div>
                      <div className="bg-blue-100 p-2 rounded-md">
                        <estatistica.icone className="h-5 w-5 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Tabs defaultValue="visitas" className="space-y-4">
              <TabsList>
                <TabsTrigger value="visitas">Visualizações</TabsTrigger>
                <TabsTrigger value="vendas">Vendas</TabsTrigger>
                <TabsTrigger value="conversao">Taxa de Conversão</TabsTrigger>
              </TabsList>

              <TabsContent value="visitas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Visualizações do Produto</CardTitle>
                    <CardDescription>
                      Número de vezes que o produto foi visualizado no período selecionado.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400">Gráfico de visualizações do produto</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vendas" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vendas do Produto</CardTitle>
                    <CardDescription>Quantidade de unidades vendidas no período selecionado.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400">Gráfico de vendas do produto</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="conversao" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Taxa de Conversão</CardTitle>
                    <CardDescription>Porcentagem de visualizações que resultaram em vendas.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                      <div className="text-gray-400">Gráfico de taxa de conversão</div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}

