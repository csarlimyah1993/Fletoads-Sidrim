"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GeradorConteudo } from "@/components/gerador-conteudo"
import { AnalisadorConteudo } from "@/components/analisador-conteudo"
import { SugestorMelhorias } from "@/components/sugestor-melhorias"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function AIPage() {
  const [apiKeyConfigured, setApiKeyConfigured] = useState(true) // Assumimos que está configurado inicialmente

  // Verificar se a API key está configurada ao carregar a página
  useState(() => {
    const checkApiKey = async () => {
      try {
        const response = await fetch("/api/ai/gerar-conteudo", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            titulo: "Teste",
            categoria: "teste",
          }),
        })

        const data = await response.json()

        if (response.status === 500 && data.error === "API da TogetherAI não configurada") {
          setApiKeyConfigured(false)
        }
      } catch (error) {
        console.error("Erro ao verificar API key:", error)
      }
    }

    checkApiKey()
  })

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Assistente de IA</h2>
      </div>

      {!apiKeyConfigured && (
        <Alert variant="warning">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            A chave de API da TogetherAI não está configurada. Adicione a variável de ambiente TOGETHER_API_KEY para
            utilizar os recursos de IA.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="gerador" className="space-y-4">
        <TabsList>
          <TabsTrigger value="gerador">Gerador de Conteúdo</TabsTrigger>
          <TabsTrigger value="analisador">Analisador de Conteúdo</TabsTrigger>
          <TabsTrigger value="sugestor">Sugestões de Melhorias</TabsTrigger>
        </TabsList>
        <TabsContent value="gerador" className="space-y-4">
          <GeradorConteudo />
        </TabsContent>
        <TabsContent value="analisador" className="space-y-4">
          <AnalisadorConteudo />
        </TabsContent>
        <TabsContent className="space-y-4">
          <AnalisadorConteudo />
        </TabsContent>
        <TabsContent value="sugestor" className="space-y-4">
          <SugestorMelhorias />
        </TabsContent>
      </Tabs>
    </div>
  )
}

