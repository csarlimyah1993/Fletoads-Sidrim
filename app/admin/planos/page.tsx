"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Plus, Search, Filter, RefreshCw, Loader2, Edit, Trash, Check } from "lucide-react"
import { toast } from "sonner"

// Tipo para plano
interface Plano {
  _id: string
  nome: string
  slug: string
  preco: number
  descricao: string
  recursos: string[]
  popular?: boolean
  ativo: boolean
  limitacoes: {
    produtos: number
    lojas: number
    panfletos: number
    promocoes: number
    whatsapp: number
  }
}

// Componente para adicionar/editar plano
function PlanFormDialog({
  plano,
  onSave,
  isOpen,
  onOpenChange,
}: {
  plano?: Plano
  onSave: (plano: Partial<Plano>) => Promise<void>
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}) {
  const defaultLimitacoes = {
    produtos: 0,
    lojas: 1,
    panfletos: 0,
    promocoes: 0,
    whatsapp: 0,
  }

  const [formData, setFormData] = useState<Partial<Plano>>({
    nome: "",
    slug: "",
    preco: 0,
    descricao: "",
    recursos: [],
    popular: false,
    ativo: true,
    limitacoes: defaultLimitacoes,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [recurso, setRecurso] = useState("")

  // Update form data when plano changes or dialog opens
  useEffect(() => {
    if (isOpen) {
      if (plano) {
        // If editing an existing plan, use its data
        setFormData({
          ...plano,
          recursos: Array.isArray(plano.recursos) ? plano.recursos : [],
          limitacoes: {
            ...defaultLimitacoes,
            ...plano.limitacoes,
          },
        })
      } else {
        // If creating a new plan, reset to defaults
        setFormData({
          nome: "",
          slug: "",
          preco: 0,
          descricao: "",
          recursos: [],
          popular: false,
          ativo: true,
          limitacoes: defaultLimitacoes,
        })
      }
    }
  }, [plano, isOpen])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "preco" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleLimitChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      limitacoes: {
        ...(prev.limitacoes || defaultLimitacoes),
        [name]: Number.parseInt(value) || 0,
      },
    }))
  }

  const handleAddRecurso = () => {
    if (!recurso.trim()) return
    setFormData((prev) => ({
      ...prev,
      recursos: [...(prev.recursos || []), recurso.trim()],
    }))
    setRecurso("")
  }

  const handleRemoveRecurso = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      recursos: prev.recursos?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSubmit = async () => {
    if (!formData.nome || !formData.slug) {
      toast.error("Nome e slug são obrigatórios")
      return
    }

    // Ensure limitacoes is defined before submitting
    const dataToSubmit = {
      ...formData,
      limitacoes: formData.limitacoes || defaultLimitacoes,
    }

    setIsLoading(true)
    try {
      await onSave(dataToSubmit)
      onOpenChange(false)
    } catch (error) {
      console.error("Erro ao salvar plano:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{plano ? "Editar Plano" : "Adicionar Plano"}</DialogTitle>
          <DialogDescription>
            {plano ? "Edite os detalhes do plano existente" : "Adicione um novo plano à plataforma"}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nome">Nome</Label>
              <Input id="nome" name="nome" value={formData.nome || ""} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug</Label>
              <Input id="slug" name="slug" value={formData.slug || ""} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input id="preco" name="preco" type="number" value={formData.preco || 0} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="popular">Popular</Label>
                <Switch
                  id="popular"
                  checked={formData.popular || false}
                  onCheckedChange={(checked) => handleSwitchChange("popular", checked)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="ativo">Ativo</Label>
                <Switch
                  id="ativo"
                  checked={formData.ativo !== false}
                  onCheckedChange={(checked) => handleSwitchChange("ativo", checked)}
                />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={formData.descricao || ""}
              onChange={handleChange}
              rows={3}
            />
          </div>
          <div className="grid gap-2">
            <Label>Limitações</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="produtos">Produtos</Label>
                <Input
                  id="produtos"
                  name="produtos"
                  type="number"
                  value={formData.limitacoes?.produtos || 0}
                  onChange={handleLimitChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lojas">Lojas</Label>
                <Input
                  id="lojas"
                  name="lojas"
                  type="number"
                  value={formData.limitacoes?.lojas || 1}
                  onChange={handleLimitChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="panfletos">Panfletos</Label>
                <Input
                  id="panfletos"
                  name="panfletos"
                  type="number"
                  value={formData.limitacoes?.panfletos || 0}
                  onChange={handleLimitChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="promocoes">Promoções</Label>
                <Input
                  id="promocoes"
                  name="promocoes"
                  type="number"
                  value={formData.limitacoes?.promocoes || 0}
                  onChange={handleLimitChange}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="whatsapp">WhatsApp</Label>
                <Input
                  id="whatsapp"
                  name="whatsapp"
                  type="number"
                  value={formData.limitacoes?.whatsapp || 0}
                  onChange={handleLimitChange}
                />
              </div>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Recursos</Label>
            <div className="flex gap-2">
              <Input value={recurso} onChange={(e) => setRecurso(e.target.value)} placeholder="Adicionar recurso" />
              <Button type="button" onClick={handleAddRecurso}>
                Adicionar
              </Button>
            </div>
            <div className="mt-2">
              {Array.isArray(formData.recursos)
                ? formData.recursos.map((item, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {item}
                      <button
                        type="button"
                        className="ml-1 text-gray-500 hover:text-gray-700"
                        onClick={() => handleRemoveRecurso(index)}
                      >
                        ×
                      </button>
                    </Badge>
                  ))
                : null}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function PlanosPage() {
  const [planos, setPlanos] = useState<Plano[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filtroAtivo, setFiltroAtivo] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [currentPlano, setCurrentPlano] = useState<Plano | undefined>(undefined)

  // Buscar planos
  const fetchPlanos = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/planos")

      if (!response.ok) {
        throw new Error("Erro ao buscar planos")
      }

      const data = await response.json()

      // Ensure each plan has limitacoes and recursos as arrays
      const processedData = Array.isArray(data)
        ? data.map((plano) => ({
            ...plano,
            recursos: Array.isArray(plano.recursos) ? plano.recursos : [],
            limitacoes: plano.limitacoes || {
              produtos: 0,
              lojas: 1,
              panfletos: 0,
              promocoes: 0,
              whatsapp: 0,
            },
          }))
        : []

      setPlanos(processedData)
    } catch (error) {
      console.error("Erro ao buscar planos:", error)
      toast.error("Erro ao carregar planos")
      setPlanos([])
    } finally {
      setIsLoading(false)
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchPlanos()
  }, [])

  // Salvar plano
  const savePlano = async (plano: Partial<Plano>) => {
    try {
      const isEditing = !!plano._id
      const url = isEditing ? `/api/planos/${plano._id}` : "/api/planos"
      const method = isEditing ? "PUT" : "POST"

      // Ensure limitacoes is properly formatted
      const dataToSend = {
        ...plano,
        limitacoes: {
          produtos: Number(plano.limitacoes?.produtos || 0),
          lojas: Number(plano.limitacoes?.lojas || 1),
          panfletos: Number(plano.limitacoes?.panfletos || 0),
          promocoes: Number(plano.limitacoes?.promocoes || 0),
          whatsapp: Number(plano.limitacoes?.whatsapp || 0),
        },
      }

      console.log("Sending data:", JSON.stringify(dataToSend, null, 2))

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Erro ao ${isEditing ? "atualizar" : "criar"} plano`)
      }

      toast.success(`Plano ${isEditing ? "atualizado" : "criado"} com sucesso`)
      fetchPlanos()
    } catch (error) {
      console.error("Erro ao salvar plano:", error)
      toast.error(`Erro ao ${plano._id ? "atualizar" : "criar"} plano`)
      throw error
    }
  }

  // Excluir plano
  const deletePlano = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este plano?")) {
      return
    }

    try {
      const response = await fetch(`/api/planos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir plano")
      }

      toast.success("Plano excluído com sucesso")
      fetchPlanos()
    } catch (error) {
      console.error("Erro ao excluir plano:", error)
      toast.error("Erro ao excluir plano")
    }
  }

  // Filtrar planos
  const planosFiltrados = planos.filter((plano) => {
    // Filtrar por termo de busca
    const matchesSearch =
      plano.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plano.slug.toLowerCase().includes(searchTerm.toLowerCase())

    // Filtrar por status ativo
    const matchesAtivo =
      filtroAtivo === null || (filtroAtivo === "ativo" && plano.ativo) || (filtroAtivo === "inativo" && !plano.ativo)

    return matchesSearch && matchesAtivo
  })

  // Formatar preço
  const formatarPreco = (preco: number) => {
    return preco.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    })
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Planos</h2>
        <Button
          className="gap-2"
          onClick={() => {
            setCurrentPlano(undefined)
            setDialogOpen(true)
          }}
        >
          <Plus className="h-4 w-4" />
          Novo Plano
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex w-full md:w-auto items-center space-x-2">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou slug..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-normal text-xs text-muted-foreground">Status</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setFiltroAtivo(null)}>
                <span className={filtroAtivo === null ? "font-medium" : ""}>Todos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroAtivo("ativo")}>
                <span className={filtroAtivo === "ativo" ? "font-medium" : ""}>Ativos</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFiltroAtivo("inativo")}>
                <span className={filtroAtivo === "inativo" ? "font-medium" : ""}>Inativos</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" size="icon" onClick={fetchPlanos}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <span>{planos.length} planos</span>
          </Badge>
          <Badge variant="outline" className="gap-1">
            <Check className="h-3 w-3 text-green-500" />
            <span>{planos.filter((p) => p.ativo).length} ativos</span>
          </Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4">
          <CardTitle>Planos</CardTitle>
          <CardDescription>Gerencie todos os planos da plataforma</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : planos.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <p className="text-muted-foreground">Nenhum plano encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead>Limitações</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {planosFiltrados.map((plano) => (
                    <TableRow key={plano._id}>
                      <TableCell className="font-medium">
                        {plano.nome}
                        {plano.popular && <Badge className="ml-2 bg-blue-600 text-white">Popular</Badge>}
                      </TableCell>
                      <TableCell>{plano.slug}</TableCell>
                      <TableCell>{formatarPreco(plano.preco)}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1 text-xs">
                          <span>
                            Produtos: {plano.limitacoes.produtos === 9999 ? "Ilimitado" : plano.limitacoes.produtos}
                          </span>
                          <span>Lojas: {plano.limitacoes.lojas === 9999 ? "Ilimitado" : plano.limitacoes.lojas}</span>
                          <span>
                            Panfletos: {plano.limitacoes.panfletos === 9999 ? "Ilimitado" : plano.limitacoes.panfletos}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {plano.ativo ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Ativo
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                            Inativo
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Abrir menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                setCurrentPlano(plano)
                                setDialogOpen(true)
                              }}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              <span>Editar</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deletePlano(plano._id)}>
                              <Trash className="mr-2 h-4 w-4" />
                              <span>Excluir</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <PlanFormDialog plano={currentPlano} onSave={savePlano} isOpen={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}

