import { Suspense } from "react"
import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import AdminMetricasVisitantes from "@/components/admin/admin-metricas-visitantes"

export const metadata: Metadata = {
  title: "Métricas do Evento - Admin FletoAds",
  description: "Painel administrativo de métricas do evento",
}

export default function AdminMetricasEventoPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Métricas do Evento - Painel Administrativo</h1>

      <Tabs defaultValue="resumo" className="space-y-4">
        <TabsList>
          <TabsTrigger value="resumo">Resumo</TabsTrigger>
          <TabsTrigger value="visitantes">Visitantes</TabsTrigger>
          <TabsTrigger value="lojas">Lojas</TabsTrigger>
          <TabsTrigger value="dados">Dados Coletados</TabsTrigger>
        </TabsList>

        <TabsContent value="resumo">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Total de Visitantes</CardTitle>
                <CardDescription>Visitantes registrados no evento</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <AdminMetricasVisitantes tipo="total" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Lojas Visitadas</CardTitle>
                <CardDescription>Lojas que receberam visitantes</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <AdminMetricasVisitantes tipo="lojasVisitadas" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Média de Visitas</CardTitle>
                <CardDescription>Média de lojas visitadas por pessoa</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <AdminMetricasVisitantes tipo="mediaVisitas" />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Taxa de Engajamento</CardTitle>
                <CardDescription>Visitantes que acessaram pelo menos uma loja</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Skeleton className="h-10 w-20" />}>
                  <AdminMetricasVisitantes tipo="engajamento" />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="visitantes">
          <Card>
            <CardHeader>
              <CardTitle>Lista de Visitantes</CardTitle>
              <CardDescription>Todos os visitantes registrados no evento</CardDescription>
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
                <AdminMetricasVisitantes tipo="listaCompleta" />
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
                <AdminMetricasVisitantes tipo="graficoLojas" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados">
          <Card>
            <CardHeader>
              <CardTitle>Dados Coletados</CardTitle>
              <CardDescription>Informações detalhadas dos visitantes</CardDescription>
            </CardHeader>
            <CardContent>
              <Suspense fallback={<Skeleton className="h-[500px] w-full" />}>
                <AdminMetricasVisitantes tipo="dadosCompletos" />
              </Suspense>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

