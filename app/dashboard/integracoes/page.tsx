"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { IntegracoesList } from "@/components/integracoes/integracoes-list"
import { ResourceLimitsCard } from "@/components/dashboard/resource-limits-card"
import { PlanUpgradeBanner } from "@/components/dashboard/plan-upgrade-banner"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

interface Integracao {
  id: string
  nome: string
  descricao: string
  tipo: string
  status: "ativa" | "inativa" | "pendente"
  icone: string
}

export default function IntegracoesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [integracoes, setIntegracoes] = useState<Integracao[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchIntegracoes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/integracoes")

        if (!response.ok) {
          throw new Error("Falha ao carregar integrações")
        }

        const data = await response.json()
        setIntegracoes(data)
      } catch (error) {
        console.error("Erro ao buscar integrações:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as integrações. Tente novamente mais tarde.",
          variant: "destructive",
        })
        setIntegracoes([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchIntegracoes()
  }, [toast])

  const handleToggleStatus = async (id: string, novoStatus: "ativa" | "inativa") => {
    try {
      // Atualizar localmente primeiro para melhor UX
      setIntegracoes((prev) =>
        prev.map((integracao) => (integracao.id === id ? { ...integracao, status: novoStatus } : integracao)),
      )

      const response = await fetch(`/api/integracoes/${id}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: novoStatus }),
      })

      if (!response.ok) {
        throw new Error("Falha ao atualizar status da integração")
      }

      toast({
        title: "Sucesso",
        description: `Integração ${novoStatus === "ativa" ? "ativada" : "desativada"} com sucesso.`,
      })
    } catch (error) {
      console.error("Erro ao atualizar status da integração:", error)

      // Reverter a mudança local em caso de erro
      setIntegracoes((prev) =>
        prev.map((integracao) =>
          integracao.id === id ? { ...integracao, status: novoStatus === "ativa" ? "inativa" : "ativa" } : integracao,
        ),
      )

      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status da integração. Tente novamente mais tarde.",
        variant: "destructive",
      })
    }
  }

  const filteredIntegracoes = integracoes.filter(
    (integracao) =>
      integracao.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integracao.tipo.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const disponiveisIntegracoes = filteredIntegracoes.filter((integracao) => integracao.status !== "ativa")

  const ativasIntegracoes = filteredIntegracoes.filter((integracao) => integracao.status === "ativa")

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <PlanUpgradeBanner />

      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Integrações</h2>
        <Button asChild>
          <a href="/dashboard/integracoes/nova">
            <PlusCircle className="mr-2 h-4 w-4" />
            Nova Integração
          </a>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Suas Integrações</CardTitle>
              <CardDescription>Conecte sua loja com outras plataformas e serviços.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar integrações..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <Tabs defaultValue="ativas" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="ativas">Ativas</TabsTrigger>
                  <TabsTrigger value="disponiveis">Disponíveis</TabsTrigger>
                  <TabsTrigger value="todas">Todas</TabsTrigger>
                </TabsList>

                <TabsContent value="ativas" className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <IntegracoesList
                      integracoes={ativasIntegracoes}
                      onToggleStatus={handleToggleStatus}
                      emptyMessage="Nenhuma integração ativa. Ative uma integração para começar."
                    />
                  )}
                </TabsContent>

                <TabsContent value="disponiveis" className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <IntegracoesList
                      integracoes={disponiveisIntegracoes}
                      onToggleStatus={handleToggleStatus}
                      emptyMessage="Nenhuma integração disponível no momento."
                    />
                  )}
                </TabsContent>

                <TabsContent value="todas" className="space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <IntegracoesList
                      integracoes={filteredIntegracoes}
                      onToggleStatus={handleToggleStatus}
                      emptyMessage="Nenhuma integração encontrada."
                    />
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <ResourceLimitsCard />

          <Card>
            <CardHeader>
              <CardTitle>Benefícios das Integrações</CardTitle>
              <CardDescription>Conecte sua loja com outras plataformas para expandir seu alcance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Aumente suas vendas</h4>
                <p className="text-sm text-muted-foreground">
                  Integre com marketplaces e redes sociais para alcançar mais clientes.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Automatize processos</h4>
                <p className="text-sm text-muted-foreground">
                  Conecte com sistemas de gestão para automatizar tarefas do dia a dia.
                </p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Melhore a comunicação</h4>
                <p className="text-sm text-muted-foreground">
                  Integre com ferramentas de comunicação para atender seus clientes de forma eficiente.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

