import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"

interface PanfletosPorCategoriaProps {
  data: Array<{
    categoria: string
    quantidade: number
  }>
  loading?: boolean
}

export function PanfletosPorCategoria({ data, loading = false }: PanfletosPorCategoriaProps) {
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
        <XAxis dataKey="categoria" />
        <YAxis />
        <Tooltip formatter={(value) => [`${value} panfletos`, "Quantidade"]} />
        <Bar dataKey="quantidade" fill="#8884d8" name="Panfletos" />
      </BarChart>
    </ResponsiveContainer>
  )
}
