import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, DollarSign, Users, FileText, Receipt } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  loading?: boolean
  icon?: "dollar" | "users" | "files" | "receipt"
}

export function StatsCard({ title, value, description, loading = false, icon }: StatsCardProps) {
  const getIcon = () => {
    switch (icon) {
      case "dollar":
        return <DollarSign className="h-4 w-4 text-muted-foreground" />
      case "users":
        return <Users className="h-4 w-4 text-muted-foreground" />
      case "files":
        return <FileText className="h-4 w-4 text-muted-foreground" />
      case "receipt":
        return <Receipt className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {getIcon()}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Carregando...</span>
          </div>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
