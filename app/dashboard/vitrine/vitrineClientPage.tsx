"use client"

// Renomeado o arquivo para resolver o problema de case-sensitivity
import { VitrineCustomization } from "@/components/vitrine/vitrine-customization"
import { useState } from "react"
import { toast } from "@/components/ui/use-toast"
import { OfflineFallback } from "./offline-fallback"

interface VitrineClientPageProps {
  loja: any
  vitrineConfig: any
}

export function VitrineClientPage({ loja, vitrineConfig }: VitrineClientPageProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [isSaving, setIsSaving] = useState(false)

  // Monitor online status
  useState(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  })

  const handleSaveConfig = async (config: any) => {
    if (!isOnline) {
      toast({
        title: "Sem conexão",
        description: "Você está offline. Conecte-se à internet para salvar as alterações.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch(`/api/loja/${loja._id}/vitrine/configuracoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(config),
      })

      if (!response.ok) {
        throw new Error("Falha ao salvar configurações")
      }

      toast({
        title: "Configurações salvas",
        description: "As configurações da sua vitrine foram atualizadas com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao salvar configurações:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar as configurações. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!isOnline) {
    return <OfflineFallback />
  }

  return (
    <VitrineCustomization loja={loja} initialConfig={vitrineConfig} onSave={handleSaveConfig} isSaving={isSaving} />
  )
}
