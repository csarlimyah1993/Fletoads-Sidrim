import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

interface PanfletosPorMesProps {
  data: Array<{
    mes: string
    quantidade: number
  }>
  loading?: boolean
}

export function PanfletosPorMes({ data, loading = false }: PanfletosPorMesProps) {
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
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="mes"
          tickFormatter={(value) => {
            if (!value) return ""
            try {
              const [year, month] = value.split("-")
              return format(new Date(Number.parseInt(year), Number.parseInt(month) - 1), "MMM", { locale: ptBR })
            } catch (e) {
              return value
            }
          }}
        />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} vendas`, "Quantidade"]}
          labelFormatter={(value) => {
            if (!value) return ""
            try {
              const [year, month] = value.split("-")
              return format(new Date(Number.parseInt(year), Number.parseInt(month) - 1), "MMMM 'de' yyyy", {
                locale: ptBR,
              })
            } catch (e) {
              return value
            }
          }}
        />
        <Line type="monotone" dataKey="quantidade" stroke="#8884d8" name="Vendas" />
      </LineChart>
    </ResponsiveContainer>
  )
}
