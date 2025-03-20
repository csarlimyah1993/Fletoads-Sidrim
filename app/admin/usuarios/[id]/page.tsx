"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { Loader2, FileText, Zap, Trash2, CreditCard } from "lucide-react"
import { format } from "date-fns"

interface UserData {
  _id: string
  nome: string
  email: string
  role: string
  plano?: {
    _id: string
    nome: string
    slug: string
  }
  createdAt: string
  updatedAt: string
}

interface PlanData {
  _id: string
  nome: string
  slug: string
  preco: number
  ativo: boolean
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.id as string

  const [user, setUser] = useState<UserData | null>(null)
  const [plans, setPlans] = useState<PlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [updatingPlan, setUpdatingPlan] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string>("")
  const [stats, setStats] = useState({
    panfletos: 0,
    produtos: 0,
    promocoes: 0,
    visualizacoes: 0,
    cliques: 0,
  })

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch user data
        const userResponse = await fetch(`/api/admin/usuarios/${userId}`)
        if (!userResponse.ok) {
          throw new Error("Falha ao carregar dados do usuário")
        }
        const userData = await userResponse.json()
        setUser(userData)

        if (userData.plano?._id) {
          setSelectedPlan(userData.plano._id)
        }

        // Fetch available plans
        const plansResponse = await fetch("/api/admin/planos")
        if (plansResponse.ok) {
          const plansData = await plansResponse.json()
          if (plansData.plans && Array.isArray(plansData.plans) && plansData.plans.length > 0) {
            setPlans(plansData.plans)
            console.log("Plans loaded:", plansData.plans)
          } else {
            console.log("No plans returned from API")
            toast.error("Nenhum plano disponível")
          }
        } else {
          console.error("Error fetching plans:", plansResponse.statusText)
          toast.error("Erro ao carregar planos")
        }

        // Fetch user stats
        const statsResponse = await fetch(`/api/admin/usuarios/${userId}/stats`)
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }
      } catch (error) {
        console.error("Error fetching user data:", error)
        toast.error("Erro ao carregar dados do usuário")
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [userId])

  const handleDeleteUser = async () => {
    try {
      setDeleting(true)

      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir usuário")
      }

      toast.success("Usuário excluído com sucesso")
      router.push("/admin/usuarios")
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Erro ao excluir usuário")
    } finally {
      setDeleting(false)
    }
  }

  const handleUpdatePlan = async () => {
    try {
      setUpdatingPlan(true)

      const response = await fetch(`/api/admin/usuarios/${userId}/update-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planoId: selectedPlan }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar plano")
      }

      // Update local user data
      const updatedUser = await response.json()
      setUser(updatedUser)

      toast.success("Plano atualizado com sucesso")
    } catch (error) {
      console.error("Error updating plan:", error)
      toast.error("Erro ao atualizar plano")
    } finally {
      setUpdatingPlan(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex h-full flex-col items-center justify-center">
        <h2 className="text-2xl font-bold">Usuário não encontrado</h2>
        <p className="text-muted-foreground">O usuário solicitado não existe ou foi removido.</p>
        <Button className="mt-4" onClick={() => router.push("/admin/usuarios")}>
          Voltar para lista de usuários
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Detalhes do Usuário</h1>
        <div className="flex gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Excluir Usuário
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Isso excluirá permanentemente o usuário
                  <span className="font-semibold"> {user.nome}</span> e todos os seus dados.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteUser}
                  disabled={deleting}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  {deleting ? "Excluindo..." : "Sim, excluir usuário"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <Button variant="outline" onClick={() => router.push("/admin/usuarios")}>
            Voltar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Informações do Usuário</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.nome}`} alt={user.nome} />
                <AvatarFallback>{user.nome.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="text-center">
                <h2 className="text-xl font-bold">{user.nome}</h2>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <Badge variant={user.role === "admin" ? "default" : "outline"}>
                {user.role === "admin" ? "Administrador" : "Usuário"}
              </Badge>
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">ID:</span>
                <span className="text-sm text-muted-foreground">{user._id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Criado em:</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm font-medium">Última atualização:</span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(user.updatedAt), "dd/MM/yyyy HH:mm")}
                </span>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Plano atual:</h3>
              <div className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <p className="font-medium">{user.plano?.nome || "Sem plano"}</p>
                  <p className="text-sm text-muted-foreground">{user.plano?.slug || "N/A"}</p>
                </div>
                <CreditCard className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium">Alterar plano:</h3>
                <div className="flex gap-2">
                  <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecionar plano" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sem plano</SelectItem>
                      {plans.length > 0 ? (
                        plans.map((plan) => (
                          <SelectItem key={plan._id} value={plan._id}>
                            {plan.nome} - R$ {plan.preco.toFixed(2)}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="no-plans" disabled>
                          Nenhum plano disponível
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleUpdatePlan}
                    disabled={updatingPlan || selectedPlan === (user.plano?._id || "")}
                  >
                    {updatingPlan ? "Salvando..." : "Salvar"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Panfletos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.panfletos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.produtos}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Promoções</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.promocoes}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.visualizacoes}</div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Visão Geral</TabsTrigger>
              <TabsTrigger value="panfletos">Panfletos</TabsTrigger>
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="promocoes">Promoções</TabsTrigger>
              <TabsTrigger value="vitrine">Vitrine</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Atividade Recente</CardTitle>
                  <CardDescription>Últimas ações do usuário na plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats.panfletos > 0 ? (
                      [1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4">
                          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-medium">Criou um novo panfleto</div>
                            <div className="text-sm text-muted-foreground">Panfleto de ofertas da semana</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {format(new Date(Date.now() - i * 86400000), "dd/MM/yyyy HH:mm")}
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-muted-foreground">Nenhuma atividade recente encontrada</div>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estatísticas de Uso</CardTitle>
                  <CardDescription>Métricas de uso da plataforma</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Uso de Armazenamento</div>
                        <div className="text-sm font-medium">45%</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: "45%" }}></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Limite de Panfletos</div>
                        <div className="text-sm font-medium">{stats.panfletos}/10</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(stats.panfletos / 10) * 100}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">Limite de Produtos</div>
                        <div className="text-sm font-medium">{stats.produtos}/50</div>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${(stats.produtos / 50) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="panfletos" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Panfletos</CardTitle>
                  <CardDescription>Todos os panfletos criados pelo usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.panfletos > 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-800"></div>
                          <div className="flex-1">
                            <div className="font-medium">Panfleto de Ofertas #{i}</div>
                            <div className="text-sm text-muted-foreground">
                              Criado em {format(new Date(Date.now() - i * 86400000), "dd/MM/yyyy")}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Badge variant="outline">10 produtos</Badge>
                              <Badge variant="outline">{100 + i * 20} visualizações</Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">Nenhum panfleto encontrado</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="produtos" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Produtos</CardTitle>
                  <CardDescription>Todos os produtos cadastrados pelo usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.produtos > 0 ? (
                    <div className="space-y-4">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-800"></div>
                          <div className="flex-1">
                            <div className="font-medium">Produto #{i}</div>
                            <div className="text-sm text-muted-foreground">Categoria: Eletrônicos</div>
                            <div className="mt-1 font-medium text-green-600">R$ {(99.99 * i).toFixed(2)}</div>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">Nenhum produto encontrado</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="promocoes" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Promoções</CardTitle>
                  <CardDescription>Todas as promoções criadas pelo usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.promocoes > 0 ? (
                    <div className="space-y-4">
                      {[1, 2].map((i) => (
                        <div key={i} className="flex items-start gap-4 border-b pb-4 last:border-0">
                          <div className="h-16 w-16 flex-shrink-0 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                            <Zap className="h-8 w-8 text-yellow-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Promoção Relâmpago #{i}</div>
                            <div className="text-sm text-muted-foreground">
                              Válida até {format(new Date(Date.now() + i * 86400000), "dd/MM/yyyy")}
                            </div>
                            <div className="mt-2 flex gap-2">
                              <Badge variant="outline">{5 * i} produtos</Badge>
                              <Badge variant="secondary">Desconto de {10 * i}%</Badge>
                            </div>
                          </div>
                          <Button variant="outline" size="sm">
                            Ver Detalhes
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-muted-foreground">Nenhuma promoção encontrada</div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vitrine" className="space-y-4 mt-4">
              <Card>
                <CardHeader>
                  <CardTitle>Vitrine</CardTitle>
                  <CardDescription>Informações da vitrine do usuário</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Informações da Loja</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Nome da Loja:</span>
                          <span className="text-sm text-muted-foreground">Loja do {user.nome}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">URL da Vitrine:</span>
                          <span className="text-sm text-blue-600 dark:text-blue-400">
                            fletoads.com/loja/{user._id.substring(0, 8)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Status:</span>
                          <Badge variant="outline" className="text-green-600 bg-green-50 dark:bg-green-900/20">
                            Ativa
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg border p-4">
                      <h3 className="font-medium mb-2">Estatísticas da Vitrine</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Visualizações</div>
                          <div className="text-2xl font-bold">{stats.visualizacoes}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Cliques</div>
                          <div className="text-2xl font-bold">{stats.cliques}</div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Taxa de Conversão</div>
                          <div className="text-2xl font-bold">
                            {stats.visualizacoes > 0 ? ((stats.cliques / stats.visualizacoes) * 100).toFixed(1) : "0"}%
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-sm text-muted-foreground">Tempo Médio</div>
                          <div className="text-2xl font-bold">2:45</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-center">
                      <Button>Visitar Vitrine</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

