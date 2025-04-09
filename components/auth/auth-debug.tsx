"use client"

import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function AuthDebug() {
  const { data: session, status } = useSession()
  const [showDebug, setShowDebug] = useState(false)

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4">
        <Button variant="outline" size="sm" onClick={() => setShowDebug(true)}>
          Debug Auth
        </Button>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 z-50">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex justify-between">
            <span>Auth Debug</span>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowDebug(false)}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs">
          <div className="mb-2">
            <strong>Status:</strong> {status}
          </div>

          {status === "authenticated" && session ? (
            <pre className="bg-muted p-2 rounded overflow-auto max-h-60">{JSON.stringify(session, null, 2)}</pre>
          ) : status === "loading" ? (
            <Alert>
              <AlertDescription>Carregando sessão...</AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertDescription>Não autenticado</AlertDescription>
            </Alert>
          )}

          <div className="mt-2">
            <strong>Ambiente:</strong> {process.env.NODE_ENV}
          </div>
          <div className="mt-2">
            <strong>NextAuth URL:</strong> {process.env.NEXTAUTH_URL || "Não definido"}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

