"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts"
import { Loader2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Visitante {
  id: string
  nome: string
  email: string
  telefone: string
  cpf: string
  dataRegistro: string
  visitasLojas: {
    lojaId: string
    lojaNome?: string
    dataVisita: string
  }[]
}

interface LojaVisitas {
  id: string
  nome: string
  visitas: number
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

export default function AdminMetricasVisitantes({
  tipo,
}: {
  tipo:
    | "total"
    | "lojasVisitadas"
    | "mediaVisitas"
    | "engajamento"
    | "listaCompleta"
    | "graficoLojas"
    | "dadosCompletos"
}) {
  const [loading, setLoading] = useState(true)
  const [visitantes, setVisitantes] = useState<Visitante[]>([])
  const [lojasVisitas, setLojasVisitas] = useState<LojaVisitas[]>([])
  const [totalVisitantes, setTotalVisitantes] = useState(0)
  const [lojasComVisitas, setLojasComVisitas] = useState(0)
  const [filtro, setFiltro] = useState("")

  useEffect(() => {
    const fetchMetricas = async () => {
      try {
        setLoading(true)

        // Buscar métricas
        const response = await fetch("/api/admin/evento/metricas")

        if (!response.ok) {
          throw new Error("Erro ao buscar métricas")
        }

        const data = await response.json()

        setVisitantes(data.visitantes || [])
        setLojasVisitas(data.lojasVisitas || [])
        setTotalVisitantes(data.totalVisitantes || 0)
        setLojasComVisitas(data.lojasComVisitas || 0)
      } catch (error) {
        console.error("Erro ao buscar métricas:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetricas()
  }, [])

  const exportarCSV = () => {
    // Função para exportar dados em CSV
    const headers = ["Nome", "Email", "Telefone", "CPF", "Data de Registro", "Lojas Visitadas"]

    const rows = visitantes.map((v) => {
      const lojasVisitadas = v.visitasLojas.map((vl) => vl.lojaNome || "Loja ID: " + vl.lojaId).join("; ")
      return [v.nome, v.email, v.telefone, v.cpf, new Date(v.dataRegistro).toLocaleDateString(), lojasVisitadas]
    })

    const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.setAttribute("href", url)
    link.setAttribute("download", "visitantes-evento.csv")
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return <Loader2 className="h-6 w-6 animate-spin" />
  }

  // Calcular métricas
  const visitantesComVisitas = visitantes.filter((v) => v.visitasLojas.length > 0).length
  const taxaEngajamento = totalVisitantes > 0 ? (visitantesComVisitas / totalVisitantes) * 100 : 0
  const totalVisitas = visitantes.reduce((acc, v) => acc + v.visitasLojas.length, 0)
  const mediaVisitasPorPessoa = visitantesComVisitas > 0 ? totalVisitas / visitantesComVisitas : 0

  // Filtrar visitantes
  const visitantesFiltrados = filtro
    ? visitantes.filter(
        (v) =>
          v.nome.toLowerCase().includes(filtro.toLowerCase()) ||
          v.email.toLowerCase().includes(filtro.toLowerCase()) ||
          v.telefone.includes(filtro) ||
          v.cpf.includes(filtro),
      )
    : visitantes

  // Renderizar com base no tipo
  switch (tipo) {
    case "total":
      return <div className="text-3xl font-bold">{totalVisitantes}</div>

    case "lojasVisitadas":
      return <div className="text-3xl font-bold">{lojasComVisitas}</div>

    case "mediaVisitas":
      return <div className="text-3xl font-bold">{mediaVisitasPorPessoa.toFixed(1)}</div>

    case "engajamento":
      return <div className="text-3xl font-bold">{taxaEngajamento.toFixed(1)}%</div>

    case "listaCompleta":
      return (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Filtrar por nome, email, telefone ou CPF"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={exportarCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Data de Registro</TableHead>
                <TableHead>Lojas Visitadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitantesFiltrados.length > 0 ? (
                visitantesFiltrados.map((visitante) => (
                  <TableRow key={visitante.id}>
                    <TableCell>{visitante.nome}</TableCell>
                    <TableCell>{visitante.email}</TableCell>
                    <TableCell>{visitante.telefone}</TableCell>
                    <TableCell>{new Date(visitante.dataRegistro).toLocaleDateString()}</TableCell>
                    <TableCell>{visitante.visitasLojas.length}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-center">
                    Nenhum visitante encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )

    case "graficoLojas":
      return (
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={lojasVisitas}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nome" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visitas" fill="#8884d8" name="Número de Visitas">
                {lojasVisitas.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )

    case "dadosCompletos":
      return (
        <div>
          <div className="flex items-center justify-between mb-4">
            <Input
              placeholder="Filtrar por nome, email, telefone ou CPF"
              value={filtro}
              onChange={(e) => setFiltro(e.target.value)}
              className="max-w-sm"
            />
            <Button onClick={exportarCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Exportar CSV
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>CPF</TableHead>
                <TableHead>Data de Registro</TableHead>
                <TableHead>Lojas Visitadas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitantesFiltrados.length > 0 ? (
                visitantesFiltrados.map((visitante) => (
                  <TableRow key={visitante.id}>
                    <TableCell>{visitante.nome}</TableCell>
                    <TableCell>{visitante.email}</TableCell>
                    <TableCell>{visitante.telefone}</TableCell>
                    <TableCell>{visitante.cpf}</TableCell>
                    <TableCell>{new Date(visitante.dataRegistro).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {visitante.visitasLojas.length > 0 ? (
                        <ul className="list-disc pl-5">
                          {visitante.visitasLojas.map((visita, idx) => (
                            <li key={idx}>
                              {visita.lojaNome || `Loja ID: ${visita.lojaId}`} -{" "}
                              {new Date(visita.dataVisita).toLocaleString()}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        "Nenhuma loja visitada"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
                    Nenhum visitante encontrado
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )

    default:
      return null
  }
}

