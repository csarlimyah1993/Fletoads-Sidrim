// Função para formatar horário
export function formatarHorario(horario: any): string {
  if (!horario) return "Fechado"

  // Se for uma string, retornar diretamente
  if (typeof horario === "string") return horario

  // Se for um objeto com propriedade 'aberto' ou 'open'
  if (typeof horario === "object") {
    // Verificar se está aberto
    const isOpen = horario.aberto || horario.open

    if (!isOpen) return "Fechado"

    // Verificar se tem horários de abertura e fechamento
    if (horario.horaAbertura && horario.horaFechamento) {
      return `${horario.horaAbertura} - ${horario.horaFechamento}`
    }

    // Verificar se tem horários de abertura e fechamento
    if (horario.abertura && horario.fechamento) {
      return `${horario.abertura} - ${horario.fechamento}`
    }

    // Verificar se tem horários de opening e closing
    if (horario.opening && horario.closing) {
      return `${horario.opening} - ${horario.closing}`
    }

    // Se não tiver horários específicos mas estiver aberto
    return "Aberto"
  }

  return "Horário não disponível"
}

// Função para verificar se é o dia atual
export function isDiaAtual(diaSemana: string): boolean {
  const diasDaSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
  const dataAtual = new Date()
  const diaDaSemanaAtual = dataAtual.getDay() // 0 (Domingo) - 6 (Sábado)
  return diasDaSemana[diaDaSemanaAtual] === diaSemana
}

// Função para verificar se o horário está aberto
export function isHorarioAberto(horario: any): boolean {
  if (!horario) return false

  // Se for uma string, verificar se não é "Fechado"
  if (typeof horario === "string") return horario !== "Fechado"

  // Se for um objeto, verificar a propriedade 'aberto' ou 'open'
  if (typeof horario === "object") {
    return Boolean(horario.aberto || horario.open)
  }

  return false
}

// Função para verificar se a loja está aberta agora
export function isLojaAbertaAgora(horarioFuncionamento: any): boolean {
  if (!horarioFuncionamento) return false

  const diasDaSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
  const dataAtual = new Date()
  const diaDaSemanaAtual = diasDaSemana[dataAtual.getDay()]

  // Verificar se existe horário para o dia atual
  const horarioHoje = horarioFuncionamento[diaDaSemanaAtual]
  if (!horarioHoje) return false

  // Verificar se está aberto hoje
  if (typeof horarioHoje === "string") {
    return horarioHoje !== "Fechado"
  }

  if (typeof horarioHoje === "object") {
    // Se tiver propriedade 'aberto' explícita como false, está fechado
    if (horarioHoje.aberto === false) return false

    // Se não tiver horários definidos mas estiver marcado como aberto
    if (horarioHoje.aberto === true && !horarioHoje.horaAbertura && !horarioHoje.horaFechamento) {
      return true
    }

    // Verificar se está dentro do horário de funcionamento
    if (horarioHoje.horaAbertura && horarioHoje.horaFechamento) {
      const horaAtual = dataAtual.getHours()
      const minutoAtual = dataAtual.getMinutes()

      // Converter horários para minutos desde meia-noite
      const [horaAbertura, minutoAbertura] = horarioHoje.horaAbertura.split(":").map(Number)
      const [horaFechamento, minutoFechamento] = horarioHoje.horaFechamento.split(":").map(Number)

      const minutoAtualTotal = horaAtual * 60 + minutoAtual
      const minutoAberturaTotal = horaAbertura * 60 + minutoAbertura
      const minutoFechamentoTotal = horaFechamento * 60 + minutoFechamento

      return minutoAtualTotal >= minutoAberturaTotal && minutoAtualTotal <= minutoFechamentoTotal
    }
  }

  return false
}

// Função para calcular desconto
export function calcularDesconto(precoOriginal: number, precoPromocional: number): number {
  if (!precoOriginal || !precoPromocional || precoOriginal <= 0) return 0
  return Math.round(((precoOriginal - precoPromocional) / precoOriginal) * 100)
}

// Função para formatar preço
export function formatarPreco(preco: number): string {
  return preco.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  })
}
