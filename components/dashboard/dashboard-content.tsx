"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/admin/stats-card"
import { PanfletosPorCategoria } from "@/components/dashboard/panfletos-por-categoria"
import { PanfletosPorMes } from "@/components/dashboard/panfletos-por-mes"
import { CampanhasPerformance } from "./campanhas-performace"
import { ClientesAtivos } from "@/components/dashboard/clientes-ativos"
import { useEstatisticas } from "@/hooks/use-estatisticas"
import { TipsCard } from "@/components/dashboard/tips-card"
import { PlanoInfoCard } from "@/components/dashboard/plano-info-card"
import { UserLocationCard } from "@/components/dashboard/user-location-card"
import { RecentActivityCard } from "@/components/dashboard/recent-activity-card"
import { VitrineCheck } from "@/components/vitrine/vitrine-check"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface DashboardContentProps {
  userName: string
}

export function DashboardContent({ userName }: DashboardContentProps) {
  const { estatisticas, isLoading, error } = useEstatisticas()
  const [errorVisible, setErrorVisible] = useState(true)

  useEffect(() => {
    if (error) {
      // Esconder o erro após 10 segundos
      const timer = setTimeout(() => {
        setErrorVisible(false)
      }, 10000)

      return () => clearTimeout(timer)
    }
  }, [error])

  const hoje = new Date()
  const dataFormatada = format(hoje, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-900 -mx-6 -mt-6 px-6 py-8 rounded-b-lg">
        <h1 className="text-2xl font-bold text-white">Bem-vindo, {userName}!</h1>
        <p className="text-blue-200">{dataFormatada}</p>
      </div>

      {error && errorVisible && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Usando dados de exemplo devido a um erro de conexão com o servidor.
            <button className="ml-2 text-sm underline" onClick={() => setErrorVisible(false)}>
              Fechar
            </button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="visao-geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
        </TabsList>
        <TabsContent value="visao-geral" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Total de Vendas"
              value={estatisticas?.geral?.totalVendas || 0}
              description="Nos últimos 30 dias"
              loading={isLoading}
              icon="receipt"
            />
            <StatsCard
              title="Faturamento"
              value={`R$ ${(estatisticas?.geral?.faturamentoTotal || 0).toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              description="Nos últimos 30 dias"
              loading={isLoading}
              icon="dollar"
            />
            <StatsCard
              title="Clientes"
              value={estatisticas?.clientes?.total || 0}
              description="Total de clientes cadastrados"
              loading={isLoading}
              icon="users"
            />
            <StatsCard
              title="Panfletos"
              value={estatisticas?.panfletos?.total || 0}
              description="Total de panfletos criados"
              loading={isLoading}
              icon="files"
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Vendas por Dia</CardTitle>
              </CardHeader>
              <CardContent>
                <PanfletosPorMes data={estatisticas?.panfletos?.porMes || []} loading={isLoading} />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Vendas por Status</CardTitle>
              </CardHeader>
              <CardContent>
                <CampanhasPerformance data={estatisticas?.campanhas?.performance || []} loading={isLoading} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <VitrineCheck />
            <PlanoInfoCard />
            <TipsCard />
          </div>
        </TabsContent>
        <TabsContent value="analises" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Panfletos por Categoria</CardTitle>
              </CardHeader>
              <CardContent>
                <PanfletosPorCategoria data={estatisticas?.panfletos?.porCategoria || []} loading={isLoading} />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Clientes Ativos</CardTitle>
              </CardHeader>
              <CardContent>
                <ClientesAtivos data={estatisticas?.clientes?.ativos || []} loading={isLoading} />
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <UserLocationCard />
            <RecentActivityCard className="col-span-2" />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
