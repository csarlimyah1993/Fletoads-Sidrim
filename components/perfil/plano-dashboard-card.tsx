"use client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { usePlanFeatures } from "@/hooks/use-plan-features"
import { CreditCard, ArrowUpRight } from "lucide-react"
import Link from "next/link"

export function PlanoDashboardCard() {
  const { planName, planLevel, isLoading } = usePlanFeatures()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
          <div className="h-4 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mt-2"></div>
        </CardContent>
        <CardFooter>
          <div className="h-10 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5 text-violet-500" />
          Seu Plano: {planName}
        </CardTitle>
        <CardDescription>
          {planLevel === "free" && "Plano gratuito com recursos básicos"}
          {planLevel === "start" && "Plano inicial com recursos essenciais"}
          {planLevel === "pro" && "Plano profissional com recursos avançados"}
          {planLevel === "business" && "Plano empresarial com recursos completos"}
          {planLevel === "enterprise" && "Plano corporativo com recursos personalizados"}
          {planLevel === "premium" && "Plano premium com todos os recursos"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">
          {planLevel === "free" && "Acesse recursos básicos para começar a usar o FletoAds."}
          {planLevel === "start" && "Ideal para pequenos negócios que estão começando."}
          {planLevel === "pro" && "Perfeito para negócios em crescimento que precisam de mais recursos."}
          {planLevel === "business" && "Completo para empresas que precisam de todas as ferramentas."}
          {planLevel === "enterprise" && "Personalizado para grandes empresas com necessidades específicas."}
          {planLevel === "premium" && "Acesso ilimitado a todos os recursos e prioridade no suporte."}
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="outline" asChild className="w-full">
          <Link href="/planos" className="flex items-center justify-center gap-2">
            Ver Detalhes do Plano
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

