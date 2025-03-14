"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Star, ThumbsUp, ThumbsDown, MessageSquare, Trash2, Check, X } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"

export default function ProdutoAvaliacoesPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")

  const [configuracoes, setConfiguracoes] = useState({
    permitirAvaliacoes: true,
    moderacaoAtiva: true,
    notificarNovasAvaliacoes: true,
    exibirEstrelas: true,
    permitirFotos: true,
  })

  const [avaliacoes, setAvaliacoes] = useState([
    {
      id: 1,
      cliente: "João Silva",
      email: "joao.silva@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      data: "15/03/2023",
      estrelas: 5,
      titulo: "Excelente produto!",
      comentario:
        "Comprei esse tênis e estou muito satisfeito. O conforto é incrível e o material é de ótima qualidade. Recomendo!",
      status: "aprovado",
      likes: 12,
      dislikes: 1,
      respostas: 1,
    },
    {
      id: 2,
      cliente: "Maria Oliveira",
      email: "maria.oliveira@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      data: "02/04/2023",
      estrelas: 4,
      titulo: "Bom custo-benefício",
      comentario:
        "O tênis é confortável e bonito. Só achei que o tamanho ficou um pouco maior do que o esperado, mas nada que comprometesse o uso.",
      status: "aprovado",
      likes: 5,
      dislikes: 0,
      respostas: 0,
    },
    {
      id: 3,
      cliente: "Pedro Santos",
      email: "pedro.santos@email.com",
      avatar: "/placeholder.svg?height=40&width=40",
      data: "18/04/2023",
      estrelas: 2,
      titulo: "Qualidade abaixo do esperado",
      comentario: "Achei que o material seria melhor. Após algumas semanas de uso, já está apresentando desgaste.",
      status: "pendente",
      likes: 0,
      dislikes: 0,
      respostas: 0,
    },
  ])

  const handleSwitchChange = (name, checked) => {
    setConfiguracoes({
      ...configuracoes,
      [name]: checked,
    })
  }

  const aprovarAvaliacao = (id) => {
    setAvaliacoes(
      avaliacoes.map((avaliacao) => (avaliacao.id === id ? { ...avaliacao, status: "aprovado" } : avaliacao)),
    )

    toast({
      title: "Avaliação aprovada",
      description: "A avaliação foi aprovada e agora está visível para os clientes.",
    })
  }

  const rejeitarAvaliacao = (id) => {
    setAvaliacoes(
      avaliacoes.map((avaliacao) => (avaliacao.id === id ? { ...avaliacao, status: "rejeitado" } : avaliacao)),
    )

    toast({
      title: "Avaliação rejeitada",
      description: "A avaliação foi rejeitada e não será exibida para os clientes.",
    })
  }

  const excluirAvaliacao = (id) => {
    setAvaliacoes(avaliacoes.filter((avaliacao) => avaliacao.id !== id))

    toast({
      title: "Avaliação excluída",
      description: "A avaliação foi excluída permanentemente.",
    })
  }

  const responderAvaliacao = (id) => {
    // Lógica para abrir modal de resposta
    toast({
      title: "Responder avaliação",
      description: "Funcionalidade de resposta será implementada em breve.",
    })
  }

  if (!produtoId) {
    return <div className="p-4">Nenhum produto selecionado</div>
  }

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-4rem)]">
        <VitrineSidebar />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Avaliações do Produto</h1>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configurações de Avaliações</CardTitle>
                  <CardDescription>
                    Configure como as avaliações serão exibidas e gerenciadas na sua loja.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="permitirAvaliacoes">Permitir avaliações</Label>
                      <p className="text-xs text-gray-500">Habilita a seção de avaliações no produto</p>
                    </div>
                    <Switch
                      id="permitirAvaliacoes"
                      checked={configuracoes.permitirAvaliacoes}
                      onCheckedChange={(checked) => handleSwitchChange("permitirAvaliacoes", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="moderacaoAtiva">Moderação ativa</Label>
                      <p className="text-xs text-gray-500">Avaliações precisam ser aprovadas antes de serem exibidas</p>
                    </div>
                    <Switch
                      id="moderacaoAtiva"
                      checked={configuracoes.moderacaoAtiva}
                      onCheckedChange={(checked) => handleSwitchChange("moderacaoAtiva", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="notificarNovasAvaliacoes">Notificar novas avaliações</Label>
                      <p className="text-xs text-gray-500">
                        Receba notificações quando novas avaliações forem enviadas
                      </p>
                    </div>
                    <Switch
                      id="notificarNovasAvaliacoes"
                      checked={configuracoes.notificarNovasAvaliacoes}
                      onCheckedChange={(checked) => handleSwitchChange("notificarNovasAvaliacoes", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="exibirEstrelas">Exibir estrelas</Label>
                      <p className="text-xs text-gray-500">Mostra a classificação por estrelas no produto</p>
                    </div>
                    <Switch
                      id="exibirEstrelas"
                      checked={configuracoes.exibirEstrelas}
                      onCheckedChange={(checked) => handleSwitchChange("exibirEstrelas", checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="permitirFotos">Permitir fotos nas avaliações</Label>
                      <p className="text-xs text-gray-500">Clientes podem enviar fotos junto com as avaliações</p>
                    </div>
                    <Switch
                      id="permitirFotos"
                      checked={configuracoes.permitirFotos}
                      onCheckedChange={(checked) => handleSwitchChange("permitirFotos", checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Avaliações</CardTitle>
                  <CardDescription>Visualize, modere e responda às avaliações dos clientes.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {avaliacoes.map((avaliacao) => (
                      <Card key={avaliacao.id} className="border-gray-200">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div className="flex items-start gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={avaliacao.avatar} alt={avaliacao.cliente} />
                                <AvatarFallback>{avaliacao.cliente.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{avaliacao.cliente}</span>
                                  <Badge
                                    variant={
                                      avaliacao.status === "aprovado"
                                        ? "success"
                                        : avaliacao.status === "rejeitado"
                                          ? "destructive"
                                          : "outline"
                                    }
                                  >
                                    {avaliacao.status === "aprovado"
                                      ? "Aprovado"
                                      : avaliacao.status === "rejeitado"
                                        ? "Rejeitado"
                                        : "Pendente"}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-500">{avaliacao.data}</div>
                                <div className="flex items-center mt-1">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${i < avaliacao.estrelas ? "text-yellow-400 fill-yellow-400" : "text-gray-300"}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1">
                              {avaliacao.status === "pendente" && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => aprovarAvaliacao(avaliacao.id)}
                                  >
                                    <Check className="h-4 w-4 text-green-500" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => rejeitarAvaliacao(avaliacao.id)}
                                  >
                                    <X className="h-4 w-4 text-red-500" />
                                  </Button>
                                </>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => responderAvaliacao(avaliacao.id)}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                                onClick={() => excluirAvaliacao(avaliacao.id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>

                          <div className="mt-3">
                            <h4 className="font-medium">{avaliacao.titulo}</h4>
                            <p className="text-sm text-gray-700 mt-1">{avaliacao.comentario}</p>
                          </div>

                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-3 w-3" />
                              <span>{avaliacao.likes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="h-3 w-3" />
                              <span>{avaliacao.dislikes}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3" />
                              <span>
                                {avaliacao.respostas} {avaliacao.respostas === 1 ? "resposta" : "respostas"}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Configurações</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

