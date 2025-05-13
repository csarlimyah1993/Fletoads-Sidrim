"use client"

import { useSession } from "next-auth/react"
import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function SessionDebug() {
  const { data: session, status } = useSession()
  const { user, isLoading, error } = useAuth()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Depuração de Sessão</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="session">
          <TabsList className="mb-4">
            <TabsTrigger value="session">Sessão</TabsTrigger>
            <TabsTrigger value="auth">Contexto Auth</TabsTrigger>
          </TabsList>

          <TabsContent value="session">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Status da Sessão</h3>
                <p className="text-sm">{status}</p>
              </div>

              {session ? (
                <div>
                  <h3 className="text-lg font-medium">Dados da Sessão</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs mt-2 max-h-96">
                    {JSON.stringify(session, null, 2)}
                  </pre>
                </div>
              ) : (
                <p>Nenhuma sessão ativa</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="auth">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium">Status do Contexto Auth</h3>
                <p className="text-sm">{isLoading ? "Carregando..." : error ? `Erro: ${error}` : "Carregado"}</p>
              </div>

              {user ? (
                <div>
                  <h3 className="text-lg font-medium">Dados do Usuário</h3>
                  <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs mt-2 max-h-96">
                    {JSON.stringify(user, null, 2)}
                  </pre>
                </div>
              ) : (
                <p>Nenhum usuário carregado</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
