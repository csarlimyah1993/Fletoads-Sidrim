"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Link2, ExternalLink, CheckCircle, XCircle, AlertCircle } from "lucide-react"

// Dados simulados de integrações
const integracoes = [
  {
    id: 1,
    nome: "WhatsApp Business",
    status: "conectado",
    icon: "🟢",
    ultimaSincronizacao: "Hoje, 10:45",
  },
  {
    id: 2,
    nome: "Instagram",
    status: "pendente",
    icon: "🟠",
    ultimaSincronizacao: "Nunca",
  },
  {
    id: 3,
    nome: "Mercado Livre",
    status: "desconectado",
    icon: "⚪",
    ultimaSincronizacao: "Nunca",
  },
  {
    id: 4,
    nome: "Google Meu Negócio",
    status: "erro",
    icon: "🔴",
    ultimaSincronizacao: "Ontem, 15:30",
  },
]

export function IntegracoesPreview() {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-primary" />
          <h4 className="text-sm font-medium">Suas integrações</h4>
        </div>
        <Button variant="outline" size="sm" className="h-8">
          <span className="text-xs">Ver todas</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
        {integracoes.map((integracao) => (
          <Card key={integracao.id} className="overflow-hidden">
            <CardContent className="p-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                  <span>{integracao.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-medium">{integracao.nome}</p>
                  <p className="text-xs text-muted-foreground">{integracao.ultimaSincronizacao}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge status={integracao.status} />
                <Button
                  variant={integracao.status === "conectado" ? "destructive" : "default"}
                  size="sm"
                  className="h-8 text-xs"
                >
                  {integracao.status === "conectado" ? "Desconectar" : "Conectar"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "conectado":
      return (
        <Badge
          variant="outline"
          className="bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-400 dark:border-green-800"
        >
          <CheckCircle className="h-3 w-3 mr-1" />
          Conectado
        </Badge>
      )
    case "pendente":
      return (
        <Badge
          variant="outline"
          className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950 dark:text-yellow-400 dark:border-yellow-800"
        >
          <AlertCircle className="h-3 w-3 mr-1" />
          Pendente
        </Badge>
      )
    case "erro":
      return (
        <Badge
          variant="outline"
          className="bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-400 dark:border-red-800"
        >
          <XCircle className="h-3 w-3 mr-1" />
          Erro
        </Badge>
      )
    default:
      return <Badge variant="outline">Desconectado</Badge>
  }
}

