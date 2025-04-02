"use client"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface DatabaseErrorFallbackProps {
  errorMessage: string
}

export function DatabaseErrorFallback({ errorMessage }: DatabaseErrorFallbackProps) {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Erro ao Carregar Dados</h1>
        <p className="text-muted-foreground">
          Não foi possível carregar os dados do banco de dados. Por favor, tente novamente mais tarde.
        </p>
      </div>

      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de Conexão</AlertTitle>
        <AlertDescription>{errorMessage}</AlertDescription>
      </Alert>

      <Button
        onClick={() => window.location.reload()}
        className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
      >
        Tentar Novamente
      </Button>
    </div>
  )
}

