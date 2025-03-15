"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Esquema de validação para alteração de senha
const senhaSchema = z
  .object({
    senhaAtual: z.string().min(1, "Senha atual é obrigatória"),
    novaSenha: z.string().min(8, "Nova senha deve ter pelo menos 8 caracteres"),
    confirmarSenha: z.string().min(8, "Confirmação de senha é obrigatória"),
  })
  .refine((data) => data.novaSenha === data.confirmarSenha, {
    message: "As senhas não coincidem",
    path: ["confirmarSenha"],
  })

type SenhaFormValues = z.infer<typeof senhaSchema>

export default function ConfiguracoesPage() {
  const [notificacoesEmail, setNotificacoesEmail] = useState(true)
  const [notificacoesApp, setNotificacoesApp] = useState(true)
  const [temaEscuro, setTemaEscuro] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [usuario, setUsuario] = useState<any>(null)

  // Inicializar formulário de alteração de senha
  const form = useForm<SenhaFormValues>({
    resolver: zodResolver(senhaSchema),
    defaultValues: {
      senhaAtual: "",
      novaSenha: "",
      confirmarSenha: "",
    },
  })

  // Buscar dados do usuário
  useEffect(() => {
    const fetchUsuario = async () => {
      try {
        const response = await fetch("/api/usuario/perfil")

        if (response.ok) {
          const data = await response.json()
          setUsuario(data)

          // Atualizar estados com base nas preferências do usuário
          if (data.perfil?.preferencias) {
            setNotificacoesEmail(data.perfil.preferencias.notificacoes ?? true)
            setNotificacoesApp(data.perfil.preferencias.notificacoes ?? true)
            setTemaEscuro(data.perfil.preferencias.temaEscuro ?? false)
          }
        }
      } catch (error) {
        console.error("Erro ao buscar dados do usuário:", error)
      }
    }

    fetchUsuario()
  }, [])

  // Função para salvar alterações gerais
  const salvarAlteracoes = async () => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/usuario/perfil", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          perfil: {
            ...usuario?.perfil,
            preferencias: {
              notificacoes: notificacoesEmail,
              temaEscuro: temaEscuro,
              idioma: usuario?.perfil?.preferencias?.idioma || "pt-BR",
            },
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Erro ao salvar alterações")
      }

      toast.success("Alterações salvas com sucesso!")
    } catch (error) {
      console.error("Erro ao salvar alterações:", error)
      toast.error("Erro ao salvar alterações")
    } finally {
      setIsLoading(false)
    }
  }

  // Função para alterar senha
  const alterarSenha = async (values: SenhaFormValues) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/usuario/alterar-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senhaAtual: values.senhaAtual,
          novaSenha: values.novaSenha,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao alterar senha")
      }

      toast.success("Senha alterada com sucesso!")
      form.reset()
    } catch (error) {
      console.error("Erro ao alterar senha:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao alterar senha")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Configurações</h2>
      </div>

      <Tabs defaultValue="geral" className="space-y-4">
        <TabsList>
          <TabsTrigger value="geral">Geral</TabsTrigger>
          <TabsTrigger value="notificacoes">Notificações</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>
        <TabsContent value="geral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>Gerencie as configurações gerais da sua conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome</Label>
                <Input id="nome" defaultValue={usuario?.nome || ""} disabled={isLoading} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue={usuario?.email || ""} disabled />
                <p className="text-xs text-muted-foreground">O email não pode ser alterado</p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="tema" checked={temaEscuro} onCheckedChange={setTemaEscuro} disabled={isLoading} />
                <Label htmlFor="tema">Tema Escuro</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={salvarAlteracoes} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="notificacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>Gerencie como você recebe notificações</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="email"
                  checked={notificacoesEmail}
                  onCheckedChange={setNotificacoesEmail}
                  disabled={isLoading}
                />
                <Label htmlFor="email">Notificações por Email</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="app" checked={notificacoesApp} onCheckedChange={setNotificacoesApp} disabled={isLoading} />
                <Label htmlFor="app">Notificações no Aplicativo</Label>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={salvarAlteracoes} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Preferências"
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="seguranca" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Segurança da Conta</CardTitle>
              <CardDescription>Gerencie a segurança da sua conta</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(alterarSenha)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="senhaAtual"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Senha Atual</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="novaSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>A senha deve ter pelo menos 8 caracteres</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirmarSenha"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar Nova Senha</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Alterando...
                      </>
                    ) : (
                      "Alterar Senha"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

