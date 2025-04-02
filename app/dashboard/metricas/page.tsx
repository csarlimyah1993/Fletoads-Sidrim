import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import MetricasVisitantes from "@/components/metricas/metricas-visitantes"

export const metadata: Metadata = {
  title: "Métricas de Visitantes - FletoAds",
  description: "Visualize as métricas de visitantes da sua loja",
}

export default function MetricasPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Métricas de Visitantes</h1>

      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="visitantes">Visitantes</TabsTrigger>
          <TabsTrigger value="lojas">Lojas</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Visitantes</CardTitle>
                <CardDescription>Visitantes registrados no evento</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <MetricasVisitantes tipo="total" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Visitas à Sua Loja</CardTitle>
                <CardDescription>Número de visitantes únicos</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <MetricasVisitantes tipo="loja" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Taxa de Conversão</CardTitle>
                <CardDescription>Visitantes que acessaram sua loja</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <MetricasVisitantes tipo="conversao" />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visitantes">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Visitantes</CardTitle>
              <CardDescription>Detalhes dos visitantes que acessaram sua loja</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense
                fallback={
                  <div className="space-y-2">
                    {Array(5)
                      .fill(0)
                      .map((_, i) => (
                        <Skeleton key={i} className="h-12 w-full" />
                      ))}
                  </div>
                }
              >
                <MetricasVisitantes tipo="lista" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lojas">
          <Card>
            <CardHeader>
              <CardTitle>Desempenho por Loja</CardTitle>
              <CardDescription>Comparativo de visitas entre lojas</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[350px] w-full" />}>
                <MetricasVisitantes tipo="grafico" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

