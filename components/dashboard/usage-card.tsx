import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatNumber } from "@/lib/utils"

interface UsageCardProps {
  title: string
  description: string
  used: number
  limit: number | null
  unit?: string
}

export function UsageCard({ title, description, used, limit, unit = "" }: UsageCardProps) {
  // Calculate percentage only if limit is a number and not null
  const percentage = limit !== null ? Math.min(Math.round((used / limit) * 100), 100) : 0

  // Format the display limit based on whether it's null or a number
  const displayLimit = limit === null ? "∞" : formatNumber(limit)

  // Determine if the user is approaching the limit (80% or more)
  const isApproachingLimit = limit !== null && percentage >= 80

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">
            {formatNumber(used)} {unit} de {displayLimit} {unit}
          </span>
          {limit !== null && <span className="text-sm font-medium">{percentage}%</span>}
        </div>
        {limit !== null ? (
          <Progress value={percentage} className="h-2" />
        ) : (
          <Progress value={100} className="h-2 bg-muted" />
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        {limit === null
          ? "Uso ilimitado disponível no seu plano"
          : isApproachingLimit
            ? "Você está se aproximando do seu limite"
            : "Uso dentro dos limites do plano"}
      </CardFooter>
    </Card>
  )
}
