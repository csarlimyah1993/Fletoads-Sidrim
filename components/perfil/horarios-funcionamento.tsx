"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "@/components/ui/use-toast"
import { Loader2, Clock, CheckCircle2 } from "lucide-react"

interface HorariosDia {
  aberto: boolean
  horaAbertura: string
  horaFechamento: string
  open?: boolean
  abertura?: string
  fechamento?: string
}

interface HorariosFuncionamentoProps {
  lojaId: string
  horarios?: Record<string, any>
  onSave?: (horarios: Record<string, HorariosDia>) => void
}

export function HorariosFuncionamento({ lojaId, horarios = {}, onSave }: HorariosFuncionamentoProps) {
  const diasSemana = [
    { id: "segunda", label: "Segunda-feira" },
    { id: "terca", label: "Terça-feira" },
    { id: "quarta", label: "Quarta-feira" },
    { id: "quinta", label: "Quinta-feira" },
    { id: "sexta", label: "Sexta-feira" },
    { id: "sabado", label: "Sábado" },
    { id: "domingo", label: "Domingo" },
  ]

  const horariosPadrao = {
    segunda: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    terca: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    quarta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    quinta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    sexta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    sabado: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    domingo: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
  }

  const [horariosState, setHorariosState] = useState<Record<string, HorariosDia>>(horariosPadrao)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Inicializar os horários com os valores recebidos ou padrão
  useEffect(() => {
    if (horarios && Object.keys(horarios).length > 0) {
      // Converter os horários para o formato esperado
      const horariosFormatados: Record<string, HorariosDia> = {}

      diasSemana.forEach(({ id }) => {
        const horarioDia = horarios[id] || {}

        // Verificar se temos os campos no formato antigo ou novo
        horariosFormatados[id] = {
          aberto: horarioDia.aberto !== undefined ? horarioDia.aberto : horarioDia.open || false,
          horaAbertura: horarioDia.horaAbertura || horarioDia.abertura || "08:00",
          horaFechamento: horarioDia.horaFechamento || horarioDia.fechamento || "18:00",
          // Manter campos antigos para compatibilidade
          open: horarioDia.aberto !== undefined ? horarioDia.aberto : horarioDia.open || false,
          abertura: horarioDia.horaAbertura || horarioDia.abertura || "08:00",
          fechamento: horarioDia.horaFechamento || horarioDia.fechamento || "18:00",
        }
      })

      console.log("Horários formatados:", horariosFormatados)
      setHorariosState(horariosFormatados)
    } else {
      setHorariosState(horariosPadrao)
    }
  }, [horarios])

  // Função para atualizar o estado de um dia específico
  const handleHorarioChange = (dia: string, campo: keyof HorariosDia, valor: any) => {
    setHorariosState((prev) => {
      const novosHorarios = { ...prev }

      if (!novosHorarios[dia]) {
        novosHorarios[dia] = { ...horariosPadrao[dia as keyof typeof horariosPadrao] }
      }

      novosHorarios[dia] = {
        ...novosHorarios[dia],
        [campo]: valor,
      }

      // Atualizar também os campos antigos para compatibilidade
      if (campo === "aberto") novosHorarios[dia].open = valor
      if (campo === "horaAbertura") novosHorarios[dia].abertura = valor
      if (campo === "horaFechamento") novosHorarios[dia].fechamento = valor

      // Resetar o estado de sucesso quando o usuário faz alterações
      setSaveSuccess(false)

      return novosHorarios
    })
  }

  // Função para salvar os horários
  const handleSave = async () => {
    try {
      setIsSaving(true)
      setSaveSuccess(false)

      // Se temos uma função onSave, usamos ela
      if (onSave) {
        onSave(horariosState)
        setSaveSuccess(true)
        return
      }

      // Caso contrário, salvamos diretamente via API
      const response = await fetch(`/api/lojas/${lojaId}/horarios`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ horarioFuncionamento: horariosState }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar horários de funcionamento")
      }

      setSaveSuccess(true)
      toast({
        title: "Horários salvos",
        description: "Os horários de funcionamento foram salvos com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar horários:", error)
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar os horários de funcionamento.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Função para aplicar o mesmo horário a todos os dias úteis
  const aplicarHorarioUtil = () => {
    const horarioSegunda = horariosState.segunda

    setHorariosState((prev) => {
      const novosHorarios = {
        ...prev,
        terca: { ...horarioSegunda },
        quarta: { ...horarioSegunda },
        quinta: { ...horarioSegunda },
        sexta: { ...horarioSegunda },
      }

      return novosHorarios
    })

    setSaveSuccess(false)
  }

  // Função para aplicar o mesmo horário a todos os dias
  const aplicarHorarioTodos = () => {
    const horarioSegunda = horariosState.segunda

    setHorariosState((prev) => {
      const novosHorarios = {
        ...prev,
        terca: { ...horarioSegunda },
        quarta: { ...horarioSegunda },
        quinta: { ...horarioSegunda },
        sexta: { ...horarioSegunda },
        sabado: { ...horarioSegunda },
        domingo: { ...horarioSegunda },
      }

      return novosHorarios
    })

    setSaveSuccess(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Horários de Funcionamento
        </CardTitle>
        <CardDescription>Configure os horários em que sua loja está aberta para atendimento.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" size="sm" onClick={aplicarHorarioUtil}>
                Aplicar a dias úteis
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={aplicarHorarioTodos}>
                Aplicar a todos os dias
              </Button>
            </div>

            <div className="space-y-4">
              {diasSemana.map(({ id, label }) => (
                <div key={id} className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-x-4 sm:space-y-0">
                  <div className="flex items-center space-x-2 sm:w-1/3">
                    <Switch
                      id={`${id}-switch`}
                      checked={horariosState[id]?.aberto || false}
                      onCheckedChange={(checked) => handleHorarioChange(id, "aberto", checked)}
                    />
                    <Label htmlFor={`${id}-switch`} className="font-medium">
                      {label}
                    </Label>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:w-2/3">
                    <div>
                      <Label htmlFor={`${id}-abertura`} className="text-xs text-muted-foreground">
                        Abertura
                      </Label>
                      <Input
                        id={`${id}-abertura`}
                        type="time"
                        value={horariosState[id]?.horaAbertura || "08:00"}
                        onChange={(e) => handleHorarioChange(id, "horaAbertura", e.target.value)}
                        disabled={!horariosState[id]?.aberto}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${id}-fechamento`} className="text-xs text-muted-foreground">
                        Fechamento
                      </Label>
                      <Input
                        id={`${id}-fechamento`}
                        type="time"
                        value={horariosState[id]?.horaFechamento || "18:00"}
                        onChange={(e) => handleHorarioChange(id, "horaFechamento", e.target.value)}
                        disabled={!horariosState[id]?.aberto}
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        {saveSuccess && (
          <div className="flex items-center text-green-600">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            <span className="text-sm">Horários atualizados</span>
          </div>
        )}
        <div className="flex-grow"></div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Horários"
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
