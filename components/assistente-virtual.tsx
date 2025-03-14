"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, X, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import Image from "next/image"

export function AssistenteVirtual() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Olá! Sou o Fletoads, seu assistente virtual. Posso ajudar você a usar a plataforma, criar panfletos, configurar integrações e muito mais. Como posso te ajudar hoje?",
    },
  ])
  const [input, setInput] = useState("")

  const handleSend = () => {
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }])

      // Simular resposta do assistente após um breve delay
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Entendi sua dúvida. Posso ajudar você com: criação de panfletos, gerenciamento de produtos, configuração de integrações, personalização da vitrine, estratégias de marketing ou qualquer outro recurso da plataforma. O que você gostaria de aprender primeiro?",
          },
        ])
      }, 1000)

      setInput("")
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSend()
    }
  }

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-20 right-4 md:right-8 z-50 w-[90vw] max-w-md"
          >
            <Card className="border-emerald-100 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white p-4 flex justify-between items-center rounded-t-lg">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Fletoads</h3>
                    <p className="text-xs opacity-80">Assistente Virtual</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="h-8 w-8 text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="p-0">
                <div className="h-[350px] overflow-y-auto p-4 bg-gray-50">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`mb-4 flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.role === "assistant" && (
                        <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center mr-2 flex-shrink-0">
                          <Image src="/fleto-verde.svg" alt="Fleto" width={20} height={20} />
                        </div>
                      )}
                      <div
                        className={`rounded-lg px-4 py-2 max-w-[80%] ${
                          message.role === "user" ? "bg-emerald-600 text-white" : "bg-white border border-gray-200"
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.role === "user" && (
                        <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center ml-2 flex-shrink-0">
                          <span className="text-white text-xs">EU</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="p-3 border-t">
                <div className="flex w-full gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                  />
                  <Button onClick={handleSend} className="bg-emerald-600 hover:bg-emerald-700">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 md:right-8 z-50 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
      >
        <Bot className="h-6 w-6" />
      </motion.button>
    </>
  )
}

