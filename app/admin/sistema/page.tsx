"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Database, Server, RefreshCw, Cpu, HardDrive, Clock, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"

// Componente para status do sistema
function StatusIndicator({ status }: { status: "online" | "offline" | "warning" | "loading" }) {
  if (status === "loading") {
    return (
      <div className="flex items-center">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground mr-2" />
        <span className="text-muted-foreground">Verificando...</span>
      </div>
    )
  }

  return (
    <div className="flex items-center">
      {status === "online" && <CheckCircle className="h-4 w-4 text-green-500 mr-2" />}
      {status === "warning" && <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />}
      {status === "offline" && <AlertCircle className="h-4 w-4 text-red-500 mr-2" />}
      <span
        className={status === "online" ? "text-green-500" : status === "warning" ? "text-amber-500" : "text-red-500"}
      >
        {status === "online" ? "Online" : status === "warning" ? "Atenção" : "Offline"}
      </span>
    </div>
  )
}

// Componente para métricas do sistema
function SystemMetric({
  icon: Icon,
  title,
  value,
  description,
  status = "normal",
}: {
  icon: any
  title: string
  value: string | number
  description?: string
  status?: "normal" | "warning" | "critical"
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 ${
            status === "normal" ? "text-muted-foreground" : status === "warning" ? "text-amber-500" : "text-red-500"
          }`}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </CardContent>
    </Card>
  )
}

export default function SistemaPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [systemStatus, setSystemStatus] = useState({
    api: "loading" as "online" | "offline" | "warning" | "loading",
    database: "loading" as "online" | "offline" | "warning" | "loading",
    storage: "loading" as "online" | "offline" | "warning" | "loading",
    auth: "loading" as "online" | "offline" | "warning" | "loading",
    lastUpdated: "",
    metrics: {
      cpu: 0,
      memory: 0,
      disk: 0,
      uptime: 0,
    },
  })

  // Carregar status do sistema
  useEffect(() => {
    const fetchSystemStatus = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/admin/sistema/status")

        if (!response.ok) {
          throw new Error("Falha ao carregar status do sistema")
        }

        const data = await response.json()

        setSystemStatus({
          api: data.api,
          database: data.database,
          storage: data.storage,
          auth: data.auth,
          lastUpdated: new Date().toLocaleString(),
          metrics: {
            cpu: Number.parseInt(data.system.cpuUsage),
            memory: Number.parseInt(data.system.memoryUsage),
            disk: Number.parseInt(data.system.diskUsage),
            uptime: Number.parseFloat(data.system.uptime.toFixed(1)),
          },
        })
      } catch (error) {
        console.error("Erro ao carregar status do sistema:", error)
        toast.error("Erro ao carregar status do sistema")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
  }, [])

  // Função para atualizar status
  const handleRefresh = async () => {
    setSystemStatus((prev) => ({
      ...prev,
      api: "loading",
      database: "loading",
      storage: "loading",
      auth: "loading",
    }))

    try {
      const response = await fetch("/api/admin/sistema/status")

      if (!response.ok) {
        throw new Error("Falha ao atualizar status do sistema")
      }

      const data = await response.json()

      setSystemStatus({
        api: data.api,
        database: data.database,
        storage: data.storage,
        auth: data.auth,
        lastUpdated: new Date().toLocaleString(),
        metrics: {
          cpu: Number.parseInt(data.system.cpuUsage),
          memory: Number.parseInt(data.system.memoryUsage),
          disk: Number.parseInt(data.system.diskUsage),
          uptime: Number.parseFloat(data.system.uptime.toFixed(1)),
        },
      })

      toast.success("Status do sistema atualizado")
    } catch (error) {
      console.error("Erro ao atualizar status do sistema:", error)
      toast.error("Erro ao atualizar status do sistema")
    }
  }

  // Animação para os cards
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Status do Sistema</h2>
        <Button onClick={handleRefresh} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Atualizar
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Última atualização: {systemStatus.lastUpdated || "Carregando..."}
        </p>
        <Badge variant="outline" className="gap-1">
          <span
            className={`h-2 w-2 rounded-full ${
              isLoading
                ? "bg-amber-500"
                : systemStatus.api === "online" && systemStatus.database === "online" && systemStatus.auth === "online"
                  ? "bg-green-500"
                  : "bg-red-500"
            }`}
          />
          {isLoading
            ? "Verificando"
            : systemStatus.api === "online" && systemStatus.database === "online" && systemStatus.auth === "online"
              ? "Todos sistemas operacionais"
              : "Problemas detectados"}
        </Badge>
      </div>

      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">Status</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="status" className="space-y-4">
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">API</CardTitle>
                  <Server className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <StatusIndicator status={systemStatus.api} />
                  <p className="text-xs text-muted-foreground mt-2">Serviços de API e endpoints</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <StatusIndicator status={systemStatus.database} />
                  <p className="text-xs text-muted-foreground mt-2">MongoDB e conexões de dados</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Armazenamento</CardTitle>
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <StatusIndicator status={systemStatus.storage} />
                  <p className="text-xs text-muted-foreground mt-2">Serviços de armazenamento e uploads</p>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Autenticação</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <StatusIndicator status={systemStatus.auth} />
                  <p className="text-xs text-muted-foreground mt-2">Serviços de autenticação e sessões</p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>

          <Card>
            <CardHeader>
              <CardTitle>Detalhes do Sistema</CardTitle>
              <CardDescription>Informações detalhadas sobre o estado atual do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <SystemMetric
                    icon={Cpu}
                    title="CPU"
                    value={`${systemStatus.metrics.cpu}%`}
                    description="Utilização atual"
                    status={
                      systemStatus.metrics.cpu > 80 ? "critical" : systemStatus.metrics.cpu > 60 ? "warning" : "normal"
                    }
                  />
                  <SystemMetric
                    icon={Database}
                    title="Memória"
                    value={`${systemStatus.metrics.memory}%`}
                    description="Utilização atual"
                    status={
                      systemStatus.metrics.memory > 80
                        ? "critical"
                        : systemStatus.metrics.memory > 60
                          ? "warning"
                          : "normal"
                    }
                  />
                  <SystemMetric
                    icon={HardDrive}
                    title="Disco"
                    value={`${systemStatus.metrics.disk}%`}
                    description="Espaço utilizado"
                    status={
                      systemStatus.metrics.disk > 80
                        ? "critical"
                        : systemStatus.metrics.disk > 60
                          ? "warning"
                          : "normal"
                    }
                  />
                  <SystemMetric
                    icon={Clock}
                    title="Uptime"
                    value={`${systemStatus.metrics.uptime} dias`}
                    description="Tempo online"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance do Sistema</CardTitle>
              <CardDescription>Métricas de performance e utilização de recursos</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Gráficos de performance serão exibidos aqui</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs do Sistema</CardTitle>
              <CardDescription>Registros de eventos e erros do sistema</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px] flex items-center justify-center">
              <p className="text-muted-foreground">Logs do sistema serão exibidos aqui</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

