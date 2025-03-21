import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Image from "next/image"

export interface Integracao {
  id: string
  name: string
  description: string
  icon: string
  category: string
  status: "connected" | "disconnected"
}

export interface IntegracaoCardProps {
  integracao: Integracao
  onToggleStatus: (id: string, newStatus: "connected" | "disconnected") => Promise<void>
}

export function IntegracaoCard({ integracao, onToggleStatus }: IntegracaoCardProps) {
  const { id, name, description, icon, category, status } = integracao
  const isConnected = status === "connected"

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {icon ? (
              <div className="h-8 w-8 relative">
                <Image src={icon || "/placeholder.svg"} alt={name} fill className="object-contain" />
              </div>
            ) : (
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-sm font-semibold">{name.charAt(0)}</span>
              </div>
            )}
            <CardTitle>{name}</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Label htmlFor={`status-${id}`} className="sr-only">
              Status
            </Label>
            <Switch
              id={`status-${id}`}
              checked={isConnected}
              onCheckedChange={(checked) => onToggleStatus(id, checked ? "connected" : "disconnected")}
            />
          </div>
        </div>
        <CardDescription className="text-xs px-10 py-1 rounded-full bg-muted inline-block mt-2">
          {category}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" size="sm" className="w-full">
          Configurar
        </Button>
      </CardFooter>
    </Card>
  )
}

