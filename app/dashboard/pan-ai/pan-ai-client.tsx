"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, FileText, MessageSquare, TrendingUp, Lightbulb } from "lucide-react"
import { toast } from "@/hooks/use-toast"

interface PanAIClientProps {
  userData: {
    id: string
    nome: string
    email: string
    plano: string
    isPremium: boolean
  }
}

export default function PanAIClient({ userData }: PanAIClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("panfletos")
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState("")

  // Verificar se o usuário tem acesso ao recurso premium
  useEffect(() => {
    if (!userData.isPremium) {
      toast({
        title: "Recurso Premium",
        description: "O Pan AI Assistant está disponível apenas para planos pagos.",
        variant: "destructive",
      })
    }
  }, [userData.isPremium])

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Entrada vazia",
        description: "Por favor, forneça uma instrução para o assistente.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    setResult("")

    try {
      // Simular uma chamada de API para o modelo de IA
      // Em produção, isso seria uma chamada real para um serviço de IA como OpenAI
      await new Promise((resolve) => setTimeout(resolve, 2000))

      let generatedResult = ""

      switch (activeTab) {
        case "panfletos":
          generatedResult = `# Panfleto: ${prompt}\n\n## Título Chamativo\n\nTexto promocional gerado com base na sua solicitação: "${prompt}"\n\n- Ponto de destaque 1\n- Ponto de destaque 2\n- Ponto de destaque 3\n\nCHAMADA PARA AÇÃO IMPACTANTE!`
          break
        case "descricoes":
          generatedResult = `Descrição otimizada para: "${prompt}"\n\n${prompt} - agora com uma descrição mais atraente, usando palavras-chave relevantes e destacando os principais benefícios do produto. Esta descrição foi criada para aumentar a conversão e melhorar o SEO da sua loja.`
          break
        case "marketing":
          generatedResult = `Sugestões de marketing para: "${prompt}"\n\n1. Crie uma campanha de email marketing destacando os benefícios exclusivos\n2. Utilize depoimentos de clientes satisfeitos nas redes sociais\n3. Ofereça um desconto por tempo limitado para aumentar a urgência\n4. Desenvolva um programa de indicação para expandir sua base de clientes`
          break
        case "tendencias":
          generatedResult = `Análise de tendências para: "${prompt}"\n\n- Tendência 1: Crescimento de 23% no interesse por produtos sustentáveis\n- Tendência 2: Aumento na busca por experiências personalizadas\n- Tendência 3: Maior engajamento em conteúdos de vídeo curtos\n- Tendência 4: Preferência por marcas com propósito social claro`
          break
        default:
          generatedResult = `Resultado para: "${prompt}"\n\nConteúdo gerado com base na sua solicitação.`
      }

      setResult(generatedResult)
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Se o usuário não for premium, mostrar página de upgrade
  if (!userData.isPremium) {
    return (
      <div className="container mx-auto py-10 space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Pan AI Assistant</h1>
          <p className="text-muted-foreground">Seu assistente de IA para marketing e criação de conteúdo</p>
        </div>

        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-amber-500" />
              Recurso Premium
            </CardTitle>
            <CardDescription>O Pan AI Assistant está disponível apenas para planos pagos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start space-x-3">
                <FileText className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Crie panfletos automaticamente</h3>
                  <p className="text-sm text-muted-foreground">
                    Gere panfletos profissionais com apenas algumas instruções.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageSquare className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Otimize suas descrições</h3>
                  <p className="text-sm text-muted-foreground">
                    Melhore as descrições dos seus produtos automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Lightbulb className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Sugestões de marketing</h3>
                  <p className="text-sm text-muted-foreground">Receba ideias para melhorar suas campanhas.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <TrendingUp className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="font-medium">Análise de tendências</h3>
                  <p className="text-sm text-muted-foreground">Descubra tendências para o seu segmento.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => router.push("/planos")}>
              Fazer upgrade para acessar
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  // Interface para usuários premium
  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Pan AI Assistant</h1>
        <p className="text-muted-foreground">Seu assistente de IA para marketing e criação de conteúdo</p>
      </div>

      <Tabs defaultValue="panfletos" value={activeTab} onValueChange={setActiveTab} className="max-w-4xl mx-auto">
        <TabsList className="grid grid-cols-4 mb-8">
          <TabsTrigger value="panfletos" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Panfletos
          </TabsTrigger>
          <TabsTrigger value="descricoes" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" /> Descrições
          </TabsTrigger>
          <TabsTrigger value="marketing" className="flex items-center">
            <Lightbulb className="mr-2 h-4 w-4" /> Marketing
          </TabsTrigger>
          <TabsTrigger value="tendencias" className="flex items-center">
            <TrendingUp className="mr-2 h-4 w-4" /> Tendências
          </TabsTrigger>
        </TabsList>

        <Card>
          <CardHeader>
            <CardTitle>
              {activeTab === "panfletos" && "Gerador de Panfletos"}
              {activeTab === "descricoes" && "Otimizador de Descrições"}
              {activeTab === "marketing" && "Sugestões de Marketing"}
              {activeTab === "tendencias" && "Análise de Tendências"}
            </CardTitle>
            <CardDescription>
              {activeTab === "panfletos" && "Crie panfletos profissionais com apenas algumas instruções."}
              {activeTab === "descricoes" && "Melhore as descrições dos seus produtos automaticamente."}
              {activeTab === "marketing" && "Receba ideias para melhorar suas campanhas."}
              {activeTab === "tendencias" && "Descubra tendências para o seu segmento."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">O que você deseja criar?</Label>
              <Textarea
                id="prompt"
                placeholder={
                  activeTab === "panfletos"
                    ? "Ex: Crie um panfleto para uma promoção de 30% em todos os produtos da minha loja de roupas"
                    : activeTab === "descricoes"
                      ? "Ex: Otimize a descrição deste produto: Camiseta branca de algodão, tamanhos P, M, G"
                      : activeTab === "marketing"
                        ? "Ex: Preciso de ideias para promover minha loja de calçados esportivos"
                        : "Ex: Quais são as tendências atuais no mercado de cosméticos naturais?"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
              />
            </div>

            {result && (
              <div className="mt-6 p-4 bg-muted rounded-md">
                <Label>Resultado:</Label>
                <div className="mt-2 whitespace-pre-line">{result}</div>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setPrompt("")}>
              Limpar
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Gerar com IA
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </Tabs>
    </div>
  )
}
