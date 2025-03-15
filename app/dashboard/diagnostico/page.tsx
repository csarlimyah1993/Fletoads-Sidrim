"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"

export default function DiagnosticoPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [diagnosticoData, setDiagnosticoData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const executarDiagnostico = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch("/api/diagnostico")

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao executar diagnóstico")
      }

      const data = await response.json()
      setDiagnosticoData(data)
      toast.success("Diagnóstico concluído com sucesso")
    } catch (error) {
      console.error("Erro ao executar diagnóstico:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido")
      toast.error("Erro ao executar diagnóstico")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    executarDiagnostico()
  }, [])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Diagnóstico do Banco de Dados</h2>
        <Button onClick={executarDiagnostico} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Executando...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar
            </>
          )}
        </Button>
      </div>

      {error && (
        <Card className="border-red-500">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-700 dark:text-red-300">Erro no Diagnóstico</CardTitle>
            <CardDescription>Ocorreu um erro ao executar o diagnóstico</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </CardContent>
        </Card>
      )}

      {isLoading && !diagnosticoData && (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Executando diagnóstico...</span>
        </div>
      )}

      {diagnosticoData && (
        <Tabs defaultValue="resumo" className="space-y-4">
          <TabsList>
            <TabsTrigger value="resumo">Resumo</TabsTrigger>
            <TabsTrigger value="usuario">Dados do Usuário</TabsTrigger>
            <TabsTrigger value="loja">Dados da Loja</TabsTrigger>
            <TabsTrigger value="json">JSON Completo</TabsTrigger>
          </TabsList>

          <TabsContent value="resumo">
            <Card>
              <CardHeader>
                <CardTitle>Resumo do Diagnóstico</CardTitle>
                <CardDescription>Visão geral da conexão com o banco de dados</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Status da Conexão</h3>
                    <p className="text-green-600 dark:text-green-400">{diagnosticoData.conexao}</p>
                  </div>
                  <div className="p-4 border rounded-md">
                    <h3 className="font-medium mb-2">Timestamp</h3>
                    <p>{new Date(diagnosticoData.timestamp).toLocaleString()}</p>
                  </div>
                </div>
                <div className="p-4 border rounded-md">
                  <h3 className="font-medium mb-2">Mensagem</h3>
                  <p>{diagnosticoData.mensagem}</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="usuario">
            <Card>
              <CardHeader>
                <CardTitle>Dados do Usuário</CardTitle>
                <CardDescription>Informações do usuário armazenadas no banco de dados</CardDescription>
              </CardHeader>
              <CardContent>
                {typeof diagnosticoData.dados.usuario === "object" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">ID</h3>
                        <p className="font-mono text-sm">{diagnosticoData.dados.usuario._id}</p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Nome</h3>
                        <p>{diagnosticoData.dados.usuario.nome}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Email</h3>
                        <p>{diagnosticoData.dados.usuario.email}</p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Cargo</h3>
                        <p>{diagnosticoData.dados.usuario.cargo}</p>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Perfil</h3>
                      <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs">
                        {JSON.stringify(diagnosticoData.dados.usuario.perfil, null, 2)}
                      </pre>
                    </div>
                  </div>
                ) : (
                  <p>Dados do usuário não disponíveis</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="loja">
            <Card>
              <CardHeader>
                <CardTitle>Dados da Loja</CardTitle>
                <CardDescription>Informações da loja armazenadas no banco de dados</CardDescription>
              </CardHeader>
              <CardContent>
                {typeof diagnosticoData.dados.loja === "object" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">ID</h3>
                        <p className="font-mono text-sm">{diagnosticoData.dados.loja._id}</p>
                      </div>
                      <div className="p-4 border rounded-md">
                        <h3 className="font-medium mb-2">Nome</h3>
                        <p>{diagnosticoData.dados.loja.nome}</p>
                      </div>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Descrição</h3>
                      <p>{diagnosticoData.dados.loja.descricao}</p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Status</h3>
                      <p>{diagnosticoData.dados.loja.status}</p>
                    </div>
                    <div className="p-4 border rounded-md">
                      <h3 className="font-medium mb-2">Categorias</h3>
                      <div className="flex flex-wrap gap-2">
                        {diagnosticoData.dados.loja.categorias?.map((categoria: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-md text-sm">
                            {categoria}
                          </span>
                        )) || <p>Nenhuma categoria cadastrada</p>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <p>Loja não encontrada para este usuário</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="json">
            <Card>
              <CardHeader>
                <CardTitle>JSON Completo</CardTitle>
                <CardDescription>Dados completos retornados pela API</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-auto text-xs h-[500px]">
                  {JSON.stringify(diagnosticoData, null, 2)}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

