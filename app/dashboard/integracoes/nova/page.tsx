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
import { Loader2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

// Esquema de validação para nova integração
const integracaoSchema = z.object({
  nome: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  tipo: z.string().min(1, "Tipo é obrigatório"),
  provedor: z.string().min(1, "Provedor é obrigatório"),
  descricao: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  credenciais: z.record(z.any()).optional(),
  configuracao: z.record(z.any()).optional(),
  status: z.enum(["ativo", "inativo", "pendente"]).default("pendente"),
})

type IntegracaoFormValues = z.infer<typeof integracaoSchema>

export default function NovaIntegracaoPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [tiposIntegracao, setTiposIntegracao] = useState<any[]>([])
  const [tipoSelecionado, setTipoSelecionado] = useState<any>(null)
  const [provedorSelecionado, setProvedorSelecionado] = useState<any>(null)

  // Inicializar formulário
  const form = useForm<IntegracaoFormValues>({
    resolver: zodResolver(integracaoSchema),
    defaultValues: {
      nome: "",
      tipo: "",
      provedor: "",
      descricao: "",
      credenciais: {},
      configuracao: {},
      status: "pendente",
    },
  })

  // Buscar tipos de integração
  const fetchTiposIntegracao = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/integracoes/tipos")

      if (!response.ok) {
        throw new Error("Erro ao buscar tipos de integração")
      }

      const data = await response.json()
      setTiposIntegracao(data)
    } catch (error) {
      console.error("Erro ao buscar tipos de integração:", error)
      toast.error("Erro ao carregar tipos de integração")
    } finally {
      setIsLoading(false)
    }
  }

  // Efeito para carregar dados iniciais
  useEffect(() => {
    fetchTiposIntegracao()
  }, [])

  // Atualizar tipo selecionado quando o valor mudar
  useEffect(() => {
    const tipoId = form.watch("tipo")
    const tipo = tiposIntegracao.find((t) => t.id === tipoId)
    setTipoSelecionado(tipo)

    // Resetar provedor quando o tipo mudar
    form.setValue("provedor", "")
    setProvedorSelecionado(null)
  }, [form.watch("tipo"), tiposIntegracao])

  // Atualizar provedor selecionado quando o valor mudar
  useEffect(() => {
    if (!tipoSelecionado) return

    const provedorId = form.watch("provedor")
    const provedor = tipoSelecionado.provedores.find((p: any) => p.id === provedorId)
    setProvedorSelecionado(provedor)

    // Inicializar credenciais vazias para os campos do provedor
    if (provedor) {
      const credenciaisVazias: Record<string, string> = {}
      provedor.campos.forEach((campo: any) => {
        credenciaisVazias[campo.nome] = ""
      })
      form.setValue("credenciais", credenciaisVazias)

      // Atualizar nome e descrição com valores do provedor se estiverem vazios
      if (!form.getValues("nome")) {
        form.setValue("nome", provedor.nome)
      }
      if (!form.getValues("descricao")) {
        form.setValue("descricao", provedor.descricao)
      }
    }
  }, [form.watch("provedor"), tipoSelecionado])

  // Função para criar integração
  const onSubmit = async (values: IntegracaoFormValues) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/integracoes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...values,
          icone: provedorSelecionado?.icone || "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erro ao criar integração")
      }

      // Atualizar a rota de redirecionamento após criar uma integração
      toast.success("Integração criada com sucesso")
      router.push("/dashboard/integracoes")
    } catch (error) {
      console.error("Erro ao criar integração:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao criar integração")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2 mb-4">
        <Button variant="outline" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-3xl font-bold tracking-tight">Nova Integração</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
              <CardDescription>Configure as informações básicas da integração</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="tipo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Integração</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tiposIntegracao.map((tipo) => (
                            <SelectItem key={tipo.id} value={tipo.id}>
                              {tipo.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {tipoSelecionado?.descricao || "Selecione o tipo de integração que deseja configurar"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="provedor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Provedor</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading || !tipoSelecionado}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um provedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tipoSelecionado?.provedores.map((provedor: any) => (
                            <SelectItem key={provedor.id} value={provedor.id}>
                              {provedor.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        {provedorSelecionado?.descricao || "Selecione o provedor de serviço"}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Integração</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da integração" {...field} disabled={isLoading} />
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
                        disabled={isLoading}
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
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
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
                        disabled={isLoading}
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
                        disabled={isLoading}
                      />
                    )}
                    {campo.descricao && <p className="text-sm text-muted-foreground">{campo.descricao}</p>}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          <CardFooter className="flex justify-between px-0">
            <Button variant="outline" onClick={() => router.back()} disabled={isLoading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Integração"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </div>
  )
}

