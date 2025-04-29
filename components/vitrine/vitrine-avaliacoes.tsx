"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Star, Loader2, MessageSquare, ThumbsUp, Award, Calendar } from "lucide-react"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { Badge } from "@/components/ui/badge"
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
  const [error, setError] = useState<string | null>(null)
  const [filteredAvaliacoes, setFilteredAvaliacoes] = useState<Avaliacao[]>(avaliacoes)
  const [filtro, setFiltro] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<"recentes" | "antigas" | "melhores">("recentes")

  // Atualizar avaliações filtradas quando as avaliações ou filtros mudarem
  useEffect(() => {
    let filtered = [...avaliacoes]

    // Aplicar filtro por nota
    if (filtro !== null) {
      filtered = filtered.filter((a) => a.nota === filtro)
    }

    // Aplicar ordenação
    if (sortBy === "recentes") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.data)
        const dateB = new Date(b.data)
        return dateB.getTime() - dateA.getTime()
      })
    } else if (sortBy === "antigas") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.data)
        const dateB = new Date(b.data)
        return dateA.getTime() - dateB.getTime()
      })
    } else if (sortBy === "melhores") {
      filtered.sort((a, b) => b.nota - a.nota)
    }

    setFilteredAvaliacoes(filtered)
  }, [avaliacoes, filtro, sortBy])

  // Calcular média das avaliações
  const mediaAvaliacoes =
    avaliacoes.length > 0 ? avaliacoes.reduce((acc, curr) => acc + curr.nota, 0) / avaliacoes.length : 0

  // Calcular contagem de cada nota
  const notasCounts = [1, 2, 3, 4, 5].map((nota) => ({
    nota,
    count: avaliacoes.filter((a) => a.nota === nota).length,
    percentage:
      avaliacoes.length > 0
        ? Math.round((avaliacoes.filter((a) => a.nota === nota).length / avaliacoes.length) * 100)
        : 0,
  }))

  // Função para enviar avaliação
  const enviarAvaliacao = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!avaliacaoNome || !avaliacaoComentario) {
      setError("Por favor, preencha seu nome e comentário.")
      return
    }

    setEnviando(true)

    try {
      const identifier = loja._id || window.location.pathname.split("/").pop()

      if (!identifier) {
        throw new Error("ID da vitrine não encontrado")
      }

      console.log("Enviando avaliação para:", identifier)

      const response = await fetch(`/api/vitrines/${identifier}/avaliacoes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: avaliacaoNome,
          email: avaliacaoEmail || undefined, // Don't send empty string
          nota: avaliacaoNota,
          comentario: avaliacaoComentario,
          lojaId: loja._id, // Make sure to include the lojaId
        }),
      })

      const responseData = await response.json()

      if (!response.ok) {
        console.error("Erro na resposta:", responseData)
        throw new Error(responseData.error || "Erro ao enviar avaliação")
      }

      // Limpar formulário
      setAvaliacaoNome("")
      setAvaliacaoEmail("")
      setAvaliacaoNota(5)
      setAvaliacaoComentario("")
      setEnviado(true)

      // Notificar o componente pai
      onAvaliacaoEnviada()

      toast.success("Avaliação enviada com sucesso!")

      // Resetar o estado de enviado após 3 segundos
      setTimeout(() => {
        setEnviado(false)
      }, 3000)
    } catch (error: any) {
      console.error("Erro ao enviar avaliação:", error)
      setError(error.message || "Erro ao enviar avaliação. Tente novamente.")
      toast.error(error.message || "Erro ao enviar avaliação")
    } finally {
      setEnviando(false)
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  // Função para formatar data
  const formatDate = (dateString: string | Date) => {
    const date = typeof dateString === "string" ? new Date(dateString) : dateString
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  return (
    <section
      className="py-16 px-4 bg-gradient-to-b from-white to-gray-100 dark:from-gray-900 dark:to-gray-800"
      id="avaliacoes"
    >
      <div className="container mx-auto">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl font-bold mb-2">Avaliações dos Clientes</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Veja o que nossos clientes estão dizendo sobre {loja.nome}. Compartilhe também a sua experiência!
          </p>
        </motion.div>

        {/* Resumo das avaliações */}
        {avaliacoes.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-10 max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Média geral */}
              <div className="flex flex-col items-center justify-center p-4 border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-700">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">{mediaAvaliacoes.toFixed(1)}</span>
                <div className="flex items-center my-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className="h-5 w-5"
                      fill={star <= Math.round(mediaAvaliacoes) ? "#FFD700" : "none"}
                      stroke={star <= Math.round(mediaAvaliacoes) ? "#FFD700" : "#CBD5E1"}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Baseado em {avaliacoes.length} {avaliacoes.length === 1 ? "avaliação" : "avaliações"}
                </span>
              </div>

              {/* Distribuição das notas */}
              <div className="col-span-2">
                <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-3">Distribuição das notas</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((nota) => {
                    const notaData = notasCounts.find((n) => n.nota === nota)
                    return (
                      <div key={nota} className="flex items-center gap-2">
                        <div className="flex items-center w-12">
                          <span className="text-sm font-medium">{nota}</span>
                          <Star className="h-3 w-3 ml-1 text-yellow-500" fill="#FFD700" />
                        </div>
                        <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-yellow-500"
                            style={{ width: `${notaData?.percentage || 0}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 w-12 text-right">
                          {notaData?.count || 0}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Avaliação */}
          <motion.div
            className="lg:order-2"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card className="shadow-lg border-0">
              <CardHeader
                className="bg-gradient-to-r from-blue-600 to-indigo-600"
                style={{
                  background: `linear-gradient(to right, ${config.corPrimaria || "#3b82f6"}, ${config.corSecundaria || "#6366f1"})`,
                }}
              >
                <CardTitle className="text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Deixe sua avaliação
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <AnimatePresence mode="wait">
                  {enviado ? (
                    <motion.div
                      key="success"
                      className="text-center py-8"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    >
                      <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="32"
                          height="32"
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
                      <p className="text-gray-600 dark:text-gray-400">
                        Sua avaliação foi enviada com sucesso e será exibida em breve.
                      </p>
                    </motion.div>
                  ) : (
                    <motion.form
                      key="form"
                      onSubmit={enviarAvaliacao}
                      className="space-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      {error && (
                        <motion.div
                          className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-3 rounded-md text-sm"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          {error}
                        </motion.div>
                      )}

                      <div>
                        <Label htmlFor="avaliacaoNome" className="text-sm font-medium">
                          Nome
                        </Label>
                        <Input
                          type="text"
                          id="avaliacaoNome"
                          placeholder="Seu nome"
                          value={avaliacaoNome}
                          onChange={(e) => setAvaliacaoNome(e.target.value)}
                          className="mt-1"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="avaliacaoEmail" className="text-sm font-medium">
                          Email
                        </Label>
                        <Input
                          type="email"
                          id="avaliacaoEmail"
                          placeholder="seu@email.com (opcional)"
                          value={avaliacaoEmail}
                          onChange={(e) => setAvaliacaoEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="avaliacaoNota" className="text-sm font-medium">
                          Sua avaliação
                        </Label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((nota) => (
                            <motion.button
                              key={nota}
                              type="button"
                              className={`p-2 rounded-full transition-colors ${
                                avaliacaoNota >= nota
                                  ? "bg-yellow-500 hover:bg-yellow-400"
                                  : "bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                              }`}
                              onClick={() => setAvaliacaoNota(nota)}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              aria-label={`Avaliar com ${nota} estrelas`}
                            >
                              <Star className="h-6 w-6 text-white" />
                            </motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="avaliacaoComentario" className="text-sm font-medium">
                          Comentário
                        </Label>
                        <Textarea
                          id="avaliacaoComentario"
                          placeholder="Conte sua experiência com nossa loja..."
                          rows={4}
                          value={avaliacaoComentario}
                          onChange={(e) => setAvaliacaoComentario(e.target.value)}
                          className="mt-1 resize-none"
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
                        className="w-full transition-all hover:opacity-90"
                      >
                        {enviando ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          "Enviar Avaliação"
                        )}
                      </Button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>

          {/* Lista de Avaliações */}
          <div className="lg:col-span-2 lg:order-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <motion.h3
                className="text-xl font-semibold"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                Comentários dos clientes
              </motion.h3>

              {avaliacoes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 md:mt-0">
                  {/* Filtros de estrelas */}
                  <div className="flex items-center gap-1">
                    {[null, 5, 4, 3, 2, 1].map((nota) => (
                      <motion.button
                        key={nota === null ? "all" : nota}
                        type="button"
                        className={`px-2 py-1 text-xs rounded-full ${
                          filtro === nota
                            ? "bg-yellow-500 text-white"
                            : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                        }`}
                        onClick={() => setFiltro(nota)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {nota === null ? "Todos" : `${nota}★`}
                      </motion.button>
                    ))}
                  </div>

                  {/* Ordenação */}
                  <select
                    className="text-xs px-2 py-1 rounded-full bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-none"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as "recentes" | "antigas" | "melhores")}
                  >
                    <option value="recentes">Mais recentes</option>
                    <option value="antigas">Mais antigas</option>
                    <option value="melhores">Melhor avaliadas</option>
                  </select>
                </div>
              )}
            </div>

            {filteredAvaliacoes.length > 0 ? (
              <motion.div
                className="space-y-4"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {filteredAvaliacoes.map((avaliacao) => (
                  <motion.div key={avaliacao.id} variants={itemVariants}>
                    <Card className="overflow-hidden border-0 shadow-md">
                      <CardHeader className="pb-2 pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-white shadow-sm">
                              <AvatarImage src={avaliacao.avatar || "/placeholder.svg"} alt={avaliacao.nome} />
                              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
                                {avaliacao.nome.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium flex items-center gap-2">
                                {avaliacao.nome}
                                {avaliacao.nota === 5 && (
                                  <Badge variant="outline" className="ml-1 text-xs py-0 flex items-center gap-1">
                                    <Award className="h-3 w-3" />
                                    Cliente destaque
                                  </Badge>
                                )}
                              </h4>
                              <div className="flex items-center gap-1 mt-1">
                                <div className="flex">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className="h-3.5 w-3.5"
                                      fill={star <= avaliacao.nota ? "#FFD700" : "none"}
                                      stroke={star <= avaliacao.nota ? "#FFD700" : "#CBD5E1"}
                                    />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(avaliacao.data)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2 pb-4">
                        <p className="text-gray-700 dark:text-gray-300">{avaliacao.comentario}</p>
                      </CardContent>
                      <CardFooter className="pt-0 pb-3 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                          <button className="flex items-center gap-1 hover:text-blue-600 transition-colors">
                            <ThumbsUp className="h-3.5 w-3.5" />
                            Útil
                          </button>
                          <span>•</span>
                          <button className="hover:text-blue-600 transition-colors">Responder</button>
                        </div>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-8 text-center"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
              >
                {avaliacoes.length > 0 ? (
                  <>
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h4 className="text-lg font-medium mb-1">Nenhuma avaliação encontrada</h4>
                    <p className="text-gray-500 dark:text-gray-400">
                      Não encontramos avaliações com os filtros selecionados.
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => setFiltro(null)}>
                      Limpar filtros
                    </Button>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                    <h4 className="text-lg font-medium mb-1">Ainda não há avaliações</h4>
                    <p className="text-gray-500 dark:text-gray-400">Seja o primeiro a avaliar {loja.nome}!</p>
                  </>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
