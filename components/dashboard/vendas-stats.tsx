"use client"

import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartContainer } from "@/components/ui/chart"

// Dados simulados de vendas
const data = [
  { name: "01/03", vendas: 1200, clientes: 8 },
  { name: "02/03", vendas: 900, clientes: 5 },
  { name: "03/03", vendas: 1500, clientes: 10 },
  { name: "04/03", vendas: 1800, clientes: 12 },
  { name: "05/03", vendas: 1000, clientes: 7 },
  { name: "06/03", vendas: 1300, clientes: 9 },
  { name: "07/03", vendas: 1700, clientes: 11 },
  { name: "08/03", vendas: 1400, clientes: 8 },
  { name: "09/03", vendas: 2000, clientes: 14 },
  { name: "10/03", vendas: 1600, clientes: 10 },
  { name: "11/03", vendas: 1900, clientes: 13 },
  { name: "12/03", vendas: 2200, clientes: 15 },
  { name: "13/03", vendas: 1800, clientes: 12 },
  { name: "14/03", vendas: 2100, clientes: 14 },
]

export function VendasStats() {
  return (
    <ChartContainer
      config={{
        vendas: {
          label: "Vendas (R$)",
          color: "hsl(var(--chart-1))",
        },
        clientes: {
          label: "Clientes",
          color: "hsl(var(--chart-2))",
        },
      }}
      className="h-[300px]"
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
          <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} tickMargin={10} />
          <YAxis
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tickFormatter={(value) => `R$${value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="vendas"
            stroke="var(--color-vendas)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="clientes"
            stroke="var(--color-clientes)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}

// Componente personalizado para o tooltip
function CustomTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">Data</span>
            <span className="font-bold text-foreground">{label}</span>
          </div>
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground" style={{ color: entry.color }}>
                {entry.name}
              </span>
              <span className="font-bold">{entry.name === "vendas" ? `R$${entry.value}` : entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    )
  }
  return null
}

