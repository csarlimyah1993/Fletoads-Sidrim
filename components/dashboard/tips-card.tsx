"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Lightbulb, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from "@/components/ui/button"

const tips = [
  {
    title: "Crie panfletos atrativos",
    description: "Use imagens de alta qualidade e textos concisos para criar panfletos que chamem a atenção dos clientes.",
    icon: "📄"
  },
  {
    title: "Mantenha seu catálogo atualizado",
    description: "Atualize regularmente seus produtos e preços para manter seus clientes informados sobre as novidades.",
    icon: "📦"
  },
  {
    title: "Use o PanAI para criar conteúdo",
    description: "Aproveite nossa ferramenta de IA para gerar textos persuasivos para seus panfletos e campanhas.",
    icon: "🤖"
  },
  {
    title: "Personalize sua vitrine",
    description: "Configure sua vitrine online com as cores da sua marca e adicione informações de contato completas.",
    icon: "🏪"
  },
  {
    title: "Integre com WhatsApp",
    description: "Configure a integração com WhatsApp para facilitar a comunicação com seus clientes.",
    icon: "📱"
  }
]

export function TipsCard() {
  const [currentTipIndex, setCurrentTipIndex] = useState(0)
  
  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length)
  }
  
  const prevTip = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length)
  }
  
  const currentTip = tips[currentTipIndex]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          Dicas e Sugestões
        </CardTitle>
        <CardDescription>
          Aprenda a aproveitar ao máximo o FletoAds
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-center text-4xl">
            {currentTip.icon}
          </div>
          
          <div className="text-center">
            <h3 className="text-lg font-medium">{currentTip.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{currentTip.description}</p>
          </div>
          
          <div className="flex justify-between items-center pt-2">
            <Button variant="outline" size="icon" onClick={prevTip}>
              <ChevronLeft className="h-4 w-4" />
              <span className="sr-only">Dica anterior</span>
            </Button>
            
            <div className="flex gap-1">
              {tips.map((_, index) => (
                <div 
                  key={index} 
                  className={`h-1.5 rounded-full ${
                    index === currentTipIndex 
                      ? "w-4 bg-primary" 
                      : "w-1.5 bg-muted"
                  }`}
                />
              ))}
            </div>
            
            <Button variant="outline" size="icon" onClick={nextTip}>
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Próxima dica</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
