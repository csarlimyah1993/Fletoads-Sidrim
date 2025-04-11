import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

export interface ClientesAtivosProps {
  data: {
    periodo: string
    quantidade: number
  }[]
  isLoading?: boolean
}

export function ClientesAtivos({ data, isLoading = false }: ClientesAtivosProps) {
  // Verificar se os dados estão no formato correto
  const isValidData = Array.isArray(data) && data.length > 0 && "periodo" in data[0] && "quantidade" in data[0]

  // Se os dados não estiverem no formato correto, criar dados de exemplo
  const chartData = isValidData
    ? data
    : [
        { periodo: "Jan", quantidade: 0 },
        { periodo: "Fev", quantidade: 0 },
        { periodo: "Mar", quantidade: 0 },
        { periodo: "Abr", quantidade: 0 },
        { periodo: "Mai", quantidade: 0 },
        { periodo: "Jun", quantidade: 0 },
      ]

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        <Skeleton className="w-full h-full" />
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <XAxis dataKey="periodo" />
        <YAxis />
        <Tooltip />
        <Bar dataKey="quantidade" fill="#3b82f6" />
      </BarChart>
    </ResponsiveContainer>
  )
}
