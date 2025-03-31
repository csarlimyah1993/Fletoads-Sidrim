"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Loader2, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface SystemStatus {
  database: {
    status: string
    connectionTime: number
    version: string
    uptime: number
  }
  server: {
    status: string
    uptime: number
    version: string
    platform: string
    memory: {
      total: number
      free: number
      used: number
      usedPercent: number
    }
    cpu: {
      cores: number
      load: number
      loadPercent: number
    }
  }
  application: {
    status: string
    version: string
    environment: string
    startTime: string
    uptime: number
    dependencies: {
      name: string
      version: string
      status: string
    }[]
    apis: {
      name: string
      status: string
      responseTime: number
    }[]
  }
}

export default function SystemStatusPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchSystemStatus = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/sistema/status")

        if (!response.ok) {
          throw new Error(`Erro ao buscar status do sistema: ${response.status}`)
        }

        const data = await response.json()
        setSystemStatus(data)
      } catch (error) {
        console.error("Erro ao buscar status do sistema:", error)
        setError((error as Error).message || "Não foi possível carregar o status do sistema")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSystemStatus()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / (3600 * 24))
    const hours = Math.floor((seconds % (3600 * 24)) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)

    return `${days}d ${hours}h ${minutes}m ${secs}s`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "healthy":
      case "ok":
        return "text-green-500"
      case "warning":
      case "degraded":
        return "text-amber-500"
      case "error":
      case "offline":
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "healthy":
      case "ok":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
      case "degraded":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />
      case "error":
      case "offline":
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  if (isLoading && !systemStatus) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-64 gap-4">
        <AlertTriangle className="h-12 w-12 text-red-500" />
        <p className="text-red-500 text-lg font-medium">{error}</p>
        <Button onClick={handleRefresh}>Tentar Novamente</Button>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Status do Sistema</h2>
        <Button onClick={handleRefresh}>Atualizar</Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-12 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="database">Banco de Dados</TabsTrigger>
          <TabsTrigger value="server">Servidor</TabsTrigger>
          <TabsTrigger value="application">Aplicação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Banco de Dados</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{systemStatus?.database.status || "Desconhecido"}</span>
                  {getStatusIcon(systemStatus?.database.status || "")}
                </div>
                <p className="text-xs text-muted-foreground mt-2">MongoDB {systemStatus?.database.version || ""}</p>
                <p className="text-xs text-muted-foreground">
                  Tempo de resposta: {systemStatus?.database.connectionTime || 0}ms
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Servidor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{systemStatus?.server.status || "Desconhecido"}</span>
                  {getStatusIcon(systemStatus?.server.status || "")}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {systemStatus?.server.platform || ""} - Node.js {systemStatus?.server.version || ""}
                </p>
                <p className="text-xs text-muted-foreground">
                  Uptime: {formatUptime(systemStatus?.server.uptime || 0)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Aplicação</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold">{systemStatus?.application.status || "Desconhecido"}</span>
                  {getStatusIcon(systemStatus?.application.status || "")}
                </div>
                <p className="text-xs text-muted-foreground mt-2">Versão: {systemStatus?.application.version || ""}</p>
                <p className="text-xs text-muted-foreground">Ambiente: {systemStatus?.application.environment || ""}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Utilização de Recursos</CardTitle>
                <CardDescription>Uso atual de CPU e memória</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">CPU</span>
                    <span className="text-sm font-medium">{systemStatus?.server.cpu.loadPercent || 0}%</span>
                  </div>
                  <Progress value={systemStatus?.server.cpu.loadPercent || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {systemStatus?.server.cpu.cores || 0} cores - Load: {systemStatus?.server.cpu.load || 0}
                  </p>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">Memória</span>
                    <span className="text-sm font-medium">{systemStatus?.server.memory.usedPercent || 0}%</span>
                  </div>
                  <Progress value={systemStatus?.server.memory.usedPercent || 0} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatBytes(systemStatus?.server.memory.used || 0)} /{" "}
                    {formatBytes(systemStatus?.server.memory.total || 0)}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Status das APIs</CardTitle>
                <CardDescription>Tempo de resposta dos serviços</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {systemStatus?.application.apis.map((api, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(api.status)}
                        <span className="text-sm font-medium">{api.name}</span>
                      </div>
                      <span className={`text-sm ${api.responseTime > 500 ? "text-amber-500" : "text-green-500"}`}>
                        {api.responseTime}ms
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Banco de Dados</CardTitle>
              <CardDescription>Detalhes da conexão MongoDB</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <p className={`text-sm ${getStatusColor(systemStatus?.database.status || "")}`}>
                      {systemStatus?.database.status || "Desconhecido"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Versão</h3>
                    <p className="text-sm">{systemStatus?.database.version || "Desconhecido"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Tempo de Conexão</h3>
                    <p className="text-sm">{systemStatus?.database.connectionTime || 0}ms</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Uptime</h3>
                    <p className="text-sm">{formatUptime(systemStatus?.database.uptime || 0)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="server" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações do Servidor</CardTitle>
              <CardDescription>Detalhes do ambiente de execução</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <p className={`text-sm ${getStatusColor(systemStatus?.server.status || "")}`}>
                      {systemStatus?.server.status || "Desconhecido"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Plataforma</h3>
                    <p className="text-sm">{systemStatus?.server.platform || "Desconhecido"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Versão Node.js</h3>
                    <p className="text-sm">{systemStatus?.server.version || "Desconhecido"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Uptime</h3>
                    <p className="text-sm">{formatUptime(systemStatus?.server.uptime || 0)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Utilização de CPU</h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {systemStatus?.server.cpu.cores || 0} cores - Load: {systemStatus?.server.cpu.load || 0}
                    </span>
                    <span className="text-xs font-medium">{systemStatus?.server.cpu.loadPercent || 0}%</span>
                  </div>
                  <Progress value={systemStatus?.server.cpu.loadPercent || 0} className="h-2" />
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Utilização de Memória</h3>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">
                      {formatBytes(systemStatus?.server.memory.used || 0)} /{" "}
                      {formatBytes(systemStatus?.server.memory.total || 0)}
                    </span>
                    <span className="text-xs font-medium">{systemStatus?.server.memory.usedPercent || 0}%</span>
                  </div>
                  <Progress value={systemStatus?.server.memory.usedPercent || 0} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="application" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informações da Aplicação</CardTitle>
              <CardDescription>Detalhes da aplicação FletoAds</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium">Status</h3>
                    <p className={`text-sm ${getStatusColor(systemStatus?.application.status || "")}`}>
                      {systemStatus?.application.status || "Desconhecido"}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Versão</h3>
                    <p className="text-sm">{systemStatus?.application.version || "Desconhecido"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Ambiente</h3>
                    <p className="text-sm">{systemStatus?.application.environment || "Desconhecido"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium">Uptime</h3>
                    <p className="text-sm">{formatUptime(systemStatus?.application.uptime || 0)}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">Dependências</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Versão</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemStatus?.application.dependencies.map((dep, index) => (
                        <TableRow key={index}>
                          <TableCell>{dep.name}</TableCell>
                          <TableCell>{dep.version}</TableCell>
                          <TableCell className={getStatusColor(dep.status)}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(dep.status)}
                              <span>{dep.status}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2">APIs</h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Tempo de Resposta</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {systemStatus?.application.apis.map((api, index) => (
                        <TableRow key={index}>
                          <TableCell>{api.name}</TableCell>
                          <TableCell className={getStatusColor(api.status)}>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(api.status)}
                              <span>{api.status}</span>
                            </div>
                          </TableCell>
                          <TableCell className={api.responseTime > 500 ? "text-amber-500" : "text-green-500"}>
                            {api.responseTime}ms
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

