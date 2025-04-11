"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

interface OverviewData {
  name: string
  usuarios: number
  lojas: number
  panfletos: number
}

export function AdminOverview() {
  const [data, setData] = useState<OverviewData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulando uma chamada de API
    const fetchData = async () => {
      try {
        // Em um cenário real, você faria uma chamada de API aqui
        // const response = await fetch('/api/admin/overview')
        // const result = await response.json()

        // Dados simulados
        const mockData = [
          { name: "Jan", usuarios: 120, lojas: 45, panfletos: 240 },
          { name: "Fev", usuarios: 150, lojas: 60, panfletos: 320 },
          { name: "Mar", usuarios: 180, lojas: 75, panfletos: 450 },
          { name: "Abr", usuarios: 220, lojas: 90, panfletos: 520 },
          { name: "Mai", usuarios: 280, lojas: 110, panfletos: 650 },
          { name: "Jun", usuarios: 350, lojas: 130, panfletos: 780 },
        ]

        setData(mockData)
      } catch (error) {
        console.error("Erro ao buscar dados:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <Card>
      <CardContent className="p-0">
        <ResponsiveContainer width="100%" height={350}>
          <LineChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="usuarios" stroke="#8884d8" name="Usuários" activeDot={{ r: 8 }} />
            <Line type="monotone" dataKey="lojas" stroke="#82ca9d" name="Lojas" />
            <Line type="monotone" dataKey="panfletos" stroke="#ffc658" name="Panfletos" />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
