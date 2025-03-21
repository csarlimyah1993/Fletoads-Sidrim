"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Filter, ShoppingCart, Download, ArrowUpDown } from "lucide-react"
import { CalendarDateRangePicker } from "@/components/dashboard/date-range-picker"
import { PlanUpgradeBanner } from "@/components/planos/plan-upgrade-banner"

export default function VendasPage() {
  const [searchTerm, setSearchTerm] = useState("")

  // Dados simulados de vendas
  const vendas = [
    { id: "ORD-001", cliente: "João Silva", data: "15/03/2023", valor: 149.9, status: "concluido" },
    { id: "ORD-002", cliente: "Maria Oliveira", data: "14/03/2023", valor: 299.8, status: "concluido" },
    { id: "ORD-003", cliente: "Pedro Santos", data: "12/03/2023", valor: 89.9, status: "cancelado" },
    { id: "ORD-004", cliente: "Ana Souza", data: "10/03/2023", valor: 499.9, status: "concluido" },
    { id: "ORD-005", cliente: "Carlos Ferreira", data: "08/03/2023", valor: 129.9, status: "pendente" },
  ]

  const filteredVendas = vendas.filter(
    (venda) =>
      venda.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      venda.id.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PlanUpgradeBanner />

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Vendas</h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <CalendarDateRangePicker />
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total de Vendas</CardTitle>
            <CardDescription>Período atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 1.169,40</div>
            <p className="text-xs text-muted-foreground mt-1">+12.5% em relação ao período anterior</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Número de Pedidos</CardTitle>
            <CardDescription>Período atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">5</div>
            <p className="text-xs text-muted-foreground mt-1">+2 em relação ao período anterior</p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Ticket Médio</CardTitle>
            <CardDescription>Período atual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">R$ 233,88</div>
            <p className="text-xs text-muted-foreground mt-1">-5.2% em relação ao período anterior</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Vendas</CardTitle>
          <CardDescription>Visualize e gerencie todas as suas vendas.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar por cliente ou número do pedido..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
              <span className="sr-only">Filtrar</span>
            </Button>
          </div>

          <Tabs defaultValue="todos">
            <TabsList className="mb-4">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="concluidos">Concluídos</TabsTrigger>
              <TabsTrigger value="pendentes">Pendentes</TabsTrigger>
              <TabsTrigger value="cancelados">Cancelados</TabsTrigger>
            </TabsList>

            <TabsContent value="todos">
              <div className="rounded-md border">
                <div className="grid grid-cols-5 p-4 font-medium border-b">
                  <div className="flex items-center gap-1">
                    Pedido
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    Cliente
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    Data
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    Valor
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-1">
                    Status
                    <Button variant="ghost" size="icon" className="h-4 w-4 ml-1">
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                {filteredVendas.length > 0 ? (
                  filteredVendas.map((venda) => (
                    <div key={venda.id} className="grid grid-cols-5 p-4 border-b last:border-0 hover:bg-muted/50">
                      <div className="font-medium">{venda.id}</div>
                      <div>{venda.cliente}</div>
                      <div>{venda.data}</div>
                      <div>R$ {venda.valor.toFixed(2).replace(".", ",")}</div>
                      <div>
                        <div
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            venda.status === "concluido"
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                              : venda.status === "pendente"
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                        >
                          {venda.status === "concluido"
                            ? "Concluído"
                            : venda.status === "pendente"
                              ? "Pendente"
                              : "Cancelado"}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium">Nenhuma venda encontrada</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {searchTerm
                        ? `Não encontramos vendas com "${searchTerm}"`
                        : "Você ainda não registrou nenhuma venda"}
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="concluidos">{/* Conteúdo similar para vendas concluídas */}</TabsContent>

            <TabsContent value="pendentes">{/* Conteúdo similar para vendas pendentes */}</TabsContent>

            <TabsContent value="cancelados">{/* Conteúdo similar para vendas canceladas */}</TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

