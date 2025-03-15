"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { MessageSquare, Send } from "lucide-react"

export function PanAISimplified() {
  const [message, setMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    // Apenas para teste
    console.log("Mensagem enviada:", message)
    setMessage("")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Ferramenta Pan AI</h1>
      <p className="text-gray-500 mb-6">
        Utilize nossa ferramenta de inteligência artificial para criar mensagens personalizadas.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Chat com IA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-50 rounded-md mb-4 p-4">
            <div className="flex items-start gap-2 mb-4">
              <div className="bg-primary text-primary-foreground p-2 rounded-md">
                <MessageSquare className="h-4 w-4" />
              </div>
              <div className="bg-gray-100 p-3 rounded-md">
                <p className="text-sm">Olá! Como posso ajudar você hoje?</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1"
            />
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

