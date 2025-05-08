"use client"

import { TermosFooter } from "./termos-footer"
import { useState, useEffect } from "react"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

// Caminhos corretos dos arquivos - EXATAMENTE como aparecem no explorador de arquivos
const TERMOS_USO_PATH = "/assets/Termos de Uso_V1.pdf" // Com espaços, não underscores
const POLITICA_PRIVACIDADE_PATH = "/assets/Politica_Privacidade_V1.pdf" // Sem acento

// Função para verificar se um arquivo existe
async function verificarArquivo(caminho: string): Promise<boolean> {
  try {
    console.log(`Verificando arquivo em: ${caminho}`)
    const response = await fetch(caminho, { method: "HEAD" })
    console.log(
      `Resultado para ${caminho}: ${response.ok ? "Encontrado" : "Não encontrado"} (status: ${response.status})`,
    )
    return response.ok
  } catch (error) {
    console.error(`Erro ao verificar arquivo ${caminho}:`, error)
    return false
  }
}

export const TermosContent = () => {
  const [arquivosDisponiveis, setArquivosDisponiveis] = useState({
    termos: false,
    politica: false,
  })
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    async function checarArquivos() {
      setCarregando(true)

      // Verificar Termos de Uso - usando o caminho exato
      const termosExiste = await verificarArquivo(TERMOS_USO_PATH)

      // Verificar Política de Privacidade - usando o caminho exato
      const politicaExiste = await verificarArquivo(POLITICA_PRIVACIDADE_PATH)

      setArquivosDisponiveis({
        termos: termosExiste,
        politica: politicaExiste,
      })
      setCarregando(false)
    }

    checarArquivos()
  }, [])

  return (
    <div className="container mx-auto py-8">
      <main className="prose max-w-none">
        <h1>Termos e Condições</h1>

        {carregando ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <span className="ml-2">Verificando documentos...</span>
          </div>
        ) : (
          <>
            <div className="flex flex-col md:flex-row gap-6 my-8">
              <div className="flex-1 p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="h-5 w-5" />
                  Termos de Uso
                </h2>
                <p className="text-gray-600 mt-2">
                  Nossos termos de uso detalham as regras e diretrizes para utilização da plataforma FletoAds.
                </p>
                <div className="mt-4">
                  {arquivosDisponiveis.termos ? (
                    <Button className="flex items-center gap-2" asChild>
                      <a href={TERMOS_USO_PATH} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Baixar PDF
                      </a>
                    </Button>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Documento não disponível</AlertTitle>
                      <AlertDescription>
                        Não foi possível carregar o documento "Termos de Uso". Por favor, entre em contato com o
                        suporte.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              <div className="flex-1 p-6 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h2 className="flex items-center gap-2 text-xl font-semibold">
                  <FileText className="h-5 w-5" />
                  Política de Privacidade
                </h2>
                <p className="text-gray-600 mt-2">
                  Nossa política de privacidade explica como coletamos, usamos e protegemos seus dados pessoais.
                </p>
                <div className="mt-4">
                  {arquivosDisponiveis.politica ? (
                    <Button className="flex items-center gap-2" asChild>
                      <a href={POLITICA_PRIVACIDADE_PATH} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Baixar PDF
                      </a>
                    </Button>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Documento não disponível</AlertTitle>
                      <AlertDescription>
                        Não foi possível carregar o documento "Política de Privacidade". Por favor, entre em contato com
                        o suporte.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>
            </div>

            {(!arquivosDisponiveis.termos || !arquivosDisponiveis.politica) && (
              <Alert variant="warning" className="mt-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Informação para desenvolvedores</AlertTitle>
                <AlertDescription>
                  <p>Caminhos verificados:</p>
                  <ul className="mt-2 list-disc pl-5">
                    <li>
                      <code>{TERMOS_USO_PATH}</code> - {arquivosDisponiveis.termos ? "Encontrado" : "Não encontrado"}
                    </li>
                    <li>
                      <code>{POLITICA_PRIVACIDADE_PATH}</code> -{" "}
                      {arquivosDisponiveis.politica ? "Encontrado" : "Não encontrado"}
                    </li>
                  </ul>
                  <p className="mt-2">
                    Certifique-se de que os arquivos estão na pasta <code>public/assets/</code> com os nomes exatos
                    mostrados acima.
                  </p>
                </AlertDescription>
              </Alert>
            )}
          </>
        )}
      </main>
      <TermosFooter />
    </div>
  )
}
