"use client"

import { useState, useEffect } from "react"
import type { Notification } from "@/types/notification"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()
  const { toast } = useToast()

  const fetchNotifications = async () => {
    if (!session?.user) return

    try {
      setLoading(true)
      const response = await fetch("/api/notifications")

      if (!response.ok) {
        throw new Error("Falha ao buscar notificações")
      }

      const data = await response.json()
      setNotifications(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido")
      console.error("Erro ao buscar notificações:", err)
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}/read`, {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Falha ao marcar notificação como lida")
      }

      setNotifications((prev) =>
        prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
      )
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err)
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      })
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "PUT",
      })

      if (!response.ok) {
        throw new Error("Falha ao marcar todas notificações como lidas")
      }

      setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
    } catch (err) {
      console.error("Erro ao marcar todas notificações como lidas:", err)
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive",
      })
    }
  }

  useEffect(() => {
    if (session?.user) {
      fetchNotifications()
    }
  }, [session])

  const unreadCount = notifications.filter((n) => !n.read).length

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
  }
}

