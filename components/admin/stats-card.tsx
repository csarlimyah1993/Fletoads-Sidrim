"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowDown, ArrowUp } from "lucide-react"
import type { ReactNode } from "react"

interface StatsCardProps {
  title: string
  value: number | string
  description?: string
  trend?: number
  trendLabel?: string
  icon?: ReactNode
}

export function StatsCard({ title, value, description, trend = 0, trendLabel, icon }: StatsCardProps) {
  const isTrendPositive = trend > 0
  const isTrendNegative = trend < 0
  const trendValue = Math.abs(trend)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
        {trend !== undefined && (
          <div className="mt-2 flex items-center text-xs">
            {isTrendPositive && <ArrowUp className="mr-1 h-4 w-4 text-green-500" />}
            {isTrendNegative && <ArrowDown className="mr-1 h-4 w-4 text-red-500" />}
            {!isTrendPositive && !isTrendNegative && <span className="mr-1 text-muted-foreground">→</span>}
            <span
              className={
                isTrendPositive ? "text-green-500" : isTrendNegative ? "text-red-500" : "text-muted-foreground"
              }
            >
              {isTrendPositive && "+"}
              {trendValue}%
            </span>
            {trendLabel && <span className="ml-1 text-muted-foreground">{trendLabel}</span>}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
