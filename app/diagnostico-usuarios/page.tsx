"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

export default function DiagnosticoUsuariosPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDiagnostico = async () => {
      try {
        const response = await fetch("/api/diagnostico/usuarios")
        if (!response.ok) {
          throw new Error(`Erro ${response.status}: ${response.statusText}`)
        }
        const result = await response.json()
        setData(result)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erro desconhecido")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDiagnostico()
  }, [])

  return (
    <div className="container py-10">
      <Card>
        <CardHeader>
          <CardTitle>Diagnóstico de Usuários</CardTitle>
          <CardDescription>Informações sobre as coleções de usuários no banco de dados</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">{error}</div>
          ) : (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium">Coleções no Banco de Dados</h3>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {data?.collections?.map((collection: string) => (
                    <li key={collection}>{collection}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium">Informações da Coleção de Usuários</h3>
                <div className="mt-2 space-y-2 text-sm">
                  <p>
                    Coleção utilizada:{" "}
                    <span className="font-mono bg-gray-100 px-1 rounded">{data?.usuariosCollection}</span>
                  </p>
                  <p>
                    Coleção "usuarios" existe:{" "}
                    <span className="font-semibold">{data?.usuariosCollectionExists ? "Sim" : "Não"}</span>
                  </p>
                  <p>
                    Coleção "users" existe:{" "}
                    <span className="font-semibold">{data?.usersCollectionExists ? "Sim" : "Não"}</span>
                  </p>
                  <p>
                    Número de usuários: <span className="font-semibold">{data?.usuariosCount}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Estrutura do Usuário</h3>
                <div className="mt-2 bg-gray-50 p-3 rounded-md overflow-auto">
                  <pre className="text-xs">{JSON.stringify(data?.estruturaUsuario, null, 2)}</pre>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium">Usuário Específico (sidrimthiago@gmail.com)</h3>
                {data?.usuarioEspecifico ? (
                  <div className="mt-2 bg-gray-50 p-3 rounded-md overflow-auto">
                    <pre className="text-xs">{JSON.stringify(data?.usuarioEspecifico, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="mt-2 text-red-500">Usuário não encontrado com busca exata</p>
                )}
              </div>

              <div>
                <h3 className="text-lg font-medium">Usuário com Regex (case insensitive)</h3>
                {data?.usuarioRegex ? (
                  <div className="mt-2 bg-gray-50 p-3 rounded-md overflow-auto">
                    <pre className="text-xs">{JSON.stringify(data?.usuarioRegex, null, 2)}</pre>
                  </div>
                ) : (
                  <p className="mt-2 text-red-500">Usuário não encontrado com busca case insensitive</p>
                )}
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={() => window.location.reload()}>Atualizar</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
