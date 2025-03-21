"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { PlanUpgradeBanner } from "@/components/planos/plan-upgrade-banner"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { Bot, Send, Lock, Sparkles, ArrowRight } from "lucide-react"

export default function PanAIPage() {
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { hasAI } = usePlanFeatures()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || !hasAI) return

    setIsLoading(true)
    // Simulação de envio
    setTimeout(() => {
      setMessage("")
      setIsLoading(false)
    }, 1000)
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Pan AI Assistant</h2>
      </div>

      {!hasAI ? (
        <Card className="border-dashed border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Recurso Premium
            </CardTitle>
            <CardDescription>O Pan AI Assistant está disponível apenas para planos pagos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Crie panfletos automaticamente</h4>
                  <p className="text-xs text-muted-foreground">
                    Gere panfletos profissionais com apenas algumas instruções.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Otimize suas descrições</h4>
                  <p className="text-xs text-muted-foreground">
                    Melhore as descrições dos seus produtos automaticamente.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Sugestões de marketing</h4>
                  <p className="text-xs text-muted-foreground">Receba ideias para melhorar suas campanhas.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="bg-primary/10 p-2 rounded-full">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h4 className="text-sm font-medium">Análise de tendências</h4>
                  <p className="text-xs text-muted-foreground">Descubra tendências para o seu segmento.</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" asChild>
              <a href="/planos">
                Fazer upgrade para acessar
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </CardFooter>
        </Card>
      ) : (
        <>
          <PlanUpgradeBanner />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Pan AI Assistant
              </CardTitle>
              <CardDescription>
                Seu assistente de IA para criar e otimizar panfletos, produtos e marketing.
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-[400px] flex flex-col">
              <div className="flex-1 mb-4 bg-muted/50 rounded-lg p-4 overflow-y-auto">
                <div className="flex gap-3 mb-4">
                  <div className="bg-primary/10 p-2 h-8 w-8 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">Olá! Sou o Pan AI Assistant. Como posso ajudar você hoje?</p>
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <div className="bg-primary/10 p-2 h-8 w-8 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div className="bg-muted rounded-lg p-3 max-w-[80%]">
                    <p className="text-sm">Posso ajudar com:</p>
                    <ul className="text-sm list-disc pl-5 mt-1">
                      <li>Criação de panfletos</li>
                      <li>Otimização de descrições de produtos</li>
                      <li>Sugestões de marketing</li>
                      <li>Análise de tendências</li>
                    </ul>
                  </div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="flex gap-2">
                <Textarea
                  placeholder="Digite sua mensagem aqui..."
                  className="min-h-[60px]"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <Button type="submit" size="icon" className="h-[60px] w-[60px]" disabled={!message.trim() || isLoading}>
                  <Send className="h-5 w-5" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}

