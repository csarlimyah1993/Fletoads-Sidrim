"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Schema de validação
const usuarioSchema = z.object({
  nome: z.string().min(2, { message: "O nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  password: z.string().min(6, { message: "A senha deve ter pelo menos 6 caracteres" }),
  role: z.string().default("user"),
})

type UsuarioFormValues = z.infer<typeof usuarioSchema>

export default function UsuariosPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsuarios, setIsLoadingUsuarios] = useState(false)
  const [usuarios, setUsuarios] = useState<any[]>([])

  const form = useForm<UsuarioFormValues>({
    resolver: zodResolver(usuarioSchema),
    defaultValues: {
      nome: "",
      email: "",
      password: "",
      role: "user",
    },
  })

  // Buscar usuários
  const fetchUsuarios = async () => {
    try {
      setIsLoadingUsuarios(true)
      const response = await fetch("/api/debug/usuarios")

      if (!response.ok) {
        throw new Error("Erro ao buscar usuários")
      }

      const data = await response.json()
      setUsuarios(data)
    } catch (error) {
      console.error("Erro ao buscar usuários:", error)
      toast.error("Erro ao buscar usuários")
    } finally {
      setIsLoadingUsuarios(false)
    }
  }

  // Buscar usuários ao carregar a página
  useEffect(() => {
    fetchUsuarios()
  }, [])

  // Criar ou atualizar usuário
  async function onSubmit(values: UsuarioFormValues) {
    setIsLoading(true)

    try {
      const response = await fetch("/api/debug/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar usuário")
      }

      const data = await response.json()
      toast.success(data.message)
      form.reset()

      // Atualizar a lista de usuários
      fetchUsuarios()
    } catch (error) {
      console.error("Erro ao criar usuário:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="mb-8 text-3xl font-bold">Gerenciamento de Usuários (Debug)</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Criar/Atualizar Usuário</CardTitle>
            <CardDescription>Crie um novo usuário ou atualize um existente</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do usuário" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input placeholder="Senha" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Função</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma função" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="user">Usuário</SelectItem>
                          <SelectItem value="admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    "Salvar Usuário"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Usuários Cadastrados</CardTitle>
              <CardDescription>Lista de todos os usuários no sistema</CardDescription>
            </div>
            <Button variant="outline" size="icon" onClick={fetchUsuarios} disabled={isLoadingUsuarios}>
              <RefreshCw className={`h-4 w-4 ${isLoadingUsuarios ? "animate-spin" : ""}`} />
            </Button>
          </CardHeader>
          <CardContent>
            {isLoadingUsuarios ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : usuarios.length > 0 ? (
              <div className="max-h-[500px] overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Senha</TableHead>
                      <TableHead>Função</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usuarios.map((usuario) => (
                      <TableRow key={usuario._id}>
                        <TableCell>{usuario.nome}</TableCell>
                        <TableCell>{usuario.email}</TableCell>
                        <TableCell>
                          {usuario.senhaExiste ? (
                            <span className="text-green-500">{usuario.senhaPreview}</span>
                          ) : (
                            <span className="text-red-500">Não definida</span>
                          )}
                        </TableCell>
                        <TableCell>{usuario.role || "user"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="py-4 text-center text-muted-foreground">Nenhum usuário encontrado</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

