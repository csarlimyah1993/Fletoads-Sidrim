"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { Loader2 } from "lucide-react"

interface Visitante {
  id: string
  nome: string
  email: string
  telefone: string
  dataRegistro: string
  visitasLojas: {
    lojaId: string
    dataVisita: string
  }[]
}

interface LojaVisitas {
  nome: string
  visitas: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function MetricasVisitantes({ tipo }: { tipo: "total" | "loja" | "conversao" | "lista" | "grafico" }) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(true)
  const [visitantes, setVisitantes] = useState<Visitante[]>([])
  const [lojasVisitas, setLojasVisitas] = useState<LojaVisitas[]>([])
  const [totalVisitantes, setTotalVisitantes] = useState(0)
  const [visitasMinhaLoja, setVisitasMinhaLoja] = useState(0)

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        setLoading(true)

        // Verificar se o usuário está autenticado
        if (!session?.user?.id) return

        // Buscar métricas
        const response = await fetch(`/api/evento/metricas?userId=${session.user.id}`)

        if (!response.ok) {
          throw new Error("Erro ao buscar métricas")
        }

        const data = await response.json()

        setVisitantes(data.visitantes || [])
        setLojasVisitas(data.lojasVisitas || [])
        setTotalVisitantes(data.totalVisitantes || 0)
        setVisitasMinhaLoja(data.visitasMinhaLoja || 0)
      } catch (error) {
        console.error("Erro ao buscar métricas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetricas()
  }, [session])

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin" />
  }

  // Renderizar com base no tipo
  switch (tipo) {
    case "total":
      return <div className="text-3xl font-bold">{totalVisitantes}</div>

    case "loja":
      return <div className="text-3xl font-bold">{visitasMinhaLoja}</div>

    case "conversao":
      const taxa = totalVisitantes > 0 ? (visitasMinhaLoja / totalVisitantes) * 100 : 0
      return <div className="text-3xl font-bold">{taxa.toFixed(1)}%</div>

    case "lista":
      return (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Data de Registro</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visitantes.length > 0 ? (
              visitantes.map((visitante) => (
                <TableRow key={visitante.id}>
                  <TableCell>{visitante.nome}</TableCell>
                  <TableCell>{visitante.email}</TableCell>
                  <TableCell>{visitante.telefone}</TableCell>
                  <TableCell>{new Date(visitante.dataRegistro).toLocaleDateString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center">
                  Nenhum visitante encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      )

    case "grafico":
      return (
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lojasVisitas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="visitas" fill="#8884d8">
                {lojasVisitas.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )

    default:
      return null
  }
}

