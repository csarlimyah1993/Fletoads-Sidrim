"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

const planos = [
  {
    id: "gratuito",
    nome: "Gratuito",
    preco: "R$ 0",
    descricao: "Para pequenos negócios começarem a divulgar seus produtos",
    recursos: [
      { nome: "5 panfletos por mês", disponivel: true },
      { nome: "50 clientes cadastrados", disponivel: true },
      { nome: "2 campanhas ativas", disponivel: true },
      { nome: "Acesso ao Pan AI básico", disponivel: true },
      { nome: "Suporte por email", disponivel: true },
      { nome: "Integrações com outras plataformas", disponivel: false },
      { nome: "Análise avançada de dados", disponivel: false },
    ],
  },
  {
    id: "basico",
    nome: "Básico",
    preco: "R$ 49,90/mês",
    descricao: "Para negócios em crescimento que precisam de mais recursos",
    recursos: [
      { nome: "20 panfletos por mês", disponivel: true },
      { nome: "200 clientes cadastrados", disponivel: true },
      { nome: "5 campanhas ativas", disponivel: true },
      { nome: "Acesso ao Pan AI completo", disponivel: true },
      { nome: "Suporte por email e chat", disponivel: true },
      { nome: "1 integração com outras plataformas", disponivel: true },
      { nome: "Análise básica de dados", disponivel: true },
    ],
  },
  {
    id: "profissional",
    nome: "Profissional",
    preco: "R$ 99,90/mês",
    descricao: "Para negócios estabelecidos que precisam de recursos avançados",
    recursos: [
      { nome: "100 panfletos por mês", disponivel: true },
      { nome: "1000 clientes cadastrados", disponivel: true },
      { nome: "20 campanhas ativas", disponivel: true },
      { nome: "Acesso ao Pan AI completo", disponivel: true },
      { nome: "Suporte prioritário", disponivel: true },
      { nome: "5 integrações com outras plataformas", disponivel: true },
      { nome: "Análise avançada de dados", disponivel: true },
    ],
  },
  {
    id: "empresarial",
    nome: "Empresarial",
    preco: "R$ 199,90/mês",
    descricao: "Para grandes empresas com necessidades específicas",
    recursos: [
      { nome: "Panfletos ilimitados", disponivel: true },
      { nome: "Clientes ilimitados", disponivel: true },
      { nome: "Campanhas ilimitadas", disponivel: true },
      { nome: "Acesso ao Pan AI completo", disponivel: true },
      { nome: "Suporte dedicado", disponivel: true },
      { nome: "Integrações ilimitadas", disponivel: true },
      { nome: "Análise avançada de dados com BI", disponivel: true },
    ],
  },
]

export default function PlanosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [planoSelecionado, setPlanoSelecionado] = useState<string | null>(null)

  const handleSelectPlan = (planoId: string) => {
    setPlanoSelecionado(planoId)

    // Se for o plano gratuito, apenas mostra uma mensagem
    if (planoId === "gratuito") {
      toast({
        title: "Plano Gratuito",
        description: "Você já está no plano gratuito. Não é necessário fazer nada.",
      })
      return
    }

    // Redireciona para a página de checkout com o plano selecionado
    router.push(`/planos/checkout?plano=${planoId}`)
  }

  return (
    <div className="container mx-auto py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold tracking-tight">Planos e Preços</h1>
        <p className="text-muted-foreground mt-2">Escolha o plano ideal para o seu negócio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {planos.map((plano) => (
          <Card
            key={plano.id}
            className={`flex flex-col ${plano.id === "profissional" ? "border-primary shadow-lg" : ""}`}
          >
            <CardHeader>
              <CardTitle>{plano.nome}</CardTitle>
              <CardDescription>{plano.descricao}</CardDescription>
              <div className="mt-4 text-3xl font-bold">{plano.preco}</div>
            </CardHeader>
            <CardContent className="flex-grow">
              <ul className="space-y-2">
                {plano.recursos.map((recurso, index) => (
                  <li key={index} className="flex items-start">
                    {recurso.disponivel ? (
                      <Check className="h-5 w-5 text-green-500 mr-2 shrink-0" />
                    ) : (
                      <X className="h-5 w-5 text-red-500 mr-2 shrink-0" />
                    )}
                    <span className={recurso.disponivel ? "" : "text-muted-foreground"}>{recurso.nome}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handleSelectPlan(plano.id)}
                className="w-full"
                variant={plano.id === "profissional" ? "default" : "outline"}
              >
                {plano.id === "gratuito" ? "Plano Atual" : "Assinar Plano"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-10 text-center">
        <p className="text-muted-foreground">
          Todos os planos incluem acesso à plataforma FletoAds e atualizações regulares.
          <br />
          Para necessidades específicas, entre em contato para um plano personalizado.
        </p>
      </div>
    </div>
  )
}

