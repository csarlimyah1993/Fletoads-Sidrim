import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"

interface ClientesAtivosProps {
  data: Array<{ periodo: string; quantidade: number }>
}

export function ClientesAtivos({ data }: ClientesAtivosProps) {
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Clientes Ativos</CardTitle>
        <CardDescription>Número de clientes ativos por mês</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="periodo" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="quantidade" fill="#3b82f6" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
