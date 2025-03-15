"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Loader2, ArrowLeft, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"

// Esquema de validação para edição de integração
const integracaoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  credenciais: z.record(z.any()).optional(),
  configuracao: z.record(z.any()).optional(),
  status: z.enum(["ativo", "inativo", "pendente"]).default("pendente"),
})

type IntegracaoFormValues = z.infer<typeof integracaoSchema>

export default function EditarIntegracaoPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [integracao, setIntegracao] = useState<any>(null)
  const [tiposIntegracao, setTiposIntegracao] = useState<any[]>([])
  const [tipoSelecionado, setTipoSelecionado] = useState<any>(null)
  const [provedorSelecionado, setProvedorSelecionado] = useState<any>(null)

  // Inicializar formulário
  const form = useForm<IntegracaoFormValues>({
    resolver: zodResolver(integracaoSchema),
    defaultValues: {
      nome: "",
      descricao: "",
      credenciais: {},
      configuracao: {},
      status: "pendente",
    },
  })

  // Buscar dados da integração
  const fetchIntegracao = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/integracoes/${params.id}`)

      if (!response.ok) {
        throw new Error("Erro ao buscar integração")
      }

      const data = await response.json()
      setIntegracao(data)

      // Preencher formulário com dados da integração
      form.reset({
        nome: data.nome,
        descricao: data.descricao,
        credenciais: data.credenciais || {},
        configuracao: data.configuracao || {},
        status: data.status,
      })
    } catch (error) {
      console.error("Erro ao buscar integração:", error)
      toast.error("Erro ao carregar dados da integração")
      router.push("/integracoes")
    } finally {
      setIsLoading(false)
    }
  }

  // Buscar tipos de integração
  const fetchTiposIntegracao = async () => {
    try {
      const response = await fetch("/api/integracoes/tipos")

      if (!response.ok) {
        throw new Error("Erro ao buscar tipos de integração")
      }

      const data = await response.json()
      setTiposIntegracao(data)
    } catch (error) {
      console.error("Erro ao buscar tipos de integração:", error)
      toast.error("Erro ao carregar tipos de integração")
    }
  }

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchIntegracao()
    fetchTiposIntegracao()
  }, [params.id])

  // Efeito para configurar tipo e provedor quando os dados estiverem carregados
  useEffect(() => {
    if (!integracao || tiposIntegracao.length === 0) return

    const tipo = tiposIntegracao.find((t) => t.id === integracao.tipo)
    setTipoSelecionado(tipo)

    if (tipo) {
      const provedor = tipo.provedores.find((p: any) => p.id === integracao.provedor)
      setProvedorSelecionado(provedor)
    }
  }, [integracao, tiposIntegracao])

  // Função para testar conexão
  const testarConexao = async () => {
    try {
      setIsSaving(true)
      toast.loading("Testando conexão...")

      const response = await fetch("/api/integracoes/testar-conexao", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          integracaoId: params.id,
          credenciais: form.getValues("credenciais"),
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast.success("Conexão estabelecida com sucesso")
        fetchIntegracao() // Recarregar dados atualizados
      } else {
        toast.error(data.error || "Erro ao testar conexão")
      }
    } catch (error) {
      console.error("Erro ao testar conexão:", error)
      toast.error("Erro ao testar conexão")
    } finally {
      setIsSaving(false)
    }
  }

  // Função para atualizar integração
  const onSubmit = async (values: IntegracaoFormValues) => {
    try {
      setIsSaving(true)

      const response = await fetch(`/api/integracoes/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao atualizar integração")
      }

      toast.success("Integração atualizada com sucesso")
      fetchIntegracao() // Recarregar dados atualizados
    } catch (error) {
      console.error("Erro ao atualizar integração:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao atualizar integração")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Editar Integração</h2>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
                <CardDescription>Configure as informações básicas da integração</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Tipo de Integração</Label>
                    <Input value={tipoSelecionado?.nome || integracao?.tipo || ""} disabled />
                    <p className="text-sm text-muted-foreground mt-1">
                      {tipoSelecionado?.descricao || "Tipo de integração"}
                    </p>
                  </div>

                  <div>
                    <Label>Provedor</Label>
                    <Input value={provedorSelecionado?.nome || integracao?.provedor || ""} disabled />
                    <p className="text-sm text-muted-foreground mt-1">
                      {provedorSelecionado?.descricao || "Provedor de serviço"}
                    </p>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Integração</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome da integração" {...field} disabled={isSaving} />
                      </FormControl>
                      <FormDescription>Um nome para identificar esta integração</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descricao"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Descreva o propósito desta integração"
                          {...field}
                          rows={3}
                          disabled={isSaving}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isSaving}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="inativo">Inativo</SelectItem>
                          <SelectItem value="pendente">Pendente</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {integracao?.ultimaSincronizacao && (
                  <div className="pt-2">
                    <Label>Última Sincronização</Label>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(integracao.ultimaSincronizacao), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", {
                        locale: ptBR,
                      })}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {provedorSelecionado && (
              <Card>
                <CardHeader>
                  <CardTitle>Credenciais</CardTitle>
                  <CardDescription>Configure as credenciais de acesso para esta integração</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {provedorSelecionado.campos.map((campo: any) => (
                    <div key={campo.nome} className="space-y-2">
                      <Label htmlFor={campo.nome}>
                        {campo.label}
                        {campo.obrigatorio && <span className="text-destructive ml-1">*</span>}
                      </Label>
                      {campo.tipo === "select" ? (
                        <Select
                          onValueChange={(value) => {
                            const credenciais = { ...form.getValues("credenciais"), [campo.nome]: value }
                            form.setValue("credenciais", credenciais)
                          }}
                          defaultValue={form.getValues("credenciais")[campo.nome] || ""}
                          disabled={isSaving}
                        >
                          <SelectTrigger id={campo.nome}>
                            <SelectValue placeholder={`Selecione ${campo.label}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {campo.opcoes.map((opcao: string) => (
                              <SelectItem key={opcao} value={opcao}>
                                {opcao}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          id={campo.nome}
                          type={campo.tipo}
                          placeholder={campo.label}
                          value={form.getValues("credenciais")[campo.nome] || ""}
                          onChange={(e) => {
                            const credenciais = { ...form.getValues("credenciais"), [campo.nome]: e.target.value }
                            form.setValue("credenciais", credenciais)
                          }}
                          disabled={isSaving}
                        />
                      )}
                      {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={testarConexao} disabled={isSaving} className="mt-2">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Testar Conexão
                  </Button>
                </CardContent>
              </Card>
            )}

            <CardFooter className="flex justify-between px-0">
              <Button variant="outline" onClick={() => router.back()} disabled={isSaving}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar Alterações"
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      )}
    </div>
  )
}

