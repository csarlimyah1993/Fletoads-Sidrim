"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function CheckCollectionPage() {
  const [loading, setLoading] = useState(true)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/api/check-collection")
        const data = await response.json()

        if (response.ok) {
          setResult(data)
        } else {
          setError(data.error || "Erro ao verificar coleção")
        }
      } catch (error) {
        setError("Erro ao processar a solicitação: " + (error as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-3xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Verificação de Coleção</CardTitle>
          <CardDescription>Informações sobre a coleção de usuários no banco de dados</CardDescription>
        </CardHeader>
        <CardContent>
          {loading && <p>Carregando informações do banco de dados...</p>}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {result && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">Informações da Coleção</h3>
                <p>
                  <strong>Nome da coleção:</strong> {result.collectionName}
                </p>
                <p>
                  <strong>Número de documentos:</strong> {result.documentCount}
                </p>
              </div>

              {result.sampleDocuments && result.sampleDocuments.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold">Amostra de Documentos</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                      <thead>
                        <tr>
                          <th className="px-4 py-2 text-left">ID</th>
                          <th className="px-4 py-2 text-left">Email</th>
                          <th className="px-4 py-2 text-left">Nome</th>
                          <th className="px-4 py-2 text-left">Role</th>
                          <th className="px-4 py-2 text-left">Senha (início)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.sampleDocuments.map((doc: any, index: number) => (
                          <tr key={index} className={index % 2 === 0 ? "bg-gray-50 dark:bg-gray-800" : ""}>
                            <td className="px-4 py-2">{doc._id}</td>
                            <td className="px-4 py-2">{doc.email}</td>
                            <td className="px-4 py-2">{doc.nome}</td>
                            <td className="px-4 py-2">{doc.role}</td>
                            <td className="px-4 py-2">{doc.senha}...</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => window.location.reload()}>Atualizar Informações</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

