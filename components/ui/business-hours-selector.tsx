"use client"

import { useState } from "react"
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
  value: BusinessHoursSchedule
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

const dayNames = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
}

export function BusinessHoursSelector({ value, onChange }: BusinessHoursSelectorProps) {
  // Initialize with default hours if value is undefined
  const [hours, setHours] = useState<BusinessHoursSchedule>(value || defaultHours)

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
          {Object.entries(dayNames).map(([day, label]) => (
            <div key={day} className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor={`${day}-toggle`} className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  {label}
                </Label>
                <Switch
                  id={`${day}-toggle`}
                  checked={hours[day as keyof BusinessHoursSchedule].open}
                  onCheckedChange={() => handleDayToggle(day as keyof BusinessHoursSchedule)}
                />
              </div>

              {hours[day as keyof BusinessHoursSchedule].open && (
                <div className="grid grid-cols-2 gap-2 pl-6 mt-1">
                  <div className="space-y-1">
                    <Label htmlFor={`${day}-open`} className="text-xs text-muted-foreground">
                      Abertura
                    </Label>
                    <Input
                      id={`${day}-open`}
                      type="time"
                      value={hours[day as keyof BusinessHoursSchedule].abertura}
                      onChange={(e) => handleTimeChange(day as keyof BusinessHoursSchedule, "abertura", e.target.value)}
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
                      value={hours[day as keyof BusinessHoursSchedule].fechamento}
                      onChange={(e) =>
                        handleTimeChange(day as keyof BusinessHoursSchedule, "fechamento", e.target.value)
                      }
                      className="h-8"
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

