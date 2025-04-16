"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Erro na página de edição de perfil da loja:", error)
  }, [error])

  return (
    <div className="container py-10 flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <p className="text-gray-600 mb-6">Ocorreu um erro ao carregar a página de edição do perfil da loja.</p>
      <div className="flex gap-4">
        <Button variant="outline" onClick={() => (window.location.href = "/dashboard/perfil-da-loja")}>
          Voltar para o perfil
        </Button>
        <Button onClick={() => reset()}>Tentar novamente</Button>
      </div>
    </div>
  )
}
