"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { Bell, Check, Info, AlertCircle, CheckCircle, X, ExternalLink } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

interface Notificacao {
  _id: string
  titulo: string
  mensagem: string
  tipo: "info" | "success" | "warning" | "error"
  link?: string
  icone?: string
  lida: boolean
  dataCriacao: string
  origem: string
  acoes?: {
    texto: string
    link: string
    tipo: "primary" | "secondary" | "outline" | "destructive"
  }[]
}

export function NotificacoesAvancadas() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([])
  const [naoLidas, setNaoLidas] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (session) {
      buscarNotificacoes()
    }
  }, [session])

  useEffect(() => {
    // Atualizar notificações a cada 5 minutos
    const interval = setInterval(
      () => {
        if (session) {
          buscarNotificacoes()
        }
      },
      5 * 60 * 1000,
    )

    return () => clearInterval(interval)
  }, [session])

  const buscarNotificacoes = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/notificacoes-avancadas?limit=10")

      if (response.ok) {
        const data = await response.json()
        setNotificacoes(data.notificacoes)
        setNaoLidas(data.naoLidas)
      }
    } catch (error) {
      console.error("Erro ao buscar notificações:", error)
    } finally {
      setLoading(false)
    }
  }

  const marcarComoLida = async (id: string) => {
    try {
      const response = await fetch("/api/notificacoes-avancadas/marcar-como-lida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        // Atualizar estado local
        setNotificacoes((prev) => prev.map((notif) => (notif._id === id ? { ...notif, lida: true } : notif)))
        setNaoLidas((prev) => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error)
    }
  }

  const marcarTodasComoLidas = async () => {
    try {
      const response = await fetch("/api/notificacoes-avancadas/marcar-como-lida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ todas: true }),
      })

      if (response.ok) {
        // Atualizar estado local
        setNotificacoes((prev) => prev.map((notif) => ({ ...notif, lida: true })))
        setNaoLidas(0)

        toast({
          title: "Sucesso",
          description: "Todas as notificações foram marcadas como lidas",
        })
      }
    } catch (error) {
      console.error("Erro ao marcar todas notificações como lidas:", error)
    }
  }

  const getIconForType = (tipo: string) => {
    switch (tipo) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertCircle className="h-4 w-4 text-amber-500" />
      case "error":
        return <X className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatarData = (dataString: string) => {
    const data = new Date(dataString)
    const agora = new Date()
    const diff = agora.getTime() - data.getTime()

    // Menos de 1 minuto
    if (diff < 60 * 1000) {
      return "Agora mesmo"
    }

    // Menos de 1 hora
    if (diff < 60 * 60 * 1000) {
      const minutos = Math.floor(diff / (60 * 1000))
      return `Há ${minutos} minuto${minutos > 1 ? "s" : ""}`
    }

    // Menos de 1 dia
    if (diff < 24 * 60 * 60 * 1000) {
      const horas = Math.floor(diff / (60 * 60 * 1000))
      return `Há ${horas} hora${horas > 1 ? "s" : ""}`
    }

    // Menos de 7 dias
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      const dias = Math.floor(diff / (24 * 60 * 60 * 1000))
      return `Há ${dias} dia${dias > 1 ? "s" : ""}`
    }

    // Mais de 7 dias
    return data.toLocaleDateString("pt-BR")
  }

  if (!session) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {naoLidas > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
              {naoLidas > 9 ? "9+" : naoLidas}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4">
          <h3 className="font-medium">Notificações</h3>
          {naoLidas > 0 && (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={marcarTodasComoLidas}>
              <Check className="mr-1 h-3 w-3" />
              Marcar todas como lidas
            </Button>
          )}
        </div>
        <Separator />
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          </div>
        ) : notificacoes.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/50 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Você não tem notificações</p>
          </div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 p-1">
              {notificacoes.map((notificacao) => (
                <div
                  key={notificacao._id}
                  className={`relative p-3 rounded-md transition-colors ${
                    notificacao.lida ? "bg-background hover:bg-muted/50" : "bg-muted/50 hover:bg-muted"
                  }`}
                >
                  {!notificacao.lida && (
                    <div className="absolute top-3 right-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => marcarComoLida(notificacao._id)}
                      >
                        <Check className="h-3 w-3" />
                        <span className="sr-only">Marcar como lida</span>
                      </Button>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <div className="mt-0.5">{getIconForType(notificacao.tipo)}</div>
                    <div className="flex-1 pr-6">
                      <div className="font-medium text-sm">{notificacao.titulo}</div>
                      <p className="text-xs text-muted-foreground mt-1">{notificacao.mensagem}</p>

                      {notificacao.acoes && notificacao.acoes.length > 0 && (
                        <div className="flex gap-2 mt-2">
                          {notificacao.acoes.map((acao, index) => (
                            <Button
                              key={index}
                              variant={acao.tipo as any}
                              size="sm"
                              className="h-7 text-xs"
                              asChild
                              onClick={() => setOpen(false)}
                            >
                              <Link href={acao.link}>{acao.texto}</Link>
                            </Button>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-[10px] text-muted-foreground">
                          {formatarData(notificacao.dataCriacao)}
                        </span>

                        {notificacao.link && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-xs"
                            asChild
                            onClick={() => {
                              marcarComoLida(notificacao._id)
                              setOpen(false)
                            }}
                          >
                            <Link href={notificacao.link}>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Ver
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
        <Separator />
        <div className="p-2">
          <Button variant="outline" size="sm" className="w-full text-xs" asChild onClick={() => setOpen(false)}>
            <Link href="/notificacoes">Ver todas as notificações</Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}

