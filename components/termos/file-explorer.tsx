"use client"

import { useState, useEffect } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Folder, File, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

// Esta é uma simulação - em um ambiente real, você precisaria de uma API no servidor
// para listar os arquivos, já que o cliente não pode acessar o sistema de arquivos diretamente
export function FileExplorer() {
  const [files, setFiles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const checkFiles = async () => {
    setLoading(true)
    setError(null)

    try {
      // Em um ambiente real, isso seria uma chamada para uma API que lista os arquivos
      // Aqui estamos apenas simulando com uma verificação de existência via HEAD
      const paths = [
        "/assets/Termos_de_uso_v1.pdf",
        "/assets/Politica_Privacidade_V1.pdf",
        "/assets/Termos de Uso_V1.pdf",
        "/assets/Política de Privacidade_V1.pdf",
      ]

      const foundFiles: string[] = []

      for (const path of paths) {
        try {
          const response = await fetch(path, { method: "HEAD" })
          if (response.ok) {
            foundFiles.push(path)
          }
        } catch (e) {
          console.error(`Erro ao verificar ${path}:`, e)
        }
      }

      setFiles(foundFiles)
    } catch (e) {
      setError("Erro ao verificar arquivos")
      console.error("Erro:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkFiles()
  }, [])

  return (
    <div className="border rounded-lg p-4 mt-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Explorador de Arquivos</h3>
        <Button variant="outline" size="sm" onClick={checkFiles} disabled={loading} className="flex items-center gap-1">
          {loading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          Atualizar
        </Button>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="border rounded p-2 bg-gray-50">
        <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
          <Folder className="h-4 w-4 text-blue-500" />
          <span className="font-mono text-sm">/public</span>
        </div>

        <div className="ml-4 mt-1">
          <div className="flex items-center gap-2 p-2 bg-gray-100 rounded">
            <Folder className="h-4 w-4 text-blue-500" />
            <span className="font-mono text-sm">/assets</span>
          </div>

          <div className="ml-4 mt-1 space-y-1">
            {loading ? (
              <div className="flex justify-center p-2">
                <RefreshCw className="h-4 w-4 animate-spin text-gray-400" />
              </div>
            ) : files.length > 0 ? (
              files.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded">
                  <File className="h-4 w-4 text-red-500" />
                  <span className="font-mono text-xs">{file.split("/").pop()}</span>
                </div>
              ))
            ) : (
              <div className="p-2 text-sm text-gray-500 italic">Nenhum arquivo encontrado</div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        <p>
          <strong>Nota:</strong> Esta ferramenta verifica apenas se os arquivos estão acessíveis via HTTP. Para
          verificar a estrutura real de arquivos, acesse o servidor diretamente.
        </p>
      </div>
    </div>
  )
}
