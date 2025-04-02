"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Import your existing editor component
import PerfilEditorPageClient from "@/app/dashboard/perfil/editar/perfil-editor-page-client"

export default function EditarPerfilPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // This is just to ensure the page loads properly
    // The actual data fetching is handled by PerfilEditorPageClient
    setTimeout(() => {
      setIsLoading(false)
    }, 500)
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Carregando informações...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Erro ao Carregar Perfil</h1>
          <p className="text-muted-foreground">
            Não foi possível carregar seus dados. Por favor, tente novamente mais tarde.
          </p>
        </div>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>

        <button
          onClick={() => router.refresh()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
        >
          Tentar Novamente
        </button>
      </div>
    )
  }

  // Use your existing editor component
  return <PerfilEditorPageClient />
}

