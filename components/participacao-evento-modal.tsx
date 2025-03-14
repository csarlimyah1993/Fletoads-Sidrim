"use client"
import { useRouter } from "next/navigation"
import { Check, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface ParticipacaoEventoModalProps {
  isOpen: boolean
  onClose: () => void
  eventoId: string
  eventoNome: string
}

export function ParticipacaoEventoModal({ isOpen, onClose, eventoId, eventoNome }: ParticipacaoEventoModalProps) {
  const router = useRouter()

  const handleAdicionarPanfletos = () => {
    // Redirecionar para a página de adicionar panfletos do evento
    router.push(`/eventos/${eventoId}/adicionar-panfletos`)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Check className="h-8 w-8 text-green-500" />
          </div>
          <DialogTitle className="text-xl">Seu Perfil Da Loja está pronto para participar!</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 text-lg font-medium mb-4">
            <span>Você ganhou</span>
            <span className="text-green-600">+4 Panfletos de Evento</span>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                stroke="#4CAF50"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M7 7H17" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 12H17" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 17H13" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <DialogDescription className="text-center mb-6">
            Seu cadastro Rezzon está completo, adicione os panfletos e crie a sua vitrine do evento para aprovação do
            promotor do evento clicando.
          </DialogDescription>

          <Button className="w-full" onClick={handleAdicionarPanfletos}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Panfletos
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

