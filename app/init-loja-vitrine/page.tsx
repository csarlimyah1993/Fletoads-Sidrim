"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useRouter } from "next/navigation"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function InitLojaVitrinePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [detailedError, setDetailedError] = useState("")
  const router = useRouter()

  // Modificar a função handleInit para usar a API alternativa

  const handleInit = async () => {
    try {
      setIsLoading(true)
      setMessage("")
      setError("")
      setDetailedError("")

      // Usar a API alternativa
      const response = await fetch("/api/init-loja-vitrine-alt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      const responseText = await response.text()
      let data

      try {
        // Tentar analisar a resposta como JSON
        data = JSON.parse(responseText)
      } catch (e) {
        // Se não for JSON válido, mostrar o texto da resposta
        console.error("Resposta não é JSON válido:", responseText)
        setDetailedError(`Resposta do servidor não é JSON válido: ${responseText.substring(0, 200)}...`)
        throw new Error("Resposta do servidor não é JSON válido")
      }

      if (!response.ok) {
        throw new Error(data.error || "Erro ao inicializar loja e vitrine")
      }

      setMessage(data.message)

      // Redirecionar após 2 segundos
      setTimeout(() => {
        router.push("/dashboard/perfil")
      }, 2000)
    } catch (error) {
      console.error("Erro:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Inicializar Loja e Vitrine</CardTitle>
          <CardDescription>Crie automaticamente uma loja e vitrine para o seu usuário.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Este processo criará uma loja e uma vitrine padrão para o seu usuário. Você poderá personalizar os detalhes
            posteriormente.
          </p>

          {message && (
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-700 mb-4">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Sucesso</AlertTitle>
              <AlertDescription>{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {detailedError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4 mt-2 text-xs overflow-auto max-h-40">
              <p className="font-semibold mb-1">Detalhes do erro:</p>
              <pre>{detailedError}</pre>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            Voltar
          </Button>
          <Button onClick={handleInit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : (
              "Inicializar"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
