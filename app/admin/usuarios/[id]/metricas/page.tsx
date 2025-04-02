"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Loader2, RefreshCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface UserPlanMetrics {
  usuario: {
    _id: string
    nome: string
    email: string
    plano: string
  }
  uso: {
    produtos: {
      usado: number
      total: number | "Ilimitado"
    }
    panfletos: {
      usado: number
      total: number | "Ilimitado"
    }
    clientes: {
      usado: number
      total: number | "Ilimitado"
    }
    campanhas: {
      usado: number
      total: number | "Ilimitado"
    }
    imagensPorProduto: number
  }
  limitReached: {
    produtos: boolean
    panfletos: boolean
    clientes: boolean
    campanhas: boolean
  }
  planoDetalhes: {
    preco: number
    popular: boolean
    whatsapp: number
  }
}

export default function UserMetricsPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<UserPlanMetrics | null>(null)

  const fetchMetrics = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/usuarios/${userId}/metricas`)

      if (!response.ok) {
        throw new Error(`Erro ao buscar métricas: ${response.status}`)
      }

      const data = await response.json()
      setMetrics(data)
    } catch (error) {
      console.error("Erro ao buscar métricas:", error)
      setError((error as Error).message || "Não foi possível carregar as métricas do usuário")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (userId) {
      fetchMetrics()
    }
  }, [userId])

  const handleBack = () => {
    router.back()
  }

  const handleRefresh = () => {
    fetchMetrics()
  }

  const getPlanoBadgeVariant = (plano: string) => {
    switch (plano?.toLowerCase()) {
      case "premium":
      case "empresarial":
        return "success"
      case "profissional":
        return "default"
      case "basico":
        return "secondary"
      default:
        return "outline"
    }
  }

  const calculatePercentage = (used: number, total: number | "Ilimitado") => {
    if (total === "Ilimitado") return 0
    return Math.min(Math.round((used / total) * 100), 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500"
    if (percentage >= 70) return "bg-amber-500"
    return ""
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="bg-red-50 text-red-500 p-4 rounded-md">{error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <Button variant="outline" size="sm" onClick={handleBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <Card className="mt-4">
          <CardContent className="pt-6">
            <div className="text-center p-4">Nenhuma métrica encontrada para este usuário.</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <h2 className="text-2xl font-bold">Métricas de Uso</h2>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>{metrics.usuario.nome}</CardTitle>
              <CardDescription>{metrics.usuario.email}</CardDescription>
            </div>
            <Badge variant={getPlanoBadgeVariant(metrics.usuario.plano)}>
              Plano: {metrics.usuario.plano.charAt(0).toUpperCase() + metrics.usuario.plano.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="resources">
            <TabsList className="mb-4">
              <TabsTrigger value="resources">Recursos</TabsTrigger>
              <TabsTrigger value="details">Detalhes do Plano</TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="space-y-4">
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Produtos</span>
                    <span className="text-sm font-medium">
                      {metrics.uso.produtos.usado} /{" "}
                      {metrics.uso.produtos.total === "Ilimitado" ? "∞" : metrics.uso.produtos.total}
                    </span>
                  </div>
                  {metrics.uso.produtos.total !== "Ilimitado" && (
                    <Progress
                      value={calculatePercentage(metrics.uso.produtos.usado, metrics.uso.produtos.total)}
                      className={`h-2 ${getProgressColor(calculatePercentage(metrics.uso.produtos.usado, metrics.uso.produtos.total as number))}`}
                    />
                  )}
                  {metrics.limitReached.produtos && <p className="text-xs text-red-500 mt-1">Limite atingido</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Panfletos</span>
                    <span className="text-sm font-medium">
                      {metrics.uso.panfletos.usado} /{" "}
                      {metrics.uso.panfletos.total === "Ilimitado" ? "∞" : metrics.uso.panfletos.total}
                    </span>
                  </div>
                  {metrics.uso.panfletos.total !== "Ilimitado" && (
                    <Progress
                      value={calculatePercentage(metrics.uso.panfletos.usado, metrics.uso.panfletos.total)}
                      className={`h-2 ${getProgressColor(calculatePercentage(metrics.uso.panfletos.usado, metrics.uso.panfletos.total as number))}`}
                    />
                  )}
                  {metrics.limitReached.panfletos && <p className="text-xs text-red-500 mt-1">Limite atingido</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Clientes</span>
                    <span className="text-sm font-medium">
                      {metrics.uso.clientes.usado} /{" "}
                      {metrics.uso.clientes.total === "Ilimitado" ? "∞" : metrics.uso.clientes.total}
                    </span>
                  </div>
                  {metrics.uso.clientes.total !== "Ilimitado" && (
                    <Progress
                      value={calculatePercentage(metrics.uso.clientes.usado, metrics.uso.clientes.total)}
                      className={`h-2 ${getProgressColor(calculatePercentage(metrics.uso.clientes.usado, metrics.uso.clientes.total as number))}`}
                    />
                  )}
                  {metrics.limitReached.clientes && <p className="text-xs text-red-500 mt-1">Limite atingido</p>}
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">Campanhas</span>
                    <span className="text-sm font-medium">
                      {metrics.uso.campanhas.usado} /{" "}
                      {metrics.uso.campanhas.total === "Ilimitado" ? "∞" : metrics.uso.campanhas.total}
                    </span>
                  </div>
                  {metrics.uso.campanhas.total !== "Ilimitado" && (
                    <Progress
                      value={calculatePercentage(metrics.uso.campanhas.usado, metrics.uso.campanhas.total)}
                      className={`h-2 ${getProgressColor(calculatePercentage(metrics.uso.campanhas.usado, metrics.uso.campanhas.total as number))}`}
                    />
                  )}
                  {metrics.limitReached.campanhas && <p className="text-xs text-red-500 mt-1">Limite atingido</p>}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="details">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Detalhes do Plano</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Preço</span>
                        <span className="text-sm font-medium">
                          {metrics.planoDetalhes.preco === 0
                            ? "Gratuito"
                            : `R$ ${metrics.planoDetalhes.preco.toFixed(2)}/mês`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Imagens por Produto</span>
                        <span className="text-sm font-medium">{metrics.uso.imagensPorProduto}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Botões WhatsApp</span>
                        <span className="text-sm font-medium">{metrics.planoDetalhes.whatsapp}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Plano Popular</span>
                        <span className="text-sm font-medium">{metrics.planoDetalhes.popular ? "Sim" : "Não"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-md p-4">
                    <h3 className="font-medium mb-2">Ações</h3>
                    <div className="space-y-3">
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/admin/usuarios/${userId}/editar`)}
                      >
                        Editar Usuário
                      </Button>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => router.push(`/admin/usuarios/${userId}/historico`)}
                      >
                        Ver Histórico de Atividades
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

