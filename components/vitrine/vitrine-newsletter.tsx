"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineNewsletterProps {
  loja: Loja
  config: VitrineConfig
}

export function VitrineNewsletter({ loja, config }: VitrineNewsletterProps) {
  const [email, setEmail] = useState("")
  const [enviado, setEnviado] = useState(false)
  const [enviando, setEnviando] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) return

    setEnviando(true)

    try {
      // Simular envio (aqui você implementaria a chamada real à API)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      setEnviado(true)
      setEmail("")

      // Resetar após 3 segundos
      setTimeout(() => {
        setEnviado(false)
      }, 3000)
    } catch (error) {
      console.error("Erro ao enviar newsletter:", error)
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Fique por dentro das novidades</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Inscreva-se em nossa newsletter para receber ofertas exclusivas e novidades.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor email"
              className="flex-1"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              type="submit"
              disabled={enviando || enviado}
              style={{
                backgroundColor: config.corPrimaria,
                color: config.corTexto,
              }}
            >
              {enviando ? "Enviando..." : enviado ? "Enviado!" : "Inscrever-se"}
            </Button>
          </form>
          {enviado && (
            <p className="mt-4 text-green-600 dark:text-green-400">
              Obrigado por se inscrever! Em breve você receberá nossas novidades.
            </p>
          )}
        </div>
      </div>
    </section>
  )
}
