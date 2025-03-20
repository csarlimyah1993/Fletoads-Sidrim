"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Send, Users, User, Loader2, CheckCircle, AlertCircle, InfoIcon, Search, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

export default function NotificacoesPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [usuarios, setUsuarios] = useState<any[]>([])
  const [formData, setFormData] = useState({
    titulo: "",
    mensagem: "",
    tipo: "info",
    destinatario: "todos",
    usuarioId: "",
    link: "",
  })

  // Buscar usuários
  const fetchUsuarios = async () => {
    try {
      const response = await fetch("/api/admin/usuarios")

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários")
      }

      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      toast.error("Erro ao carregar usuários")
    }
  }

  // Carregar dados iniciais
  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Manipular mudanças no formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manipular mudanças em selects
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Enviar notificação
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Validar formulário
      if (!formData.titulo || !formData.mensagem) {
        toast.error("Preencha todos os campos obrigatórios")
        return
      }

      if (formData.destinatario === "usuario" && !formData.usuarioId) {
        toast.error("Selecione um usuário")
        return
      }

      // Preparar dados
      const notificacaoData = {
        titulo: formData.titulo,
        mensagem: formData.mensagem,
        tipo: formData.tipo,
        link: formData.link || undefined,
        destinatario: formData.destinatario,
        usuarioId: formData.destinatario === "usuario" ? formData.usuarioId : undefined,
      }

      // Enviar notificação
      const response = await fetch("/api/admin/notificacoes/enviar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(notificacaoData),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao enviar notificação")
      }

      const data = await response.json()

      toast.success("Notificação enviada com sucesso")

      // Limpar formulário
      setFormData({
        titulo: "",
        mensagem: "",
        tipo: "info",
        destinatario: "todos",
        usuarioId: "",
        link: "",
      })
    } catch (error) {
      console.error("Erro ao enviar notificação:", error)
      toast.error("Erro ao enviar notificação")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Gerenciamento de Notificações</h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Enviar Notificação</CardTitle>
            <CardDescription>Envie notificações para usuários da plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  placeholder="Digite o título da notificação"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  name="mensagem"
                  value={formData.mensagem}
                  onChange={handleChange}
                  placeholder="Digite a mensagem da notificação"
                  rows={4}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tipo">Tipo</Label>
                <Select value={formData.tipo} onValueChange={(value) => handleSelectChange("tipo", value)}>
                  <SelectTrigger id="tipo">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="info">Informação</SelectItem>
                    <SelectItem value="success">Sucesso</SelectItem>
                    <SelectItem value="warning">Aviso</SelectItem>
                    <SelectItem value="error">Erro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="destinatario">Destinatário</Label>
                <Select
                  value={formData.destinatario}
                  onValueChange={(value) => handleSelectChange("destinatario", value)}
                >
                  <SelectTrigger id="destinatario">
                    <SelectValue placeholder="Selecione o destinatário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os usuários</SelectItem>
                    <SelectItem value="usuario">Usuário específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.destinatario === "usuario" && (
                <div className="grid gap-2">
                  <Label htmlFor="usuarioId">Usuário</Label>
                  <Select value={formData.usuarioId} onValueChange={(value) => handleSelectChange("usuarioId", value)}>
                    <SelectTrigger id="usuarioId">
                      <SelectValue placeholder="Selecione o usuário" />
                    </SelectTrigger>
                    <SelectContent>
                      {usuarios.map((usuario) => (
                        <SelectItem key={usuario._id} value={usuario._id}>
                          {usuario.nome} ({usuario.email})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="link">Link (opcional)</Label>
                <Input
                  id="link"
                  name="link"
                  value={formData.link}
                  onChange={handleChange}
                  placeholder="Ex: /dashboard/vendas/123"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Enviar Notificação
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Histórico de Notificações</CardTitle>
            <CardDescription>Visualize as notificações enviadas recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input type="search" placeholder="Buscar notificações..." className="pl-8" />
              </div>
              <Button variant="outline" size="icon">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Destinatário</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="font-medium">Bem-vindo ao FletoAds</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        <InfoIcon className="h-3 w-3 mr-1" />
                        Informação
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        Todos
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Plano atualizado</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Sucesso
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <User className="h-3 w-3" />
                        Usuário
                      </Badge>
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="font-medium">Manutenção programada</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Aviso
                      </Badge>
                    </TableCell>
                    <TableCell>{format(new Date(), "dd/MM/yyyy HH:mm", { locale: ptBR })}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="gap-1">
                        <Users className="h-3 w-3" />
                        Todos
                      </Badge>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

