"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowUpRight, ArrowDownRight, Download, Filter, ShoppingCart, CreditCard, Users, Percent } from "lucide-react"

export function VendasContent() {
  const [dateRange, setDateRange] = useState("30dias")

  // Dados simulados para os vendedores
  const vendedores = [
    { id: 1, nome: "Ana Silva", vendas: 42, valor: 38500, comissao: 3850, taxa: "10%", status: "ativo" },
    { id: 2, nome: "Carlos Oliveira", vendas: 38, valor: 32000, comissao: 3200, taxa: "10%", status: "ativo" },
    { id: 3, nome: "Mariana Santos", vendas: 35, valor: 29800, comissao: 2980, taxa: "10%", status: "ativo" },
    { id: 4, nome: "Roberto Almeida", vendas: 31, valor: 26500, comissao: 2650, taxa: "10%", status: "ativo" },
    { id: 5, nome: "Juliana Costa", vendas: 28, valor: 23200, comissao: 2320, taxa: "10%", status: "ativo" },
  ]

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Vendas e Comissões</h1>
          <p className="text-gray-500">Acompanhe o desempenho de vendas e comissões da sua loja</p>
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7dias">Últimos 7 dias</SelectItem>
              <SelectItem value="30dias">Últimos 30 dias</SelectItem>
              <SelectItem value="90dias">Últimos 90 dias</SelectItem>
              <SelectItem value="anual">Este ano</SelectItem>
              <SelectItem value="personalizado">Personalizado</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>

          <Button variant="outline" className="gap-2 ml-auto">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Vendas Totais</p>
                  <h3 className="text-2xl font-bold">R$ 325.890</h3>
                  <div className="flex items-center mt-1 text-emerald-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>12.5% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-emerald-100 p-3 rounded-full">
                  <ShoppingCart className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Comissões</p>
                  <h3 className="text-2xl font-bold">R$ 32.589</h3>
                  <div className="flex items-center mt-1 text-emerald-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>8.3% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-indigo-100 p-3 rounded-full">
                  <Percent className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Ticket Médio</p>
                  <h3 className="text-2xl font-bold">R$ 189,50</h3>
                  <div className="flex items-center mt-1 text-emerald-600 text-sm">
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                    <span>5.2% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-amber-100 p-3 rounded-full">
                  <CreditCard className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">Novos Clientes</p>
                  <h3 className="text-2xl font-bold">128</h3>
                  <div className="flex items-center mt-1 text-red-600 text-sm">
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                    <span>3.1% vs mês anterior</span>
                  </div>
                </div>
                <div className="bg-blue-100 p-3 rounded-full">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="vendas" className="mb-6">
            <TabsList className="mb-4">
              <TabsTrigger value="vendas">Vendas</TabsTrigger>
              <TabsTrigger value="comissoes">Comissões</TabsTrigger>
              <TabsTrigger value="metodos">Métodos de Pagamento</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
            </TabsList>

            <TabsContent value="vendas">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Vendas</CardTitle>
                  <CardDescription>Evolução das vendas nos últimos 12 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">Gráfico de histórico de vendas</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="comissoes">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Comissões</CardTitle>
                  <CardDescription>Evolução das comissões nos últimos 12 meses</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">Gráfico de histórico de comissões</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metodos">
              <Card>
                <CardHeader>
                  <CardTitle>Métodos de Pagamento</CardTitle>
                  <CardDescription>Distribuição de vendas por método de pagamento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">Gráfico de métodos de pagamento</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="produtos">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos Mais Vendidos</CardTitle>
                  <CardDescription>Top 5 produtos com maior volume de vendas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px] bg-gray-50 rounded-lg flex items-center justify-center">
                    <div className="text-gray-400">Gráfico de produtos mais vendidos</div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Desempenho de Vendedores</CardTitle>
              <CardDescription>Ranking de vendedores por volume de vendas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium">Vendedor</th>
                      <th className="text-left py-3 px-4 font-medium">Vendas</th>
                      <th className="text-left py-3 px-4 font-medium">Valor Total</th>
                      <th className="text-left py-3 px-4 font-medium">Comissão</th>
                      <th className="text-left py-3 px-4 font-medium">Taxa</th>
                      <th className="text-left py-3 px-4 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {vendedores.map((vendedor) => (
                      <tr key={vendedor.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{vendedor.nome}</td>
                        <td className="py-3 px-4">{vendedor.vendas}</td>
                        <td className="py-3 px-4">R$ {vendedor.valor.toLocaleString()}</td>
                        <td className="py-3 px-4">R$ {vendedor.comissao.toLocaleString()}</td>
                        <td className="py-3 px-4">{vendedor.taxa}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                            {vendedor.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

