"use client"

import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Settings, AlertCircle } from "lucide-react"
import Image from "next/image"

interface Integracao {
  id: string
  nome: string
  descricao: string
  tipo: string
  status: "ativa" | "inativa" | "pendente"
  icone: string
}

interface IntegracoesListProps {
  integracoes: Integracao[]
  onToggleStatus: (id: string, novoStatus: "ativa" | "inativa") => Promise<void>
  emptyMessage: string
}

export function IntegracoesList({ integracoes, onToggleStatus, emptyMessage }: IntegracoesListProps) {
  if (integracoes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-center">
        <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-muted-foreground">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {integracoes.map((integracao) => (
        <Card key={integracao.id} className="overflow-hidden">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {integracao.icone ? (
                  <Image
                    src={integracao.icone || "/placeholder.svg"}
                    alt={integracao.nome}
                    width={24}
                    height={24}
                    className="rounded-sm"
                  />
                ) : (
                  <div className="h-6 w-6 rounded-sm bg-muted flex items-center justify-center">
                    <span className="text-xs font-bold">{integracao.nome.charAt(0)}</span>
                  </div>
                )}
                <CardTitle className="text-lg">{integracao.nome}</CardTitle>
              </div>
              <Badge variant={integracao.status === "ativa" ? "default" : "outline"}>
                {integracao.status === "ativa" ? "Ativa" : "Inativa"}
              </Badge>
            </div>
            <CardDescription>{integracao.descricao}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              <span className="font-medium">Tipo:</span> {integracao.tipo}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t bg-muted/50 px-6 py-3">
            <div className="flex items-center gap-2">
              <Switch
                checked={integracao.status === "ativa"}
                onCheckedChange={(checked) => onToggleStatus(integracao.id, checked ? "ativa" : "inativa")}
                aria-label={`${integracao.status === "ativa" ? "Desativar" : "Ativar"} integração ${integracao.nome}`}
              />
              <span className="text-sm">{integracao.status === "ativa" ? "Ativa" : "Inativa"}</span>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href={`/dashboard/integracoes/${integracao.id}`}>
                <Settings className="mr-2 h-4 w-4" />
                Configurar
              </a>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}

