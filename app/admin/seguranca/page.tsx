"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Shield, AlertTriangle, Lock, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface LoginAttempt {
  id: string
  email: string
  success: boolean
  ip: string
  userAgent: string
  timestamp: string
  reason?: string
}

interface SecurityLog {
  id: string
  type: string
  severity: string
  message: string
  details: string
  timestamp: string
}

interface SecurityStats {
  totalUsers: number
  activeUsers: number
  failedLogins: number
  successfulLogins: number
  suspiciousActivities: number
  securityLogs: number
  recentLoginAttempts: LoginAttempt[]
  recentSecurityLogs: SecurityLog[]
}

export default function SecurityPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [securityStats, setSecurityStats] = useState<SecurityStats | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchSecurityStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/seguranca/stats")

        if (!response.ok) {
          throw new Error(`Erro ao buscar estatísticas de segurança: ${response.status}`)
        }

        const data = await response.json()
        setSecurityStats(data)
      } catch (error) {
        console.error("Erro ao buscar estatísticas de segurança:", error)
        setError((error as Error).message || "Não foi possível carregar as estatísticas de segurança")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecurityStats()
  }, [refreshKey])

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return new Intl.DateTimeFormat("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(date)
    } catch (error) {
      return "Data inválida"
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "text-red-500 bg-red-100"
      case "high":
        return "text-orange-500 bg-orange-100"
      case "medium":
        return "text-amber-500 bg-amber-100"
      case "low":
        return "text-blue-500 bg-blue-100"
      case "info":
        return "text-green-500 bg-green-100"
      default:
        return "text-gray-500 bg-gray-100"
    }
  }

  if (isLoading && !securityStats) {
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
        <h2 className="text-3xl font-bold tracking-tight">Segurança</h2>
        <Button onClick={handleRefresh}>Atualizar</Button>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-12 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tentativas de Login</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(securityStats?.successfulLogins || 0) + (securityStats?.failedLogins || 0)}
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-green-500">{securityStats?.successfulLogins || 0} com sucesso</p>
              <p className="text-xs text-red-500">{securityStats?.failedLogins || 0} falhas</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Atividades Suspeitas</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.suspiciousActivities || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Nas últimas 24 horas</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.activeUsers || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">De {securityStats?.totalUsers || 0} usuários totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Logs de Segurança</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityStats?.securityLogs || 0}</div>
            <p className="text-xs text-muted-foreground mt-2">Eventos registrados no sistema</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="login-attempts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="login-attempts">Tentativas de Login</TabsTrigger>
          <TabsTrigger value="security-logs">Logs de Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="login-attempts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tentativas de Login Recentes</CardTitle>
              <CardDescription>Histórico das últimas tentativas de login no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Navegador</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Motivo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityStats?.recentLoginAttempts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        Nenhuma tentativa de login registrada
                      </TableCell>
                    </TableRow>
                  ) : (
                    securityStats?.recentLoginAttempts.map((attempt) => (
                      <TableRow key={attempt.id}>
                        <TableCell className="font-medium">{attempt.email}</TableCell>
                        <TableCell>
                          <Badge variant={attempt.success ? "success" : "destructive"}>
                            {attempt.success ? "Sucesso" : "Falha"}
                          </Badge>
                        </TableCell>
                        <TableCell>{attempt.ip}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={attempt.userAgent}>
                          {attempt.userAgent}
                        </TableCell>
                        <TableCell>{formatDate(attempt.timestamp)}</TableCell>
                        <TableCell>{attempt.reason || "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Segurança Recentes</CardTitle>
              <CardDescription>Eventos de segurança registrados no sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Severidade</TableHead>
                    <TableHead>Mensagem</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Detalhes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {securityStats?.recentSecurityLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        Nenhum log de segurança registrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    securityStats?.recentSecurityLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-medium">{log.type}</TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.severity)}>{log.severity}</Badge>
                        </TableCell>
                        <TableCell>{log.message}</TableCell>
                        <TableCell>{formatDate(log.timestamp)}</TableCell>
                        <TableCell className="max-w-[200px] truncate" title={log.details}>
                          {log.details}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

