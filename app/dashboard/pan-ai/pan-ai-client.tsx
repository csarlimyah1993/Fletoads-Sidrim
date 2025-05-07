"use client"

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, FileText, MessageSquare, TrendingUp, Lightbulb } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState("");

  const webhookUrl = 'https://n8n.robotizze.us/webhook-test/pan-ia'; // Updated Webhook URL

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

    setIsGenerating(true);
    setResult("");

    try {
      // --- Unified Webhook Call for ALL Tabs ---
      const formData = {
        action: activeTab, // Send the active tab as the action
        prompt: prompt,
      };
      console.log('Sending data to unified webhook:', formData);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      console.log('Unified webhook response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Unified webhook response error:', errorText);
        throw new Error(`Webhook unificado falhou com status: ${response.status}`);
      }

      const webhookResult = await response.json();
      console.log('Unified webhook response success:', webhookResult);

      // Handle response: Expect resultText for the prompt
      if (webhookResult.output && webhookResult.output.trim()) {
        setResult(webhookResult.output);
        toast({ title: 'Sucesso!', description: 'Prompt gerado com sucesso!' });
      } else {
        // Handle case where resultText is missing or empty
        console.warn('Webhook response successful, but missing or empty resultText:', webhookResult);
        setResult("Não foi possível gerar o prompt. Tente novamente.");
        toast({ title: 'Aviso', description: 'Não foi possível gerar o prompt a partir da resposta.', variant: 'destructive' });
      }
      // --- End Unified Webhook Call ---
    } catch (error) {
      console.error("Erro ao gerar conteúdo:", error)
      toast({
        title: "Erro",
        description: `Ocorreu um erro ao gerar o conteúdo: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Por favor, tente novamente.`,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  }

  const handleCopyPrompt = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result);
      toast({ title: 'Sucesso!', description: 'Prompt copiado para a área de transferência!' });
    } catch (err) {
      console.error('Failed to copy prompt: ', err);
      toast({ title: 'Erro', description: 'Falha ao copiar o prompt.', variant: 'destructive' });
    }
  };

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

            {/* Display Generated Prompt */}
            {result ? (
              <div className="mt-6 space-y-3">
                 <Label htmlFor="generated-prompt">Prompt Gerado:</Label>
                 <p className="text-sm text-muted-foreground">
                   Copie o prompt abaixo e cole no chat.com para gerar sua imagem:
                 </p>
                <Textarea
                  id="generated-prompt"
                  readOnly
                  value={result}
                  className="min-h-[100px] bg-muted"
                  rows={5}
                />
                <Button onClick={handleCopyPrompt} size="sm" variant="outline">
                  Copiar Prompt
                </Button>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-between items-center pt-4"> {/* Adjusted padding */}
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
