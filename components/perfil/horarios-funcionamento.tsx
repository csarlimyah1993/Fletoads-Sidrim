"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Clock, Save } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

interface HorariosDia {
  aberto: boolean
  horaAbertura: string
  horaFechamento: string
}

type DiaSemana = "segunda" | "terca" | "quarta" | "quinta" | "sexta" | "sabado" | "domingo"

interface HorariosFuncionamentoProps {
  lojaId: string
  horarios?: Record<string, any>
  onSave?: (horarios: Record<string, any>) => Promise<void>
}

export function HorariosFuncionamento({ lojaId, horarios: initialHorarios, onSave }: HorariosFuncionamentoProps) {
  const [horarios, setHorarios] = useState<Record<string, any>>({
    segunda: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    terca: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    quarta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    quinta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    sexta: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    sabado: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
    domingo: { aberto: false, horaAbertura: "08:00", horaFechamento: "18:00" },
  })
  const [isLoading, setIsLoading] = useState(false)

  // Inicializar com os horários existentes, se houver
  useEffect(() => {
    if (initialHorarios) {
      console.log("Inicializando horários:", initialHorarios)
      const diasSemana: DiaSemana[] = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]
      const horariosAtualizados = { ...horarios }

      diasSemana.forEach((dia) => {
        if (initialHorarios[dia]) {
          // Verificar se o formato é o antigo (com open em vez de aberto)
          const horarioDia = initialHorarios[dia] as any
          if (horarioDia && "open" in horarioDia) {
            horariosAtualizados[dia] = {
              aberto: horarioDia.open,
              horaAbertura: horarioDia.abertura || "08:00",
              horaFechamento: horarioDia.fechamento || "18:00",
            }
          } else if (initialHorarios[dia]) {
            horariosAtualizados[dia] = {
              ...horariosAtualizados[dia],
              ...initialHorarios[dia],
            }
          }
        }
      })

      setHorarios(horariosAtualizados)
    }
  }, [initialHorarios])

  const handleToggleAberto = (dia: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        aberto: !prev[dia].aberto,
      },
    }))
  }

  const handleHorarioChange = (dia: string, campo: string, valor: string) => {
    setHorarios((prev) => ({
      ...prev,
      [dia]: {
        ...prev[dia],
        [campo]: valor,
      },
    }))
  }

  const handleCopiarParaTodos = (dia: string) => {
    const horarioDia = horarios[dia]
    const diasSemana: DiaSemana[] = ["segunda", "terca", "quarta", "quinta", "sexta", "sabado", "domingo"]

    const horariosAtualizados = { ...horarios }
    diasSemana.forEach((d) => {
      if (d !== dia) {
        horariosAtualizados[d] = { ...horarioDia }
      }
    })

    setHorarios(horariosAtualizados)
    toast({
      title: "Horários copiados",
      description: `Os horários de ${dia} foram copiados para todos os outros dias.`,
    })
  }

  const handleSalvar = async () => {
    try {
      setIsLoading(true)
      console.log("Salvando horários:", horarios)

      // Criar uma cópia dos horários para salvar no formato compatível com ambos os componentes
      const horariosSalvar = { ...horarios }

      // Adicionar campos de compatibilidade para o formato antigo
      Object.keys(horariosSalvar).forEach((dia) => {
        if (horariosSalvar[dia]) {
          horariosSalvar[dia] = {
            ...horariosSalvar[dia],
            // Adicionar campos no formato antigo para compatibilidade
            open: horariosSalvar[dia].aberto,
            abertura: horariosSalvar[dia].horaAbertura,
            fechamento: horariosSalvar[dia].horaFechamento,
          }
        }
      })

      if (onSave) {
        // Se tiver uma função de callback para salvar
        await onSave(horariosSalvar)
      } else {
        // Caso contrário, salvar diretamente via API
        const response = await fetch(`/api/lojas/${lojaId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          body: JSON.stringify({
            horarioFuncionamento: horariosSalvar,
          }),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Erro ao salvar horários")
        }

        toast({
          title: "Horários salvos",
          description: "Os horários de funcionamento foram atualizados com sucesso.",
        })
      }
    } catch (error) {
      console.error("Erro ao salvar horários:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao salvar horários",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const diasSemana = [
    { id: "segunda", nome: "Segunda-feira" },
    { id: "terca", nome: "Terça-feira" },
    { id: "quarta", nome: "Quarta-feira" },
    { id: "quinta", nome: "Quinta-feira" },
    { id: "sexta", nome: "Sexta-feira" },
    { id: "sabado", nome: "Sábado" },
    { id: "domingo", nome: "Domingo" },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Horários de Funcionamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {diasSemana.map((dia) => (
          <div key={dia.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={`${dia.id}-aberto`} className="font-medium">
                {dia.nome}
              </Label>
              <div className="flex items-center gap-2">
                <Switch
                  id={`${dia.id}-aberto`}
                  checked={horarios[dia.id]?.aberto}
                  onCheckedChange={() => handleToggleAberto(dia.id)}
                />
                <span className="text-sm text-muted-foreground">{horarios[dia.id]?.aberto ? "Aberto" : "Fechado"}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopiarParaTodos(dia.id)}
                  className="ml-2 text-xs h-7"
                >
                  Copiar para todos
                </Button>
              </div>
            </div>

            {horarios[dia.id]?.aberto && (
              <div className="grid grid-cols-2 gap-4 pl-4 border-l-2 border-primary/20 ml-2">
                <div className="space-y-1">
                  <Label htmlFor={`${dia.id}-abertura`} className="text-sm">
                    Abertura
                  </Label>
                  <Input
                    id={`${dia.id}-abertura`}
                    type="time"
                    value={horarios[dia.id]?.horaAbertura || ""}
                    onChange={(e) => handleHorarioChange(dia.id, "horaAbertura", e.target.value)}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor={`${dia.id}-fechamento`} className="text-sm">
                    Fechamento
                  </Label>
                  <Input
                    id={`${dia.id}-fechamento`}
                    type="time"
                    value={horarios[dia.id]?.horaFechamento || ""}
                    onChange={(e) => handleHorarioChange(dia.id, "horaFechamento", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSalvar} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Clock className="mr-2 h-4 w-4 animate-spin" /> Salvando...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> Salvar Horários
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
