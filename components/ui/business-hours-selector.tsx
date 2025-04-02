"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Clock } from "lucide-react"

export interface DaySchedule {
  open: boolean
  abertura: string
  fechamento: string
}

export interface BusinessHoursSchedule {
  segunda: DaySchedule
  terca: DaySchedule
  quarta: DaySchedule
  quinta: DaySchedule
  sexta: DaySchedule
  sabado: DaySchedule
  domingo: DaySchedule
}

interface BusinessHoursSelectorProps {
  value: BusinessHoursSchedule | Record<string, any> | undefined
  onChange: (value: BusinessHoursSchedule) => void
}

const defaultHours: BusinessHoursSchedule = {
  segunda: { open: true, abertura: "08:00", fechamento: "18:00" },
  terca: { open: true, abertura: "08:00", fechamento: "18:00" },
  quarta: { open: true, abertura: "08:00", fechamento: "18:00" },
  quinta: { open: true, abertura: "08:00", fechamento: "18:00" },
  sexta: { open: true, abertura: "08:00", fechamento: "18:00" },
  sabado: { open: true, abertura: "09:00", fechamento: "13:00" },
  domingo: { open: false, abertura: "00:00", fechamento: "00:00" },
}

const dayNames: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
}

export function BusinessHoursSelector({ value, onChange }: BusinessHoursSelectorProps) {
  // Garantir que temos um valor válido para hours
  const [hours, setHours] = useState<BusinessHoursSchedule>(() => {
    // Se value for undefined ou não tiver as propriedades necessárias, use defaultHours
    if (!value) return { ...defaultHours }

    // Verificar se todas as propriedades necessárias existem
    const validValue: BusinessHoursSchedule = { ...defaultHours }

    // Copiar valores existentes
    Object.keys(dayNames).forEach((day) => {
      const key = day as keyof BusinessHoursSchedule
      if (value[key] && typeof value[key] === "object") {
        validValue[key] = {
          open: typeof value[key].open === "boolean" ? value[key].open : defaultHours[key].open,
          abertura: value[key].abertura || defaultHours[key].abertura,
          fechamento: value[key].fechamento || defaultHours[key].fechamento,
        }
      }
    })

    return validValue
  })

  // Atualizar hours quando value mudar
  useEffect(() => {
    if (value) {
      const validValue: BusinessHoursSchedule = { ...defaultHours }

      Object.keys(dayNames).forEach((day) => {
        const key = day as keyof BusinessHoursSchedule
        if (value[key] && typeof value[key] === "object") {
          validValue[key] = {
            open: typeof value[key].open === "boolean" ? value[key].open : defaultHours[key].open,
            abertura: value[key].abertura || defaultHours[key].abertura,
            fechamento: value[key].fechamento || defaultHours[key].fechamento,
          }
        }
      })

      setHours(validValue)
    }
  }, [value])

  const handleDayToggle = (day: keyof BusinessHoursSchedule) => {
    const newHours = { ...hours }
    newHours[day].open = !newHours[day].open
    setHours(newHours)
    onChange(newHours)
  }

  const handleTimeChange = (day: keyof BusinessHoursSchedule, field: "abertura" | "fechamento", value: string) => {
    const newHours = { ...hours }
    newHours[day][field] = value
    setHours(newHours)
    onChange(newHours)
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          {Object.entries(dayNames).map(([day, label]) => {
            const dayKey = day as keyof BusinessHoursSchedule
            return (
              <div key={day} className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor={`${day}-toggle`} className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {label}
                  </Label>
                  <Switch
                    id={`${day}-toggle`}
                    checked={hours[dayKey].open}
                    onCheckedChange={() => handleDayToggle(dayKey)}
                  />
                </div>

                {hours[dayKey].open && (
                  <div className="grid grid-cols-2 gap-2 pl-6 mt-1">
                    <div className="space-y-1">
                      <Label htmlFor={`${day}-open`} className="text-xs text-muted-foreground">
                        Abertura
                      </Label>
                      <Input
                        id={`${day}-open`}
                        type="time"
                        value={hours[dayKey].abertura}
                        onChange={(e) => handleTimeChange(dayKey, "abertura", e.target.value)}
                        className="h-8"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={`${day}-close`} className="text-xs text-muted-foreground">
                        Fechamento
                      </Label>
                      <Input
                        id={`${day}-close`}
                        type="time"
                        value={hours[dayKey].fechamento}
                        onChange={(e) => handleTimeChange(dayKey, "fechamento", e.target.value)}
                        className="h-8"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

