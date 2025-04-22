"use client"

import { useSession } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function SessionDebugger() {
  const { data: session, status, update } = useSession()
  const [serverSession, setServerSession] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchServerSession = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/debug")
      const data = await res.json()
      setServerSession(data)
    } catch (error) {
      console.error("Error fetching server session:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-2xl mx-auto my-8">
      <CardHeader>
        <CardTitle>Session Debugger</CardTitle>
        <CardDescription>Informações da sessão atual para depuração</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium mb-2">Client Session Status: {status}</h3>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-60">
              <pre className="text-xs">{JSON.stringify(session, null, 2)}</pre>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={fetchServerSession} disabled={isLoading}>
              {isLoading ? "Carregando..." : "Verificar Sessão no Servidor"}
            </Button>
            <Button onClick={() => update()} variant="outline">
              Atualizar Sessão
            </Button>
          </div>

          {serverSession && (
            <div>
              <h3 className="font-medium mb-2">Server Session:</h3>
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto max-h-60">
                <pre className="text-xs">{JSON.stringify(serverSession, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
