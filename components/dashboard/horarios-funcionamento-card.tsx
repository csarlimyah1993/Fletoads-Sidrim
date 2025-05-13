import { Badge } from "@/components/ui/badge"

interface HorarioFuncionamento {
  aberto?: boolean
  open?: boolean
  horaAbertura?: string
  abertura?: string
  horaFechamento?: string
  fechamento?: string
}

type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado" | "domingo"

interface HorariosObject {
  [key: string]: HorarioFuncionamento | undefined
  segunda?: HorarioFuncionamento
  terca?: HorarioFuncionamento
  quarta?: HorarioFuncionamento
  quinta?: HorarioFuncionamento
  sexta?: HorarioFuncionamento
  sabado?: HorarioFuncionamento
  domingo?: HorarioFuncionamento
}

interface HorariosFuncionamentoCardProps {
  horarios?: HorariosObject
}

export function HorariosFuncionamentoCard({ horarios }: HorariosFuncionamentoCardProps) {
  if (!horarios) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        <p>Horários não configurados</p>
      </div>
    )
  }

  const diasSemana = [
    { key: "segunda" as DiaSemana, label: "Segunda" },
    { key: "terca" as DiaSemana, label: "Terça" },
    { key: "quarta" as DiaSemana, label: "Quarta" },
    { key: "quinta" as DiaSemana, label: "Quinta" },
    { key: "sexta" as DiaSemana, label: "Sexta" },
    { key: "sabado" as DiaSemana, label: "Sábado" },
    { key: "domingo" as DiaSemana, label: "Domingo" },
  ]

  // Função para verificar se o dia está aberto
  const isDiaAberto = (dia: HorarioFuncionamento | undefined) => {
    if (!dia) return false
    return dia.aberto === true || dia.open === true
  }

  // Função para obter o horário de abertura
  const getHorarioAbertura = (dia: HorarioFuncionamento | undefined) => {
    if (!dia) return "08:00"
    return dia.horaAbertura || dia.abertura || "08:00"
  }

  // Função para obter o horário de fechamento
  const getHorarioFechamento = (dia: HorarioFuncionamento | undefined) => {
    if (!dia) return "18:00"
    return dia.horaFechamento || dia.fechamento || "18:00"
  }

  return (
    <div className="space-y-2">
      {diasSemana.map((dia) => (
        <div key={dia.key} className="flex items-center justify-between">
          <span className="font-medium">{dia.label}</span>
          <div>
            {isDiaAberto(horarios[dia.key]) ? (
              <div className="flex items-center gap-2">
                <span className="text-sm">
                  {getHorarioAbertura(horarios[dia.key])} - {getHorarioFechamento(horarios[dia.key])}
                </span>
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  Aberto
                </Badge>
              </div>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                Fechado
              </Badge>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default HorariosFuncionamentoCard
