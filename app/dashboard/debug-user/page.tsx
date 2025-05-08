"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function DebugUserPage() {
  const { user, isLoading, error, refreshUserData } = useAuth()

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Depuração de Dados do Usuário</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Dados do Usuário
            <Button onClick={refreshUserData} variant="outline" size="sm">
              Atualizar Dados
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : error ? (
            <div className="bg-red-50 text-red-700 p-4 rounded-md border border-red-200">
              <p className="font-medium">Erro ao carregar dados:</p>
              <p>{error}</p>
            </div>
          ) : !user ? (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-md border border-amber-200">
              <p>Nenhum usuário autenticado</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID:</p>
                  <p>{user._id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nome:</p>
                  <p>{user.nome}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email:</p>
                  <p>{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Plano:</p>
                  <p className="font-bold">{user.plano || "Não definido"}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Papel:</p>
                  <p>{user.role}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">ID da Loja:</p>
                  <p>{user.lojaId || "Não definido"}</p>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Dados completos:</p>
                <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs">
                  {JSON.stringify(user, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sessão NextAuth</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-2">Dados da sessão:</p>
              <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-96 text-xs" id="session-data">
                Carregando...
              </pre>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Script para buscar dados da sessão */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
          (async function() {
            try {
              const response = await fetch('/api/auth/session');
              const data = await response.json();
              document.getElementById('session-data').textContent = JSON.stringify(data, null, 2);
            } catch (error) {
              document.getElementById('session-data').textContent = 'Erro ao carregar dados da sessão: ' + error.message;
            }
          })();
        `,
        }}
      />
    </div>
  )
}
