"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, RefreshCw } from "lucide-react"

export function DatabaseError() {
  const [isRetrying, setIsRetrying] = useState(false)
  const [isConnected, setIsConnected] = useState<boolean | null>(null)

  const checkConnection = async () => {
    setIsRetrying(true)
    try {
      const response = await fetch("/api/health")
      const data = await response.json()
      setIsConnected(data.services.database === "up")
    } catch (error) {
      setIsConnected(false)
    } finally {
      setIsRetrying(false)
    }
  }

  useEffect(() => {
    checkConnection()
  }, [])

  if (isConnected === true) {
    return null
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Problema de conexão</AlertTitle>
      <AlertDescription className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
        <span>Não foi possível conectar ao banco de dados. Algumas funcionalidades podem estar indisponíveis.</span>
        <Button variant="outline" size="sm" onClick={checkConnection} disabled={isRetrying} className="ml-0 sm:ml-2">
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : (
            "Tentar novamente"
          )}
        </Button>
      </AlertDescription>
    </Alert>
  )
}

