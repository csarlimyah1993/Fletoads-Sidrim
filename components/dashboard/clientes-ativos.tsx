import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface ClientesAtivosProps {
  data: Array<{
    periodo: string
    quantidade: number
  }>
  loading?: boolean
}

export function ClientesAtivos({ data, loading = false }: ClientesAtivosProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Nenhum dado disponível</p>
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="periodo" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} clientes`, "Quantidade"]} />
        <Bar dataKey="quantidade" fill="#00C49F" name="Clientes Ativos" />
      </BarChart>
    </ResponsiveContainer>
  )
}
