"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Send, Lightbulb, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export function PanAssistantPreview() {
  const [prompt, setPrompt] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  // Sugestões pré-definidas
  const sugestoes = [
    "Crie um panfleto para promoção de fim de semana",
    "Ideias para campanha de fidelidade",
    "Texto para anúncio de novo produto",
    "Promoção para liquidação de estoque",
  ]

  const handleGenerate = () => {
    if (!prompt.trim()) return

    setIsGenerating(true)
    // Simulação de geração
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <div className="relative">
          <Textarea
            placeholder="Descreva o que você precisa..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px] resize-none pr-12"
          />
          <Button
            size="icon"
            className="absolute bottom-2 right-2"
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {sugestoes.map((sugestao, index) => (
            <Badge
              key={index}
              variant="outline"
              className="cursor-pointer hover:bg-secondary"
              onClick={() => setPrompt(sugestao)}
            >
              <Lightbulb className="h-3 w-3 mr-1" />
              {sugestao}
            </Badge>
          ))}
        </div>
      </div>

      <Card className="bg-muted/40">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h4 className="text-sm font-medium">Sugestão do Pan Assistant</h4>
          </div>

          <div className="text-sm">
            {isGenerating ? (
              <div className="space-y-2">
                <div className="h-4 bg-muted rounded-md animate-pulse w-full" />
                <div className="h-4 bg-muted rounded-md animate-pulse w-[90%]" />
                <div className="h-4 bg-muted rounded-md animate-pulse w-[95%]" />
                <div className="h-4 bg-muted rounded-md animate-pulse w-[85%]" />
                <div className="h-4 bg-muted rounded-md animate-pulse w-[70%]" />
              </div>
            ) : (
              <p>
                Promoção Relâmpago de Fim de Semana! 🔥 Aproveite descontos de até 50% em produtos selecionados. Válido
                apenas sexta e sábado. Não perca esta oportunidade incrível! Visite nossa loja ou compre online.
                #PromoçãoEspecial #DescontosIncríveis
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ThumbsUp className="h-4 w-4 mr-1" />
                <span className="text-xs">Útil</span>
              </Button>
              <Button variant="ghost" size="sm" className="h-8 px-2">
                <ThumbsDown className="h-4 w-4 mr-1" />
                <span className="text-xs">Melhorar</span>
              </Button>
            </div>
            <Button variant="outline" size="sm" className="h-8">
              <Copy className="h-4 w-4 mr-1" />
              <span className="text-xs">Copiar</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

