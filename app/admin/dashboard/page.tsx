import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatsCard } from "@/components/admin/stats-card"
import { UsersTable } from "@/components/admin/users-table"
import { LojasTable } from "@/components/admin/lojas-table"
import { AdminOverview } from "@/components/admin/admin-overview"
import { AdminActivity } from "@/components/admin/admin-activity"
import { AdminSystemStatus } from "@/components/admin/admin-sistem-status"
import { Users, Store, FileText, DollarSign } from "lucide-react"

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Painel de administração do sistema",
}

export default async function AdminDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="lojas">Lojas</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard
              title="Usuários Ativos"
              value="2,350"
              description="Usuários ativos no sistema"
              trend={12}
              trendLabel="em relação ao mês anterior"
              icon={<Users className="h-4 w-4" />}
            />
            <StatsCard
              title="Lojas Registradas"
              value="1,203"
              description="Lojas registradas no sistema"
              trend={8}
              trendLabel="em relação ao mês anterior"
              icon={<Store className="h-4 w-4" />}
            />
            <StatsCard
              title="Panfletos Criados"
              value="12,234"
              description="Total de panfletos criados"
              trend={24}
              trendLabel="em relação ao mês anterior"
              icon={<FileText className="h-4 w-4" />}
            />
            <StatsCard
              title="Receita Total"
              value="R$ 45,231.89"
              description="Receita total gerada"
              trend={18}
              trendLabel="em relação ao mês anterior"
              icon={<DollarSign className="h-4 w-4" />}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Visão Geral</CardTitle>
                <CardDescription>Visão geral do sistema</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <AdminOverview />
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Atividades recentes no sistema</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminActivity />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="users" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Usuários</CardTitle>
              <CardDescription>Lista de usuários do sistema</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <UsersTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="lojas" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Lojas</CardTitle>
              <CardDescription>Lista de lojas registradas</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <LojasTable />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="system" className="space-y-4">
          <Card className="col-span-4">
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>Informações sobre o status do sistema</CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <AdminSystemStatus />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
