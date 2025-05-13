"use client"

import { useEffect, useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ArquivoDebugProps {
  caminhos: string[]
}

export function ArquivoDebug({ caminhos }: ArquivoDebugProps) {
  const [status, setStatus] = useState<Record<string, boolean>>({})
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function verificarArquivos() {
      const resultados: Record<string, boolean> = {}

      for (const caminho of caminhos) {
        try {
          console.log(`Verificando arquivo: ${caminho}`)
          const response = await fetch(caminho, { method: "HEAD" })
          resultados[caminho] = response.ok
          console.log(
            `Resultado para ${caminho}: ${response.ok ? "Encontrado" : "Não encontrado"} (status: ${response.status})`,
          )
        } catch (error) {
          console.error(`Erro ao verificar arquivo ${caminho}:`, error)
          resultados[caminho] = false
        }
      }

      setStatus(resultados)
      setCarregando(false)
    }

    verificarArquivos()
  }, [caminhos])

  if (carregando) {
    return <div className="p-4 text-center">Verificando arquivos...</div>
  }

  return (
    <div className="space-y-4 my-4">
      <h3 className="text-lg font-medium">Diagnóstico de Arquivos</h3>
      {caminhos.map((caminho) => (
        <Alert key={caminho} variant={status[caminho] ? "default" : "destructive"}>
          <div className="flex items-start">
            {status[caminho] ? (
              <CheckCircle className="h-4 w-4 mt-0.5 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5" />
            )}
            <div className="ml-3">
              <AlertTitle>{status[caminho] ? "Arquivo encontrado" : "Arquivo não encontrado"}</AlertTitle>
              <AlertDescription className="break-all">Caminho: {caminho}</AlertDescription>
            </div>
          </div>
        </Alert>
      ))}
    </div>
  )
}
