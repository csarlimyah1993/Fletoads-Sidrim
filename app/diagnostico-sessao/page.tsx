"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useSession } from "next-auth/react"
import { Loader2 } from "lucide-react"

export default function DiagnosticoSessaoPage() {
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(false)
  const [dbStatus, setDbStatus] = useState<any>(null)
  const [userInfo, setUserInfo] = useState<any>(null)

  const checkDatabase = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/check-connection")
      const data = await res.json()
      setDbStatus(data)
    } catch (error) {
      console.error("Erro ao verificar banco de dados:", error)
      setDbStatus({ error: "Erro ao conectar ao banco de dados" })
    } finally {
      setLoading(false)
    }
  }

  const findUserInDb = async () => {
    if (!session?.user?.email) return

    setLoading(true)
    try {
      const res = await fetch(`/api/usuario/buscar?email=${encodeURIComponent(session.user.email)}`)
      const data = await res.json()
      setUserInfo(data)
    } catch (error) {
      console.error("Erro ao buscar usuário:", error)
      setUserInfo({ error: "Erro ao buscar usuário" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Diagnóstico de Sessão e Banco de Dados</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Informações da Sessão</CardTitle>
            <CardDescription>Detalhes da sessão atual do usuário</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">Status da Sessão:</h3>
                <p className="text-sm">{status}</p>
              </div>

              {session ? (
                <>
                  <div>
                    <h3 className="font-medium">ID do Usuário:</h3>
                    <p className="text-sm break-all">{session.user?.id || "Não disponível"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Email:</h3>
                    <p className="text-sm">{session.user?.email}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Nome:</h3>
                    <p className="text-sm">{session.user?.name || session.user?.nome || "Não disponível"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Cargo:</h3>
                    <p className="text-sm">{session.user?.role || "Não disponível"}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Plano:</h3>
                    <p className="text-sm">{session.user?.plano || "Não disponível"}</p>
                  </div>
                </>
              ) : (
                <p className="text-sm text-red-500">Nenhuma sessão ativa</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Diagnóstico do Banco de Dados</CardTitle>
            <CardDescription>Verificar conexão com o MongoDB</CardDescription>
          </CardHeader>
          <CardContent>
            {dbStatus ? (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium">Status:</h3>
                  <p className={`text-sm ${dbStatus.connected ? "text-green-500" : "text-red-500"}`}>
                    {dbStatus.connected ? "Conectado" : "Desconectado"}
                  </p>
                </div>
                {dbStatus.error && (
                  <div>
                    <h3 className="font-medium">Erro:</h3>
                    <p className="text-sm text-red-500">{dbStatus.error}</p>
                  </div>
                )}
                {dbStatus.details && (
                  <div>
                    <h3 className="font-medium">Detalhes:</h3>
                    <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-40">
                      {JSON.stringify(dbStatus.details, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Clique no botão para verificar a conexão</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={checkDatabase} disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Verificar Conexão
            </Button>
          </CardFooter>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informações do Usuário no Banco</CardTitle>
            <CardDescription>Buscar dados do usuário atual no banco de dados</CardDescription>
          </CardHeader>
          <CardContent>
            {userInfo ? (
              <div className="space-y-4">
                {userInfo.error ? (
                  <p className="text-sm text-red-500">{userInfo.error}</p>
                ) : (
                  <>
                    <div>
                      <h3 className="font-medium">ID no Banco:</h3>
                      <p className="text-sm break-all">{userInfo._id}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Email:</h3>
                      <p className="text-sm">{userInfo.email}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Nome:</h3>
                      <p className="text-sm">{userInfo.nome || "Não disponível"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Cargo:</h3>
                      <p className="text-sm">{userInfo.cargo || userInfo.role || "Não disponível"}</p>
                    </div>
                    <div>
                      <h3 className="font-medium">Dados Completos:</h3>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto max-h-60">
                        {JSON.stringify(userInfo, null, 2)}
                      </pre>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">Clique no botão para buscar informações do usuário</p>
            )}
          </CardContent>
          <CardFooter>
            <Button onClick={findUserInDb} disabled={loading || !session}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Buscar Usuário
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
