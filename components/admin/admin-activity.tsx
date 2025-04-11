"use client"

import { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface Activity {
  id: string
  user: {
    name: string
    avatar?: string
  }
  action: string
  target: string
  timestamp: string
  type: "create" | "update" | "delete" | "login"
}

export function AdminActivity() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulando uma chamada de API
    const fetchActivities = async () => {
      try {
        // Em um cenário real, você faria uma chamada de API aqui
        // const response = await fetch('/api/admin/activities')
        // const result = await response.json()

        // Dados simulados
        const mockActivities = [
          {
            id: "1",
            user: { name: "João Silva" },
            action: "criou",
            target: "um novo panfleto",
            timestamp: "há 5 minutos",
            type: "create" as const,
          },
          {
            id: "2",
            user: { name: "Maria Oliveira" },
            action: "atualizou",
            target: "informações da loja",
            timestamp: "há 15 minutos",
            type: "update" as const,
          },
          {
            id: "3",
            user: { name: "Pedro Santos" },
            action: "excluiu",
            target: "uma campanha",
            timestamp: "há 30 minutos",
            type: "delete" as const,
          },
          {
            id: "4",
            user: { name: "Ana Costa" },
            action: "fez login",
            target: "no sistema",
            timestamp: "há 45 minutos",
            type: "login" as const,
          },
          {
            id: "5",
            user: { name: "Carlos Ferreira" },
            action: "criou",
            target: "uma nova loja",
            timestamp: "há 1 hora",
            type: "create" as const,
          },
        ]

        setActivities(mockActivities)
      } catch (error) {
        console.error("Erro ao buscar atividades:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "create":
        return "bg-green-500"
      case "update":
        return "bg-blue-500"
      case "delete":
        return "bg-red-500"
      case "login":
        return "bg-purple-500"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-3 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-10 w-10">
              <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
              <AvatarFallback>
                {activity.user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span
              className={cn(
                "absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white",
                getActivityIcon(activity.type),
              )}
            />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-none">
              <span className="font-semibold">{activity.user.name}</span> {activity.action} {activity.target}
            </p>
            <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
