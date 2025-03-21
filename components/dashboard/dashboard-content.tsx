"use client"

import { useState, useEffect } from "react"
import { Overview } from "./overview"
import { RecentSales } from "./recent-sales"
import { ResourceLimitsCard } from "./resource-limits-card"
import { PlanUpgradeBanner } from "./plan-upgrade-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface DashboardData {
  totalViews: number
  totalClicks: number
  totalSales: number
  conversionRate: number
  viewsData: { name: string; total: number }[]
  clicksData: { name: string; total: number }[]
  recentSales: {
    id: string
    customer: string
    amount: number
    status: string
    date: string
  }[]
}

export function DashboardContent() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/dashboard")
        if (!response.ok) {
          throw new Error("Falha ao carregar dados do dashboard")
        }
        const dashboardData = await response.json()
        setData(dashboardData)
      } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [toast])

  if (isLoading) {
    return <DashboardSkeleton />
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-10">
            <h3 className="text-lg font-medium">Dados não disponíveis</h3>
            <p className="text-sm text-muted-foreground mt-2">
              Não foi possível carregar os dados do dashboard. Tente novamente mais tarde.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <PlanUpgradeBanner />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Visualizações</CardTitle>
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
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+20.1% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Cliques</CardTitle>
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
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalClicks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">+15% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Conversão</CardTitle>
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
              <rect width="20" height="14" x="2" y="5" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.conversionRate.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">+7% em relação ao mês anterior</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Vendas</CardTitle>
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
            <div className="text-2xl font-bold">
              R$ {data.totalSales.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">+12% em relação ao mês anterior</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Visão Geral</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <Overview data={data.viewsData} />
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Vendas Recentes</CardTitle>
            <CardDescription>Você fez {data.recentSales.length} vendas recentemente.</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentSales sales={data.recentSales} />
          </CardContent>
        </Card>
      </div>

      <ResourceLimitsCard />
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-[180px] w-full" />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array(4)
          .fill(0)
          .map((_, i) => (
            <Skeleton key={i} className="h-[120px]" />
          ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Skeleton className="h-[300px] col-span-4" />
        <Skeleton className="h-[300px] col-span-3" />
      </div>

      <Skeleton className="h-[200px] w-full" />
    </div>
  )
}

