"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Download } from "lucide-react"
import { VendasTable } from "./vendas-table"
import { VendasChart } from "./vendas-chart"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Venda {
  id: string
  customer: string
  product: string
  amount: number
  status: "completed" | "pending" | "canceled"
  date: string
}

export function VendasList() {
  const [vendas, setVendas] = useState<Venda[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        const response = await fetch("/api/vendas")
        if (!response.ok) {
          throw new Error("Falha ao carregar vendas")
        }
        const data = await response.json()
        setVendas(data)
      } catch (error) {
        console.error("Erro ao carregar vendas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar suas vendas. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendas()
  }, [toast])

  const filteredVendas = vendas.filter((venda) => {
    const matchesSearch =
      venda.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venda.product.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || venda.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleExportCSV = () => {
    // Implementação futura de exportação para CSV
    toast({
      title: "Exportação iniciada",
      description: "Suas vendas estão sendo exportadas para CSV.",
    })
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="list">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <TabsList>
            <TabsTrigger value="list">Lista</TabsTrigger>
            <TabsTrigger value="chart">Gráfico</TabsTrigger>
          </TabsList>

          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar vendas..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="completed">Concluído</SelectItem>
                <SelectItem value="pending">Pendente</SelectItem>
                <SelectItem value="canceled">Cancelado</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        <TabsContent value="list">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full max-w-md" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : filteredVendas.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Vendas</CardTitle>
                <CardDescription>Visualize e gerencie todas as suas vendas.</CardDescription>
              </CardHeader>
              <CardContent>
                <VendasTable vendas={filteredVendas} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Nenhuma venda encontrada</CardTitle>
                <CardDescription>
                  {searchQuery || statusFilter !== "all"
                    ? "Nenhuma venda corresponde aos filtros aplicados."
                    : "Você ainda não realizou nenhuma venda."}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {searchQuery || statusFilter !== "all"
                    ? "Tente ajustar os filtros para ver mais resultados."
                    : "Quando você realizar vendas, elas aparecerão aqui."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="chart">
          {isLoading ? (
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-full max-w-md" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-[350px] w-full" />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Análise de Vendas</CardTitle>
                <CardDescription>Visualize o desempenho das suas vendas ao longo do tempo.</CardDescription>
              </CardHeader>
              <CardContent>
                <VendasChart vendas={vendas} />
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}

