import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts"
import { Loader2 } from "lucide-react"

interface CampanhasPerformanceProps {
  data: Array<{
    status: string
    quantidade: number
  }>
  loading?: boolean
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]

export function CampanhasPerformance({ data, loading = false }: CampanhasPerformanceProps) {
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
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="quantidade"
          nameKey="status"
          label={({ status, percent }) => `${status || "N/A"} ${((percent || 0) * 100).toFixed(0)}%`}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value, name) => [`${value} vendas`, name || "N/A"]} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
