"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  Eye,
  Calendar,
  Tag,
  Edit,
  Trash2,
  Share2,
  ArrowLeft,
  Clock,
  DollarSign,
  BarChart3,
  Settings,
  History,
  Info,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { PanfletoForm } from "./panfleto-form"

interface PanfletoDetailsProps {
  panfleto: any
}

export function PanfletoDetails({ panfleto }: PanfletoDetailsProps) {
  const router = useRouter()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showEditForm, setShowEditForm] = useState(false)

  // Função para determinar a cor do status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300"
      case "draft":
        return "bg-amber-100 text-amber-800 border-amber-300"
      case "inactive":
        return "bg-red-100 text-red-800 border-red-300"
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Tradução do status
  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo"
      case "draft":
        return "Rascunho"
      case "inactive":
        return "Inativo"
      case "scheduled":
        return "Agendado"
      default:
        return status
    }
  }

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return "Data não disponível"
    return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
  }

  // Função para excluir o panfleto
  const handleDelete = async () => {
    try {
      setIsDeleting(true)

      const response = await fetch(`/api/panfletos/${panfleto._id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao excluir o panfleto")
      }

      toast({
        title: "Panfleto excluído",
        description: "O panfleto foi excluído com sucesso.",
      })

      router.push("/dashboard/panfletos")
      router.refresh()
    } catch (error) {
      console.error("Erro ao excluir panfleto:", error)
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir o panfleto",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  // Função para compartilhar o panfleto
  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: panfleto.titulo,
          text: panfleto.descricao,
          url: window.location.href,
        })
        .then(() => console.log("Compartilhado com sucesso"))
        .catch((error) => console.error("Erro ao compartilhar:", error))
    } else {
      // Fallback para navegadores que não suportam a API Web Share
      navigator.clipboard.writeText(window.location.href)
      toast({
        title: "Link copiado",
        description: "O link do panfleto foi copiado para a área de transferência.",
      })
    }
  }

  if (showEditForm) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <Button variant="ghost" onClick={() => setShowEditForm(false)} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">Editar Panfleto</h1>
        </div>
        <PanfletoForm panfleto={panfleto} lojaId={panfleto.lojaId} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.push("/dashboard/panfletos")} className="mr-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold">{panfleto.titulo}</h1>
          <Badge className={`${getStatusColor(panfleto.status)} px-2 py-0.5`}>{getStatusText(panfleto.status)}</Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleShare}>
            <Share2 className="mr-2 h-4 w-4" />
            Compartilhar
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowEditForm(true)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="destructive" size="sm">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Excluir Panfleto</DialogTitle>
                <DialogDescription>
                  Tem certeza que deseja excluir este panfleto? Esta ação não pode ser desfeita.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
                  {isDeleting ? "Excluindo..." : "Excluir"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="detalhes">
        <TabsList className="mb-4">
          <TabsTrigger value="detalhes">
            <Info className="mr-2 h-4 w-4" />
            Detalhes
          </TabsTrigger>
          <TabsTrigger value="estatisticas">
            <BarChart3 className="mr-2 h-4 w-4" />
            Estatísticas
          </TabsTrigger>
          <TabsTrigger value="configuracoes">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </TabsTrigger>
          <TabsTrigger value="historico">
            <History className="mr-2 h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        <TabsContent value="detalhes" className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Informações do Panfleto</CardTitle>
                <CardDescription>Detalhes completos do panfleto</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="relative aspect-video w-full overflow-hidden rounded-lg">
                  <Image
                    src={panfleto.imagem || "/placeholder.svg?height=400&width=800&query=panfleto"}
                    alt={panfleto.titulo}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium">Descrição</h3>
                    <p className="text-muted-foreground">{panfleto.descricao}</p>
                  </div>

                  <div>
                    <h3 className="text-lg font-medium">Conteúdo</h3>
                    <div className="rounded-lg border p-4">
                      <p className="whitespace-pre-line">{panfleto.conteudo}</p>
                    </div>
                  </div>

                  {panfleto.botaoAcao && (
                    <div className="flex justify-center">
                      <Button size="lg" className="mt-2" onClick={() => window.open(panfleto.botaoLink, "_blank")}>
                        {panfleto.botaoAcao}
                      </Button>
                    </div>
                  )}

                  {panfleto.codigo && (
                    <div className="mt-4 rounded-lg border bg-muted p-4 text-center">
                      <p className="text-sm text-muted-foreground">Código Promocional</p>
                      <p className="text-xl font-bold tracking-wider">{panfleto.codigo}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Métricas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Visualizações</span>
                      </div>
                      <span className="font-medium">{panfleto.visualizacoes || 0}</span>
                    </div>

                    {panfleto.curtidas !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-4 w-4 text-muted-foreground"
                          >
                            <path d="M7 10v12" />
                            <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2h0a3.13 3.13 0 0 1 3 3.88Z" />
                          </svg>
                          <span>Curtidas</span>
                        </div>
                        <span className="font-medium">{panfleto.curtidas || 0}</span>
                      </div>
                    )}

                    {panfleto.compartilhamentos !== undefined && (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Share2 className="mr-2 h-4 w-4 text-muted-foreground" />
                          <span>Compartilhamentos</span>
                        </div>
                        <span className="font-medium">{panfleto.compartilhamentos || 0}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Categoria</span>
                      </div>
                      <Badge variant="secondary">{panfleto.categoria}</Badge>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Criado em</span>
                      </div>
                      <span className="text-sm">{formatDate(panfleto.dataCriacao)}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                        <span>Atualizado em</span>
                      </div>
                      <span className="text-sm">{formatDate(panfleto.dataAtualizacao)}</span>
                    </div>

                    {(panfleto.dataInicio || panfleto.dataFim) && (
                      <div className="mt-2 rounded-md bg-muted p-2">
                        {panfleto.dataInicio && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Início</span>
                            <span className="text-xs font-medium">{formatDate(panfleto.dataInicio)}</span>
                          </div>
                        )}

                        {panfleto.dataFim && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs">Término</span>
                            <span className="text-xs font-medium">{formatDate(panfleto.dataFim)}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {(panfleto.preco || panfleto.precoPromocional) && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preços</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {panfleto.preco && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Preço Regular</span>
                          </div>
                          <span className="font-medium">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(panfleto.preco)}
                          </span>
                        </div>
                      )}

                      {panfleto.precoPromocional && (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <DollarSign className="mr-2 h-4 w-4 text-green-500" />
                            <span>Preço Promocional</span>
                          </div>
                          <span className="font-medium text-green-600">
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(panfleto.precoPromocional)}
                          </span>
                        </div>
                      )}

                      {panfleto.preco && panfleto.precoPromocional && (
                        <div className="mt-2 rounded-md bg-green-50 p-2 text-center">
                          <span className="text-xs text-green-700">
                            Economia de{" "}
                            {new Intl.NumberFormat("pt-BR", {
                              style: "currency",
                              currency: "BRL",
                            }).format(panfleto.preco - panfleto.precoPromocional)}{" "}
                            ({Math.round(((panfleto.preco - panfleto.precoPromocional) / panfleto.preco) * 100)}% OFF)
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="estatisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas</CardTitle>
              <CardDescription>Análise de desempenho do panfleto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">Estatísticas detalhadas em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="configuracoes">
          <Card>
            <CardHeader>
              <CardTitle>Configurações</CardTitle>
              <CardDescription>Gerenciar configurações do panfleto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">Configurações avançadas em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="historico">
          <Card>
            <CardHeader>
              <CardTitle>Histórico</CardTitle>
              <CardDescription>Histórico de alterações do panfleto</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex h-40 items-center justify-center">
                <p className="text-muted-foreground">Histórico de alterações em breve</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
