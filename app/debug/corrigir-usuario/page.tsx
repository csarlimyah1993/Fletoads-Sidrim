"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function CorrigirUsuariosPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [resultado, setResultado] = useState<any>(null)

  async function corrigirUsuarios() {
    setIsLoading(true)

    try {
      const response = await fetch("/api/debug/corrigir-usuarios")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao corrigir usuários")
      }

      const data = await response.json()
      setResultado(data)
      toast.success(`${data.message}`)
    } catch (error) {
      console.error("Erro ao corrigir usuários:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao corrigir usuários")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Corrigir Usuários</CardTitle>
          <CardDescription>Adiciona o campo de senha para usuários que não o possuem</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-muted-foreground">
            Esta ferramenta irá verificar todos os usuários no banco de dados e adicionar uma senha padrão (123456) para
            aqueles que não possuem esse campo.
          </p>

          {resultado && (
            <div className="mt-4 rounded-md bg-gray-100 p-4 dark:bg-gray-800">
              <h3 className="mb-2 font-medium">Resultado:</h3>
              <ul className="space-y-1 text-sm">
                <li>Total de usuários: {resultado.total}</li>
                <li>Usuários atualizados: {resultado.message.split(",")[0]}</li>
                <li>Erros: {resultado.message.split(",")[1]}</li>
              </ul>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={corrigirUsuarios} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Corrigindo...
              </>
            ) : (
              "Corrigir Usuários"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

