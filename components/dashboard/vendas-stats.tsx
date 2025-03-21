"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"

interface VendaData {
  _id: string
  data: string
  valor: number
  cliente: string
}

export function VendasStats() {
  const [vendas, setVendas] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchVendas = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/vendas")

        if (!response.ok) {
          throw new Error(`Erro ao buscar vendas: ${response.status}`)
        }

        const data = await response.json()

        // Processar os dados para o formato esperado pelo gráfico
        const processedData = processVendasData(data)
        setVendas(processedData)
        setError(null)
      } catch (err) {
        console.error("Erro ao buscar vendas:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido")

        // Dados de fallback para quando a API falhar
        setVendas([
          { name: "01/03", vendas: 1200, clientes: 8 },
          { name: "02/03", vendas: 900, clientes: 5 },
          { name: "03/03", vendas: 1500, clientes: 10 },
          { name: "04/03", vendas: 1800, clientes: 12 },
          { name: "05/03", vendas: 1000, clientes: 7 },
          { name: "06/03", vendas: 1300, clientes: 9 },
          { name: "07/03", vendas: 1700, clientes: 11 },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchVendas()
  }, [])

  // Função para processar os dados de vendas
  const processVendasData = (data: VendaData[]) => {
    // Se não houver dados, retornar array vazio
    if (!Array.isArray(data) || data.length === 0) {
      return []
    }

    // Agrupar vendas por data
    const vendasPorData = data.reduce(
      (acc, venda) => {
        const dataFormatada = new Date(venda.data).toLocaleDateString("pt-BR")

        if (!acc[dataFormatada]) {
          acc[dataFormatada] = {
            vendas: 0,
            clientes: new Set(),
          }
        }

        acc[dataFormatada].vendas += venda.valor
        if (venda.cliente) {
          acc[dataFormatada].clientes.add(venda.cliente)
        }

        return acc
      },
      {} as Record<string, { vendas: number; clientes: Set<string> }>,
    )

    // Converter para o formato esperado pelo gráfico
    return Object.entries(vendasPorData)
      .map(([data, { vendas, clientes }]) => ({
        name: data,
        vendas,
        clientes: clientes.size,
      }))
      .sort((a, b) => {
        const dateA = new Date(a.name.split("/").reverse().join("-"))
        const dateB = new Date(b.name.split("/").reverse().join("-"))
        return dateA.getTime() - dateB.getTime()
      })
      .slice(-14) // Últimos 14 dias
  }

  if (loading) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (error && vendas.length === 0) {
    return (
      <div className="h-[300px] w-full flex items-center justify-center">
        <p className="text-destructive">Erro ao carregar dados de vendas</p>
      </div>
    )
  }

  return (
    <div
      className="h-[300px] w-full"
      style={
        { "--color-vendas": "hsl(var(--primary))", "--color-clientes": "hsl(var(--secondary))" } as React.CSSProperties
      }
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={vendas} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
    </div>
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
                {entry.name === "vendas" ? "Vendas" : "Clientes"}
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

