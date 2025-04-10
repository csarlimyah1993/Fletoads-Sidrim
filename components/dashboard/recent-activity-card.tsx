"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ActivityIcon } from "lucide-react"
import { useState, useEffect } from "react"

interface RecentActivityCardProps {
  className?: string
}

export function RecentActivityCard({ className }: RecentActivityCardProps) {
  const [activities, setActivities] = useState<
    Array<{
      id: string
      tipo: string
      descricao: string
      data: string
    }>
  >([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        // Simulação de busca de atividades recentes
        // Em um cenário real, isso viria de uma API
        setTimeout(() => {
          setActivities([
            {
              id: "1",
              tipo: "panfleto",
              descricao: "Panfleto 'Promoção de Verão' criado",
              data: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
            },
            {
              id: "2",
              tipo: "cliente",
              descricao: "Novo cliente cadastrado: Maria Silva",
              data: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            },
            {
              id: "3",
              tipo: "campanha",
              descricao: "Campanha 'Black Friday' iniciada",
              data: new Date(Date.now() - 172800000).toISOString(), // 2 dias atrás
            },
          ])
          setLoading(false)
        }, 1000)
      } catch (error) {
        console.error("Erro ao buscar atividades recentes:", error)
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) {
      return `${diffMins} min atrás`
    } else if (diffHours < 24) {
      return `${diffHours} h atrás`
    } else {
      return `${diffDays} dia${diffDays > 1 ? "s" : ""} atrás`
    }
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Atividades Recentes</CardTitle>
        <ActivityIcon className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm">Carregando atividades...</p>
        ) : activities.length > 0 ? (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-blue-500" />
                <div className="flex-1">
                  <p className="text-sm">{activity.descricao}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(activity.data)}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Nenhuma atividade recente</p>
        )}
      </CardContent>
    </Card>
  )
}
