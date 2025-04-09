"use client"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export interface DatabaseErrorFallbackProps {
  errorMessage?: string // Tornando opcional
  onRetry?: () => void
}

export function DatabaseErrorFallback({
  errorMessage = "Não foi possível conectar ao banco de dados", // Valor padrão
  onRetry,
}: DatabaseErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="w-full max-w-md p-6 bg-destructive/10 border border-destructive rounded-lg text-center">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
        <h2 className="text-xl font-bold text-destructive mb-2">Erro de Conexão</h2>
        <p className="text-muted-foreground mb-6">{errorMessage}</p>
        {onRetry ? (
          <Button onClick={onRetry} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Tentar novamente
          </Button>
        ) : (
          <Button onClick={() => window.location.reload()} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Recarregar página
          </Button>
        )}
      </div>
    </div>
  )
}
