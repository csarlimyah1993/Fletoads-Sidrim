import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Phone, Mail, Globe, Clock } from "lucide-react"

interface LojaInfoCardProps {
  loja: any
}

export function LojaInfoCard({ loja }: LojaInfoCardProps) {
  // Função para formatar o endereço completo
  const formatarEndereco = () => {
    if (!loja.endereco) return "Endereço não informado"

    const { rua, numero, complemento, bairro, cidade, estado, cep } = loja.endereco

    let enderecoFormatado = ""

    if (rua) enderecoFormatado += rua
    if (numero) enderecoFormatado += `, ${numero}`
    if (complemento) enderecoFormatado += ` - ${complemento}`
    if (bairro) enderecoFormatado += `, ${bairro}`
    if (cidade) enderecoFormatado += `, ${cidade}`
    if (estado) enderecoFormatado += ` - ${estado}`
    if (cep) enderecoFormatado += `, CEP: ${cep}`

    return enderecoFormatado || "Endereço não informado"
  }

  // Função para formatar o horário de funcionamento
  const formatarHorario = (dia: string) => {
    if (!loja.horarioFuncionamento || !loja.horarioFuncionamento[dia]) {
      return "Fechado"
    }

    const horario = loja.horarioFuncionamento[dia]

    if (!horario.open) {
      return "Fechado"
    }

    return `${horario.abertura} - ${horario.fechamento}`
  }

  // Obter o dia da semana atual
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"]
  const diaAtual = diasSemana[new Date().getDay()]

  // Verificar se a loja está aberta agora
  const verificarAberto = () => {
    if (!loja.horarioFuncionamento || !loja.horarioFuncionamento[diaAtual]) {
      return false
    }

    const horario = loja.horarioFuncionamento[diaAtual]

    if (!horario.open) {
      return false
    }

    const agora = new Date()
    const horaAtual = agora.getHours()
    const minutoAtual = agora.getMinutes()

    const [horaAbertura, minutoAbertura] = horario.abertura.split(":").map(Number)
    const [horaFechamento, minutoFechamento] = horario.fechamento.split(":").map(Number)

    const minutosAgora = horaAtual * 60 + minutoAtual
    const minutosAbertura = horaAbertura * 60 + minutoAbertura
    const minutosFechamento = horaFechamento * 60 + minutoFechamento

    return minutosAgora >= minutosAbertura && minutosAgora <= minutosFechamento
  }

  const estaAberto = verificarAberto()

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informações da Loja</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start">
          <MapPin className="h-5 w-5 mr-2 text-muted-foreground shrink-0 mt-0.5" />
          <div>
            <p className="font-medium">Endereço</p>
            <p className="text-sm text-muted-foreground">{formatarEndereco()}</p>
          </div>
        </div>

        {(loja.contato?.telefone || loja.telefone) && (
          <div className="flex items-center">
            <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Telefone</p>
              <p className="text-sm text-muted-foreground">{loja.contato?.telefone || loja.telefone}</p>
            </div>
          </div>
        )}

        {(loja.contato?.email || loja.email) && (
          <div className="flex items-center">
            <Mail className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Email</p>
              <p className="text-sm text-muted-foreground">{loja.contato?.email || loja.email}</p>
            </div>
          </div>
        )}

        {(loja.contato?.site || loja.website) && (
          <div className="flex items-center">
            <Globe className="h-5 w-5 mr-2 text-muted-foreground" />
            <div>
              <p className="font-medium">Website</p>
              <p className="text-sm text-muted-foreground">
                <a
                  href={loja.contato?.site || loja.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {loja.contato?.site || loja.website}
                </a>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-muted-foreground" />
          <div>
            <p className="font-medium">Horário de Hoje</p>
            <div className="flex items-center">
              <span
                className={`inline-block w-2 h-2 rounded-full mr-2 ${estaAberto ? "bg-green-500" : "bg-red-500"}`}
              ></span>
              <p className="text-sm text-muted-foreground">
                {estaAberto ? "Aberto agora" : "Fechado"} • {formatarHorario(diaAtual)}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

