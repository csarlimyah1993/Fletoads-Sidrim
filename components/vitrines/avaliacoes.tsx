"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Star, StarHalf, Send, User } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"

interface Avaliacao {
  _id: string
  lojaId: string
  usuarioId: string
  usuarioNome: string
  usuarioEmail: string
  nota: number
  comentario: string
  resposta?: string
  dataAvaliacao: string
  dataResposta?: string
}

interface AvaliacoesProps {
  lojaId: string
}

export function Avaliacoes({ lojaId }: AvaliacoesProps) {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([])
  const [loading, setLoading] = useState(true)
  const [nota, setNota] = useState(5)
  const [comentario, setComentario] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [mediaAvaliacoes, setMediaAvaliacoes] = useState(0)

  useEffect(() => {
    fetchAvaliacoes()
  }, [lojaId])

  const fetchAvaliacoes = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/avaliacoes?lojaId=${lojaId}`)
      if (response.ok) {
        const data = await response.json()
        setAvaliacoes(data.avaliacoes)

        // Calcular média das avaliações
        if (data.avaliacoes.length > 0) {
          const soma = data.avaliacoes.reduce((acc: number, av: Avaliacao) => acc + av.nota, 0)
          setMediaAvaliacoes(soma / data.avaliacoes.length)
        }
      }
    } catch (error) {
      console.error("Erro ao buscar avaliações:", error)
      toast({
        title: "Erro",
        description: "Não foi possível carregar as avaliações",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast({
        title: "Atenção",
        description: "Você precisa estar logado para enviar uma avaliação",
        variant: "destructive",
      })
      return
    }

    if (comentario.trim().length < 3) {
      toast({
        title: "Atenção",
        description: "O comentário deve ter pelo menos 3 caracteres",
        variant: "destructive",
      })
      return
    }

    try {
      setEnviando(true)
      const response = await fetch("/api/avaliacoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lojaId,
          nota,
          comentario,
        }),
      })

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Sua avaliação foi enviada com sucesso!",
        })
        setComentario("")
        fetchAvaliacoes()
      } else {
        const error = await response.json()
        throw new Error(error.message || "Erro ao enviar avaliação")
      }
    } catch (error) {
      console.error("Erro ao enviar avaliação:", error)
      toast({
        title: "Erro",
        description: (error as Error).message || "Não foi possível enviar sua avaliação",
        variant: "destructive",
      })
    } finally {
      setEnviando(false)
    }
  }

  const renderStars = (rating: number) => {
    const stars = []
    const fullStars = Math.floor(rating)
    const hasHalfStar = rating % 1 >= 0.5

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="h-4 w-4 fill-yellow-400 text-yellow-400" />)
    }

    const emptyStars = 5 - stars.length
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="h-4 w-4 text-gray-300" />)
    }

    return stars
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl text-primary">Avaliações e Comentários</CardTitle>
          {avaliacoes.length > 0 && (
            <CardDescription className="flex items-center gap-2">
              <div className="flex">{renderStars(mediaAvaliacoes)}</div>
              <span className="font-medium">{mediaAvaliacoes.toFixed(1)}</span>
              <span className="text-muted-foreground">
                ({avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"})
              </span>
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {session ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Sua avaliação</label>
                <div className="flex gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} type="button" onClick={() => setNota(value)} className="focus:outline-none">
                      <Star
                        className={`h-6 w-6 ${value <= nota ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="comentario" className="block text-sm font-medium mb-2">
                  Seu comentário
                </label>
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Compartilhe sua experiência com esta loja..."
                  rows={4}
                  className="w-full"
                />
              </div>
              <Button type="submit" disabled={enviando} className="flex items-center gap-2">
                {enviando ? "Enviando..." : "Enviar avaliação"}
                <Send className="h-4 w-4" />
              </Button>
            </form>
          ) : (
            <div className="bg-muted p-4 rounded-md text-center">
              <p className="text-muted-foreground mb-2">Faça login para deixar sua avaliação</p>
              <Button asChild variant="outline">
                <a href="/login">Entrar</a>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-5 bg-muted rounded w-1/3"></div>
                <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-4 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : avaliacoes.length > 0 ? (
        <div className="space-y-4">
          {avaliacoes.map((avaliacao) => (
            <Card key={avaliacao._id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base">{avaliacao.usuarioNome}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(avaliacao.dataAvaliacao).toLocaleDateString("pt-BR")}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex">{renderStars(avaliacao.nota)}</div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground/90">{avaliacao.comentario}</p>

                {avaliacao.resposta && (
                  <div className="mt-4 pl-4 border-l-2 border-primary/30">
                    <p className="text-xs font-medium text-primary mb-1">Resposta da loja:</p>
                    <p className="text-sm text-foreground/80">{avaliacao.resposta}</p>
                    {avaliacao.dataResposta && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(avaliacao.dataResposta).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-6 text-center">
            <p className="text-muted-foreground">Ainda não há avaliações para esta loja.</p>
            <p className="text-sm text-muted-foreground mt-1">Seja o primeiro a avaliar!</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

