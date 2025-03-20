"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Search, UserPlus, Trash2, CreditCard, Eye } from "lucide-react"
import { DataTable } from "@/components/admin/data-table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "sonner"
import { format } from "date-fns"

export default function AdminUsuariosPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<any[]>([])
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  })
  const [search, setSearch] = useState("")
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  // Add state for plans and loading plans
  const [plans, setPlans] = useState<any[]>([])
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [updatingPlanUserId, setUpdatingPlanUserId] = useState<string | null>(null)
  const [selectedPlan, setSelectedPlan] = useState<string>("")

  useEffect(() => {
    fetchUsers()
    fetchPlans()
  }, [pagination.page, pagination.limit, search])

  async function fetchUsers() {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/admin/usuarios?page=${pagination.page}&limit=${pagination.limit}${search ? `&search=${search}` : ""}`,
      )

      const data = await response.json()

      if (data.users) {
        setUsers(data.users)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  // Add function to fetch plans
  async function fetchPlans() {
    try {
      setLoadingPlans(true)
      const response = await fetch("/api/admin/planos")
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans || [])
      }
    } catch (error) {
      console.error("Error fetching plans:", error)
    } finally {
      setLoadingPlans(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPagination((prev) => ({ ...prev, page: 1 }))
    fetchUsers()
  }

  function handlePageChange(newPage: number) {
    setPagination((prev) => ({ ...prev, page: newPage }))
  }

  function handleLimitChange(newLimit: string) {
    setPagination((prev) => ({ ...prev, limit: Number.parseInt(newLimit), page: 1 }))
  }

  async function handleDeleteUser(userId: string) {
    try {
      setDeletingUserId(userId)

      const response = await fetch(`/api/admin/usuarios/${userId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Falha ao excluir usuário")
      }

      toast.success("Usuário excluído com sucesso")
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error("Error deleting user:", error)
      toast.error("Erro ao excluir usuário")
    } finally {
      setDeletingUserId(null)
    }
  }

  // Add function to update user plan
  async function handleUpdatePlan(userId: string, planId: string) {
    try {
      setUpdatingPlanUserId(userId)

      const response = await fetch(`/api/admin/usuarios/${userId}/update-plan`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ planoId: planId }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar plano")
      }

      toast.success("Plano atualizado com sucesso")
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error("Error updating plan:", error)
      toast.error("Erro ao atualizar plano")
    } finally {
      setUpdatingPlanUserId(null)
      setSelectedPlan("")
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Gerenciamento de Usuários</h1>
        <Button>
          <UserPlus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="rounded-lg border bg-white p-6 dark:bg-gray-800">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center gap-2">
            <Input
              placeholder="Buscar por nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button type="submit" size="icon">
              <Search className="h-4 w-4" />
            </Button>
          </form>

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mostrar:</span>
            <Select value={pagination.limit.toString()} onValueChange={handleLimitChange}>
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder="10" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5</SelectItem>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="20">20</SelectItem>
                <SelectItem value="50">50</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <DataTable
              data={users}
              columns={[
                {
                  key: "nome",
                  title: "Nome",
                  render: (user) => <div className="font-medium">{user.nome}</div>,
                },
                {
                  key: "email",
                  title: "Email",
                },
                {
                  key: "role",
                  title: "Função",
                  render: (user) => (
                    <Badge variant={user.role === "admin" ? "default" : "outline"}>
                      {user.role === "admin" ? "Admin" : "Usuário"}
                    </Badge>
                  ),
                },
                {
                  key: "plano",
                  title: "Plano",
                  render: (user) =>
                    user.plano ? (
                      <span>{user.plano.nome}</span>
                    ) : (
                      <span className="text-muted-foreground">Sem plano</span>
                    ),
                },
                {
                  key: "createdAt",
                  title: "Criado em",
                  render: (user) => <span>{format(new Date(user.createdAt), "dd/MM/yyyy")}</span>,
                },
                {
                  key: "actions",
                  title: "Ações",
                  render: (user) => (
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" onClick={() => router.push(`/admin/usuarios/${user._id}`)}>
                        <Eye className="h-4 w-4" />
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <CreditCard className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Atribuir Plano</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          {loadingPlans ? (
                            <DropdownMenuItem disabled>Carregando planos...</DropdownMenuItem>
                          ) : plans.length > 0 ? (
                            <>
                              <DropdownMenuItem
                                onClick={() => handleUpdatePlan(user._id, "none")}
                                disabled={updatingPlanUserId === user._id}
                              >
                                Remover plano
                              </DropdownMenuItem>
                              {plans.map((plan) => (
                                <DropdownMenuItem
                                  key={plan._id}
                                  onClick={() => handleUpdatePlan(user._id, plan._id)}
                                  disabled={updatingPlanUserId === user._id}
                                >
                                  {plan.nome} - R$ {plan.preco.toFixed(2)}
                                </DropdownMenuItem>
                              ))}
                            </>
                          ) : (
                            <DropdownMenuItem disabled>Nenhum plano disponível</DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => router.push(`/admin/usuarios/${user._id}`)}>
                            Gerenciar Usuário
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4" />
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
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={deletingUserId === user._id}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              {deletingUserId === user._id ? "Excluindo..." : "Sim, excluir usuário"}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  ),
                },
              ]}
              onRowClick={(user) => router.push(`/admin/usuarios/${user._id}`)}
            />

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {Math.min((pagination.page - 1) * pagination.limit + 1, pagination.total)} a{" "}
                {Math.min(pagination.page * pagination.limit, pagination.total)} de {pagination.total} usuários
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {Array.from({ length: Math.min(5, pagination.pages) }).map((_, i) => {
                  const pageNumber = pagination.page <= 3 ? i + 1 : pagination.page + i - 2

                  if (pageNumber > pagination.pages) return null

                  return (
                    <Button
                      key={i}
                      variant={pageNumber === pagination.page ? "default" : "outline"}
                      size="icon"
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </Button>
                  )
                })}

                <Button
                  variant="outline"
                  size="icon"
                  disabled={pagination.page === pagination.pages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

