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
    console.error("Admin page error:", error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
      <h2 className="text-2xl font-bold mb-4">Algo deu errado!</h2>
      <p className="text-muted-foreground mb-6 max-w-md">
        Ocorreu um erro ao carregar esta página. Por favor, tente novamente ou entre em contato com o suporte se o
        problema persistir.
      </p>
      <div className="flex gap-4">
        <Button onClick={() => reset()}>Tentar novamente</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
          Voltar para o Dashboard
        </Button>
      </div>
      <div className="mt-8 p-4 bg-muted rounded-md text-left max-w-lg overflow-auto">
        <p className="font-mono text-xs">{error.message}</p>
      </div>
    </div>
  )
}
