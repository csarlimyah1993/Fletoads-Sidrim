"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  title: string
  message: string
  date: string
  read: boolean
  type: "info" | "success" | "warning" | "error"
}

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const { toast } = useToast()

  const fetchNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/notifications")
      if (!response.ok) {
        throw new Error("Falha ao carregar notificações")
      }
      const data = await response.json()

      // Garantir que data seja um array
      const notificationsArray = Array.isArray(data) ? data : data.notifications || []

      // Garantir que cada notificação tenha um ID válido
      const validNotifications = notificationsArray.map((notification: any) => ({
        ...notification,
        id: notification.id || notification._id || `temp-${Math.random().toString(36).substring(2, 9)}`,
      }))

      setNotifications(validNotifications)
    } catch (error) {
      console.error("Erro ao carregar notificações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas notificações. Tente novamente mais tarde.",
        variant: "destructive",
      })
      // Em caso de erro, garantir que notifications seja um array vazio
      setNotifications([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [toast])

  const handleMarkAsRead = async (id: string) => {
    try {
      console.log("Marcando notificação como lida:", id)

      // Atualizar localmente primeiro para melhor UX
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )

      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      })

      if (!response.ok) {
        console.error("Erro na resposta:", await response.text())
        throw new Error("Falha ao marcar notificação como lida")
      }

      // Já atualizamos o estado localmente, não precisamos fazer nada mais aqui
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)

      // Reverter a mudança local em caso de erro
      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: false } : notification)),
      )

      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      // Atualizar localmente primeiro para melhor UX
      const previousNotifications = [...notifications]
      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))

      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Falha ao marcar todas as notificações como lidas")
      }

      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas.",
      })
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error)

      // Reverter para o estado anterior em caso de erro
      setNotifications([...notifications])

      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  // Garantir que notifications seja um array antes de chamar filter
  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((notification) => !notification.read).length
    : 0

  // Criar notificações de exemplo se não houver nenhuma
  useEffect(() => {
    if (!isLoading && notifications.length === 0) {
      // Adicionar notificações de exemplo apenas para demonstração
      const exampleNotifications: Notification[] = [
        {
          id: "1",
          title: "Bem-vindo ao FletoAds",
          message: "Obrigado por se cadastrar! Explore todas as funcionalidades.",
          date: new Date().toISOString(),
          read: false,
          type: "info",
        },
        {
          id: "2",
          title: "Dica: Crie seu primeiro panfleto",
          message: "Comece a criar seus panfletos digitais agora mesmo.",
          date: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
          read: false,
          type: "success",
        },
      ]
      setNotifications(exampleNotifications)
    }
  }, [isLoading, notifications.length])

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
          <span className="sr-only">Notificações</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs text-muted-foreground"
              onClick={() => {
                handleMarkAllAsRead()
                setIsOpen(false)
              }}
            >
              Marcar todas como lidas
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 space-y-2">
            {Array(3)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-start gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1 flex-1">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
          </div>
        ) : (
          <DropdownMenuGroup className="max-h-[300px] overflow-y-auto">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start p-3 cursor-pointer ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id)
                  }
                  setIsOpen(false)
                }}
              >
                <div className="flex items-start gap-2 w-full">
                  <div className={`h-2 w-2 mt-1.5 rounded-full ${getNotificationColor(notification.type)}`} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(notification.date)}</p>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <a
            href="/notificacoes"
            className="w-full text-center text-xs cursor-pointer"
            onClick={() => setIsOpen(false)}
          >
            Ver todas as notificações
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function getNotificationColor(type: "info" | "success" | "warning" | "error") {
  switch (type) {
    case "info":
      return "bg-blue-500"
    case "success":
      return "bg-green-500"
    case "warning":
      return "bg-yellow-500"
    case "error":
      return "bg-red-500"
    default:
      return "bg-blue-500"
  }
}

function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60))
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60))
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24))

  if (diffInMinutes < 60) {
    return `${diffInMinutes} min atrás`
  } else if (diffInHours < 24) {
    return `${diffInHours} h atrás`
  } else if (diffInDays < 7) {
    return `${diffInDays} dias atrás`
  } else {
    return date.toLocaleDateString("pt-BR")
  }
}

