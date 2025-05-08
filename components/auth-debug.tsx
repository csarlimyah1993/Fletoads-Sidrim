"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"
import { useState } from "react"

export function AuthDebug() {
  const { data: session, status: sessionStatus } = useSession()
  const { user, isLoading, error, refreshUserData } = useAuth()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshUserData()
    setIsRefreshing(false)
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Depuração de Autenticação</CardTitle>
          <CardDescription>Informações sobre o estado da autenticação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-lg font-medium">Status da Sessão</h3>
            <p className="text-sm text-muted-foreground">
              Status: <span className="font-medium">{sessionStatus}</span>
            </p>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Erro no AuthContext</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <h3 className="text-lg font-medium">Dados da Sessão</h3>
            {session ? (
              <pre className="mt-2 rounded bg-slate-950 p-4 text-xs text-white overflow-auto max-h-[200px]">
                {JSON.stringify(session, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma sessão encontrada</p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-medium">Dados do Usuário (AuthContext)</h3>
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Carregando...</p>
            ) : user ? (
              <pre className="mt-2 rounded bg-slate-950 p-4 text-xs text-white overflow-auto max-h-[200px]">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum usuário encontrado</p>
            )}
          </div>

          <Button onClick={handleRefresh} disabled={isRefreshing} className="w-full">
            {isRefreshing ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Atualizando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" /> Atualizar Dados
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
