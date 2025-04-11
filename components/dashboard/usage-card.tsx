import type React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface UsageCardProps {
  title: string
  current: number
  limit: number | null
  percentage: number
  icon: React.ReactNode
}

export function UsageCard({ title, current, limit, percentage, icon }: UsageCardProps) {
  // Formatar o limite para exibição
  const formattedLimit = limit === null ? "∞" : limit.toString()

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-medium">{title}</h3>
          </div>
          <span className="text-xs text-muted-foreground">
            {current} / {formattedLimit}
          </span>
        </div>
        <Progress value={percentage} className="h-1" />
      </CardContent>
    </Card>
  )
}
