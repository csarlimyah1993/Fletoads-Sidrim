/**
 * Formata o horário de funcionamento para exibição
 */
export function formatarHorario(horario: any): string {
    if (!horario) return "Fechado"
  
    if (typeof horario === "string") return horario
  
    if (typeof horario === "object") {
      if (!horario.open) return "Fechado"
      return `${horario.abertura || "00:00"} - ${horario.fechamento || "00:00"}`
    }
  
    return "Horário não disponível"
  }
  
  /**
   * Verifica se o dia da semana fornecido é o dia atual
   */
  export function isDiaAtual(diaSemana: string): boolean {
    const diasDaSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
    const dataAtual = new Date()
    const diaDaSemanaAtual = dataAtual.getDay() // 0 (Domingo) - 6 (Sábado)
    return diasDaSemana[diaDaSemanaAtual] === diaSemana
  }
  
  /**
   * Verifica se o horário está aberto
   */
  export function isHorarioAberto(horario: any): boolean {
    if (!horario) return false
    if (typeof horario === "string") return horario !== "Fechado"
    if (typeof horario === "object") return !!horario.open
    return false
  }
  
  /**
   * Verifica se a loja está aberta no momento atual
   */
  export function isLojaAbertaAgora(horarioFuncionamento: any): boolean {
    if (!horarioFuncionamento) return false
  
    const diasDaSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
    const dataAtual = new Date()
    const diaDaSemanaAtual = diasDaSemana[dataAtual.getDay()]
  
    const horarioHoje = horarioFuncionamento[diaDaSemanaAtual]
    if (!isHorarioAberto(horarioHoje)) return false
  
    // Verificar se o horário atual está dentro do período de funcionamento
    const horaAtual = dataAtual.getHours()
    const minutoAtual = dataAtual.getMinutes()
    const horaAtualTotal = horaAtual * 60 + minutoAtual
  
    if (typeof horarioHoje === "object" && horarioHoje.abertura && horarioHoje.fechamento) {
      const [horaAbertura, minutoAbertura] = horarioHoje.abertura.split(":").map(Number)
      const [horaFechamento, minutoFechamento] = horarioHoje.fechamento.split(":").map(Number)
  
      const aberturaTotal = horaAbertura * 60 + minutoAbertura
      const fechamentoTotal = horaFechamento * 60 + minutoFechamento
  
      return horaAtualTotal >= aberturaTotal && horaAtualTotal <= fechamentoTotal
    }
  
    return false
  }
  