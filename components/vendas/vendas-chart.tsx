"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

interface Venda {
  id: string
  customer: string
  product: string
  amount: number
  status: "completed" | "pending" | "canceled"
  date: string
}

interface VendasChartProps {
  vendas: Venda[]
}

export function VendasChart({ vendas }: VendasChartProps) {
  const [period, setPeriod] = useState("7d")

  // Função para agrupar vendas por data
  const groupVendasByDate = (days: number) => {
    const today = new Date()
    const startDate = new Date()
    startDate.setDate(today.getDate() - days)

    // Criar um objeto com todas as datas no período
    const dateRange: Record<string, { date: string; total: number }> = {}
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      const dateStr = date.toISOString().split("T")[0]
      dateRange[dateStr] = { date: dateStr, total: 0 }
    }

    // Somar vendas por data
    vendas.forEach((venda) => {
      const vendaDate = venda.date.split("T")[0]
      if (dateRange[vendaDate] && venda.status === "completed") {
        dateRange[vendaDate].total += venda.amount
      }
    })

    // Converter para array para o gráfico
    return Object.values(dateRange)
  }

  const chartData = {
    "7d": groupVendasByDate(7),
    "30d": groupVendasByDate(30),
    "90d": groupVendasByDate(90),
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Tabs defaultValue="7d" value={period} onValueChange={setPeriod}>
          <div className="flex justify-between items-center">
            <TabsList>
              <TabsTrigger value="7d">7 dias</TabsTrigger>
              <TabsTrigger value="30d">30 dias</TabsTrigger>
              <TabsTrigger value="90d">90 dias</TabsTrigger>
            </TabsList>
          </div>
          <TabsContent value={period} className="mt-6">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={chartData[period as keyof typeof chartData]}>
                <XAxis dataKey="date" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip
                  formatter={(value: number) => [`R$${value.toFixed(2)}`, "Total"]}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    borderColor: "hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

