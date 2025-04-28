"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Mail, CheckCircle } from "lucide-react"
import type { Loja } from "@/types/loja"
import type { VitrineConfig } from "@/types/vitrine"

interface VitrineNewsletterProps {
  loja: Loja
  config: VitrineConfig
}

export function VitrineNewsletter({ loja, config }: VitrineNewsletterProps) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  if (!config.widgetNewsletter?.ativo) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email) {
      setError("Por favor, informe seu email")
      return
    }

    try {
      setLoading(true)
      setError("")

      // Simular envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Sucesso
      setSuccess(true)
      setEmail("")

      // Reset após 5 segundos
      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (err) {
      setError("Erro ao cadastrar email. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <section
      className="py-12 px-4"
      style={{
        backgroundColor: config.widgetNewsletter.corFundo || "#dbeafe",
        color: config.widgetNewsletter.corTexto || "#1e40af",
      }}
    >
      <div className="container mx-auto max-w-3xl text-center">
        <Mail className="h-12 w-12 mx-auto mb-4" />
        <h2 className="text-3xl font-bold mb-2">{config.widgetNewsletter.titulo || "Assine nossa newsletter"}</h2>
        <p className="mb-6">
          {config.widgetNewsletter.descricao || "Receba novidades e promoções exclusivas no seu email"}
        </p>

        {success ? (
          <div className="flex items-center justify-center gap-2 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <span>Email cadastrado com sucesso!</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Seu melhor email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: config.corPrimaria || "#3b82f6",
                color: config.corTexto || "#ffffff",
              }}
            >
              {loading ? "Enviando..." : "Assinar"}
            </Button>
          </form>
        )}

        {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}
      </div>
    </section>
  )
}
