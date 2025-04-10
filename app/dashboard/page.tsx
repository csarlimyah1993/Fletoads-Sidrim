import { Suspense } from "react"
import { UsageCard } from "@/components/dashboard/usage-card"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FREE_PLAN_LIMITS } from "@/lib/models/resource-limits"

// This would normally come from your API or database
const mockUsage = {
  panfletos: 0,
  produtos: 5,
  integracoes: 0,
}

export default function DashboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Seu Plano</CardTitle>
            <CardDescription>Plano Básico</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Acompanhe o uso dos recursos do seu plano</p>

            <div className="mt-6 space-y-4">
              <Suspense fallback={<div>Carregando...</div>}>
                <UsageCard
                  title="Panfletos"
                  description="Panfletos digitais criados"
                  used={mockUsage.panfletos}
                  limit={FREE_PLAN_LIMITS.panfletos}
                />

                <UsageCard
                  title="Produtos"
                  description="Produtos na vitrine"
                  used={mockUsage.produtos}
                  limit={FREE_PLAN_LIMITS.produtos}
                />

                <UsageCard
                  title="Integrações"
                  description="Integrações ativas"
                  used={mockUsage.integracoes}
                  limit={FREE_PLAN_LIMITS.integracoes}
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>

        {/* Other dashboard cards would go here */}
      </div>
    </div>
  )
}
