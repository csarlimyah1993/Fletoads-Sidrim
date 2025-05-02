"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { toast } from "sonner"

interface ParticipacaoEventoModalProps {
  isOpen: boolean
  onClose: () => void
  eventoId: string
  eventoNome: string
}

export function ParticipacaoEventoModal({ isOpen, onClose, eventoId, eventoNome }: ParticipacaoEventoModalProps) {
  const { data: session } = useSession()
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSolicitarParticipacao = async () => {
    if (!session?.user || !session.user.lojaId) {
      toast.error("Você precisa estar logado e ter uma loja cadastrada para participar")
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/eventos/${eventoId}/participar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lojaId: session.user.lojaId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao solicitar participação")
      }

      toast.success("Solicitação de participação enviada com sucesso!")
      onClose()
    } catch (error) {
      console.error("Erro ao solicitar participação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao solicitar participação")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Participar do Evento</h2>
          <p className="mb-4">
            Você está solicitando participação no evento <strong>{eventoNome}</strong>.
          </p>
          <p className="mb-6">
            Sua solicitação será analisada pelos administradores do evento. Você receberá uma notificação quando sua
            solicitação for aprovada ou rejeitada.
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={handleSolicitarParticipacao} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando...
                </>
              ) : (
                "Confirmar Solicitação"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
