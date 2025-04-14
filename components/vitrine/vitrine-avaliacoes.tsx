"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star } from "lucide-react"
import type { Loja } from "@/types/loja"
import type { VitrineConfig, Avaliacao } from "@/types/vitrine"

interface VitrineAvaliacoesProps {
  loja: Loja
  config: VitrineConfig
  avaliacoes: Avaliacao[]
  onAvaliacaoEnviada: () => void
}

export function VitrineAvaliacoes({ loja, config, avaliacoes, onAvaliacaoEnviada }: VitrineAvaliacoesProps) {
  const [avaliacaoNome, setAvaliacaoNome] = useState("")
  const [avaliacaoEmail, setAvaliacaoEmail] = useState("")
  const [avaliacaoNota, setAvaliacaoNota] = useState(5)
  const [avaliacaoComentario, setAvaliacaoComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  // Função para enviar avaliação
  const enviarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!avaliacaoNome || !avaliacaoComentario) {
      alert("Por favor, preencha seu nome e comentário.")
      return
    }

    setEnviando(true)

    try {
      const identifier = window.location.pathname.split("/").pop()

      const response = await fetch(`/api/vitrines/${identifier}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: avaliacaoNome,
          email: avaliacaoEmail,
          nota: avaliacaoNota,
          comentario: avaliacaoComentario,
        }),
      })

      if (response.ok) {
        // Limpar formulário
        setAvaliacaoNome("")
        setAvaliacaoEmail("")
        setAvaliacaoNota(5)
        setAvaliacaoComentario("")
        setEnviado(true)

        // Notificar o componente pai
        onAvaliacaoEnviada()

        // Resetar o estado de enviado após 3 segundos
        setTimeout(() => {
          setEnviado(false)
        }, 3000)
      } else {
        alert("Erro ao enviar avaliação. Tente novamente.")
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      alert("Erro ao enviar avaliação. Tente novamente.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <section className="py-16 px-4 bg-gray-100 dark:bg-gray-800">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Avaliações</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Lista de Avaliações */}
          <div>
            <h3 className="text-xl font-semibold mb-4">O que dizem sobre nós</h3>
            {avaliacoes.length > 0 ? (
              <div className="space-y-4">
                {avaliacoes.map((avaliacao) => (
                  <Card key={avaliacao.id}>
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <Avatar>
                          <AvatarImage src={avaliacao.avatar || "/placeholder.svg"} alt={avaliacao.nome} />
                          <AvatarFallback>{avaliacao.nome.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{avaliacao.nome}</h4>
                            <div className="flex">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className="h-4 w-4"
                                  fill={star <= avaliacao.nota ? "#FFD700" : "none"}
                                  stroke={star <= avaliacao.nota ? "#FFD700" : "#CBD5E1"}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {typeof avaliacao.data === "string"
                              ? new Date(avaliacao.data).toLocaleDateString()
                              : avaliacao.data.toLocaleDateString()}
                          </p>
                          <p className="mt-2">{avaliacao.comentario}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">Ainda não há avaliações. Seja o primeiro a avaliar!</p>
            )}
          </div>

          {/* Formulário de Avaliação */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Deixe sua avaliação</h3>
            {enviado ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-green-600 dark:text-green-300"
                    >
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-medium mb-2">Obrigado pelo feedback!</h3>
                  <p className="text-gray-600 dark:text-gray-400">Sua avaliação foi enviada com sucesso.</p>
                </CardContent>
              </Card>
            ) : (
              <form onSubmit={enviarAvaliacao} className="space-y-4">
                <div>
                  <Label htmlFor="avaliacaoNome">Nome</Label>
                  <Input
                    type="text"
                    id="avaliacaoNome"
                    placeholder="Seu nome"
                    value={avaliacaoNome}
                    onChange={(e) => setAvaliacaoNome(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="avaliacaoEmail">Email</Label>
                  <Input
                    type="email"
                    id="avaliacaoEmail"
                    placeholder="seu@email.com (opcional)"
                    value={avaliacaoEmail}
                    onChange={(e) => setAvaliacaoEmail(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="avaliacaoNota">Nota</Label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((nota) => (
                      <button
                        key={nota}
                        type="button"
                        className={`p-1 rounded-full transition-colors ${
                          avaliacaoNota >= nota
                            ? "bg-yellow-500 hover:bg-yellow-400"
                            : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        }`}
                        onClick={() => setAvaliacaoNota(nota)}
                      >
                        <Star className="h-5 w-5 text-white" />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <Label htmlFor="avaliacaoComentario">Comentário</Label>
                  <Textarea
                    id="avaliacaoComentario"
                    placeholder="Seu comentário"
                    rows={4}
                    value={avaliacaoComentario}
                    onChange={(e) => setAvaliacaoComentario(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={enviando}
                  style={{
                    backgroundColor: config.corPrimaria,
                    color: config.corTexto,
                  }}
                >
                  {enviando ? "Enviando..." : "Enviar Avaliação"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
