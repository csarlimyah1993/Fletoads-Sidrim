"use client"

import { useState, useEffect } from "react"
import { Bell, Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import Link from "next/link"

export function Notificacoes() {
  const [notificacoes, setNotificacoes] = useState<any[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [isMarkingAsRead, setIsMarkingAsRead] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Buscar notificações
  const fetchNotificacoes = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/notificacoes?limit=10")

      if (!response.ok) {
        let errorMessage = "Erro ao buscar notificações"
        try {
          const errorData = await response.json()
          console.error("Erro na resposta da API:", errorData)
          errorMessage = errorData.error || errorMessage
        } catch (e) {
          console.error("Erro ao processar resposta de erro:", e)
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setNotificacoes(data.notificacoes || [])
      setNaoLidas(data.naoLidas || 0)
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
      setError((error as Error).message || "Erro ao buscar notificações")
      setNotificacoes([])
      setNaoLidas(0)
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar notificações ao carregar o componente
  useEffect(() => {
    fetchNotificacoes()
  }, [])

  // Buscar notificações quando o popover é aberto
  useEffect(() => {
    if (isOpen) {
      fetchNotificacoes()
    }
  }, [isOpen])

  // Marcar notificação como lida
  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch(`/api/notificacoes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lida: true }),
      })

      if (!response.ok) {
        throw new Error("Erro ao marcar notificação como lida")
      }

      // Atualizar estado local
      setNotificacoes(notificacoes.map((notif) => (notif._id === id ? { ...notif, lida: true } : notif)))
      setNaoLidas((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  // Marcar todas como lidas
  const marcarTodasComoLidas = async () => {
    try {
      setIsMarkingAsRead(true)
      const response = await fetch("/api/notificacoes/marcar-como-lida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todas: true }),
      })

      if (!response.ok) {
        throw new Error("Erro ao marcar notificações como lidas")
      }

      // Atualizar estado local
      setNotificacoes(notificacoes.map((notif) => ({ ...notif, lida: true })))
      setNaoLidas(0)
      toast.success("Todas as notificações foram marcadas como lidas")
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error)
      toast.error("Erro ao marcar notificações como lidas")
    } finally {
      setIsMarkingAsRead(false)
    }
  }

  // Formatar data relativa
  const formatarDataRelativa = (data: string) => {
    return formatDistanceToNow(new Date(data), {
      addSuffix: true,
      locale: ptBR,
    })
  }

  // Obter cor do ícone com base no tipo
  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case "success":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "error":
        return "text-red-500"
      default:
        return "text-blue-500"
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-red-500 text-[10px] font-medium text-white flex items-center justify-center">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notificações</h3>
          {naoLidas > 0 && (
            <Button variant="ghost" size="sm" onClick={marcarTodasComoLidas} disabled={isMarkingAsRead}>
              {isMarkingAsRead ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Check className="h-3 w-3 mr-1" />}
              <span className="text-xs">Marcar todas como lidas</span>
            </Button>
          )}
        </div>
        <Separator />
        {isLoading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Erro ao carregar notificações</p>
            <Button variant="ghost" size="sm" onClick={fetchNotificacoes} className="mt-2">
              Tentar novamente
            </Button>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <Bell className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Você não tem notificações</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="divide-y">
              {notificacoes.map((notificacao) => (
                <div key={notificacao._id} className={`p-4 ${notificacao.lida ? "bg-background" : "bg-muted/30"}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-medium ${!notificacao.lida && "text-primary"}`}>
                      {notificacao.titulo}
                    </h4>
                    <span className="text-xs text-gray-500">{formatarDataRelativa(notificacao.dataCriacao)}</span>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{notificacao.mensagem}</p>
                  <div className="flex justify-between items-center">
                    {notificacao.link ? (
                      <Link
                        href={notificacao.link}
                        className="text-xs text-blue-500 hover:underline"
                        onClick={() => {
                          if (!notificacao.lida) {
                            marcarComoLida(notificacao._id)
                          }
                          setIsOpen(false)
                        }}
                      >
                        Ver detalhes
                      </Link>
                    ) : (
                      <span></span>
                    )}
                    {!notificacao.lida && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs"
                        onClick={() => marcarComoLida(notificacao._id)}
                      >
                        Marcar como lida
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </PopoverContent>
    </Popover>
  )
}

