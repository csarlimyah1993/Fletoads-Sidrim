"use client"

interface HorarioFuncionamento {
  open?: boolean
  abertura?: string
  fechamento?: string
}

interface HorariosFuncionamentoCardProps {
  horarios?: {
    segunda?: HorarioFuncionamento
    terca?: HorarioFuncionamento
    quarta?: HorarioFuncionamento
    quinta?: HorarioFuncionamento
    sexta?: HorarioFuncionamento
    sabado?: HorarioFuncionamento
    domingo?: HorarioFuncionamento
  }
}

export function HorariosFuncionamentoCard({ horarios }: HorariosFuncionamentoCardProps) {
  // Função para formatar o horário
  const formatarHorario = (dia?: HorarioFuncionamento) => {
    if (!dia) return "Fechado"
    if (!dia.open) return "Fechado"
    if (!dia.abertura || !dia.fechamento) return "Horário não definido"

    return `${dia.abertura} - ${dia.fechamento}`
  }

  // Verificar se os dias da semana têm o mesmo horário (seg-sex)
  const verificarHorariosSemanaIguais = () => {
    if (!horarios) return false

    const { segunda, terca, quarta, quinta, sexta } = horarios
    if (!segunda || !terca || !quarta || !quinta || !sexta) return false

    const horarioSegunda = formatarHorario(segunda)
    return [terca, quarta, quinta, sexta].every((dia) => formatarHorario(dia) === horarioSegunda)
  }

  const horariosSemanaIguais = verificarHorariosSemanaIguais()

  return (
    <div className="space-y-2 text-sm">
      {horariosSemanaIguais ? (
        <div className="flex justify-between">
          <span>Segunda-Sexta:</span>
          <span className="font-medium">{formatarHorario(horarios?.segunda)}</span>
        </div>
      ) : (
        <>
          <div className="flex justify-between">
            <span>Segunda:</span>
            <span className="font-medium">{formatarHorario(horarios?.segunda)}</span>
          </div>
          <div className="flex justify-between">
            <span>Terça:</span>
            <span className="font-medium">{formatarHorario(horarios?.terca)}</span>
          </div>
          <div className="flex justify-between">
            <span>Quarta:</span>
            <span className="font-medium">{formatarHorario(horarios?.quarta)}</span>
          </div>
          <div className="flex justify-between">
            <span>Quinta:</span>
            <span className="font-medium">{formatarHorario(horarios?.quinta)}</span>
          </div>
          <div className="flex justify-between">
            <span>Sexta:</span>
            <span className="font-medium">{formatarHorario(horarios?.sexta)}</span>
          </div>
        </>
      )}
      <div className="flex justify-between">
        <span>Sábado:</span>
        <span className="font-medium">{formatarHorario(horarios?.sabado)}</span>
      </div>
      <div className="flex justify-between">
        <span>Domingo:</span>
        <span className="font-medium">{formatarHorario(horarios?.domingo)}</span>
      </div>
    </div>
  )
}

// Also add a default export to ensure it can be imported either way
export default HorariosFuncionamentoCard
