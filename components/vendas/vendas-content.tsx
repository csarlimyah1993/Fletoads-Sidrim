"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart2, ShoppingCart, TrendingUp, DollarSign } from "lucide-react"
import { usePlanFeatures } from "@/hooks/use-plan-features"

export function VendasContent() {
  const { data: session } = useSession()
  const { hasFeature } = usePlanFeatures()
  const [vendas, setVendas] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchVendas() {
      try {
        setLoading(true)
        const response = await fetch("/api/vendas")
        if (!response.ok) {
          throw new Error("Falha ao carregar vendas")
        }
        const data = await response.json()
        setVendas(data.vendas || [])
      } catch (err) {
        console.error("Erro ao buscar vendas:", err)
        setError("Não foi possível carregar as vendas. Tente novamente mais tarde.")
      } finally {
        setLoading(false)
      }
    }

    fetchVendas()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-10 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Vendas</h1>
        <Card>
          <CardContent className="p-6">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Vendas</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendas Totais</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 4.250,00</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">42</div>
            <p className="text-xs text-muted-foreground">+12.5% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 101,19</div>
            <p className="text-xs text-muted-foreground">+6.7% em relação ao mês passado</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversão</CardTitle>
            <BarChart2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">+1.1% em relação ao mês passado</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos os Pedidos</TabsTrigger>
          <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
          <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
          <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Pedidos</CardTitle>
              <CardDescription>Lista de todos os pedidos recebidos</CardDescription>
            </CardHeader>
            <CardContent>
              {vendas.length > 0 ? (
                <div className="rounded-md border">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ID
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Cliente
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {/* Dados de exemplo - seriam substituídos pelos dados reais */}
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">#1001</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">João Silva</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">15/03/2023</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">R$ 125,00</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100">
                            Concluído
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">#1002</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">Maria Oliveira</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">16/03/2023</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">R$ 89,90</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-100">
                            Pendente
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">#1003</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">Carlos Pereira</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">17/03/2023</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">R$ 210,50</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100">
                            Cancelado
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-6">Nenhuma venda encontrada.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conteúdo similar para as outras abas */}
        <TabsContent value="pendentes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Pendentes</CardTitle>
              <CardDescription>Lista de pedidos aguardando processamento</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6">Nenhum pedido pendente encontrado.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="concluidos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Concluídos</CardTitle>
              <CardDescription>Lista de pedidos finalizados com sucesso</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6">Nenhum pedido concluído encontrado.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="cancelados" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Cancelados</CardTitle>
              <CardDescription>Lista de pedidos que foram cancelados</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-6">Nenhum pedido cancelado encontrado.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

