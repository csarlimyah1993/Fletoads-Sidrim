"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertCircle, XCircle } from "lucide-react"

interface SystemStatus {
  database: {
    status: "online" | "degraded" | "offline"
    performance: number
    connections: number
    maxConnections: number
  }
  api: {
    status: "online" | "degraded" | "offline"
    responseTime: number
    requests: number
    errors: number
  }
  storage: {
    status: "online" | "degraded" | "offline"
    used: number
    total: number
    percentage: number
  }
  cache: {
    status: "online" | "degraded" | "offline"
    hitRate: number
    size: number
    maxSize: number
  }
}

export function AdminSystemStatus() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulando uma chamada de API
    const fetchSystemStatus = async () => {
      try {
        // Em um cenário real, você faria uma chamada de API aqui
        // const response = await fetch('/api/admin/system-status')
        // const result = await response.json()

        // Dados simulados
        const mockStatus: SystemStatus = {
          database: {
            status: "online",
            performance: 95,
            connections: 42,
            maxConnections: 100,
          },
          api: {
            status: "online",
            responseTime: 120, // ms
            requests: 1250,
            errors: 5,
          },
          storage: {
            status: "degraded",
            used: 75, // GB
            total: 100, // GB
            percentage: 75,
          },
          cache: {
            status: "online",
            hitRate: 92,
            size: 2.5, // GB
            maxSize: 5, // GB
          },
        }

        setStatus(mockStatus)
      } catch (error) {
        console.error("Erro ao buscar status do sistema:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSystemStatus()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "degraded":
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case "offline":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "online":
        return "Online"
      case "degraded":
        return "Degradado"
      case "offline":
        return "Offline"
      default:
        return "Desconhecido"
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-[150px]" />
              <Skeleton className="h-4 w-[250px]" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!status) {
    return (
      <div className="flex items-center justify-center p-6">
        <p className="text-muted-foreground">Não foi possível carregar o status do sistema.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Banco de Dados</CardTitle>
            <CardDescription>Status e performance do banco de dados</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.database.status)}
            <span className="text-sm font-medium">{getStatusText(status.database.status)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Performance</span>
                <span className="text-sm text-muted-foreground">{status.database.performance}%</span>
              </div>
              <Progress value={status.database.performance} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Conexões</span>
              <span className="text-sm">
                {status.database.connections} / {status.database.maxConnections}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>API</CardTitle>
            <CardDescription>Status e performance da API</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.api.status)}
            <span className="text-sm font-medium">{getStatusText(status.api.status)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">Tempo de Resposta</span>
              <span className="text-sm">{status.api.responseTime} ms</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Requisições (24h)</span>
              <span className="text-sm">{status.api.requests.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Erros (24h)</span>
              <span className="text-sm">
                {status.api.errors} ({((status.api.errors / status.api.requests) * 100).toFixed(2)}%)
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Armazenamento</CardTitle>
            <CardDescription>Status e utilização do armazenamento</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.storage.status)}
            <span className="text-sm font-medium">{getStatusText(status.storage.status)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Utilização</span>
                <span className="text-sm text-muted-foreground">{status.storage.percentage}%</span>
              </div>
              <Progress value={status.storage.percentage} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Espaço Utilizado</span>
              <span className="text-sm">
                {status.storage.used} GB / {status.storage.total} GB
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle>Cache</CardTitle>
            <CardDescription>Status e performance do cache</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon(status.cache.status)}
            <span className="text-sm font-medium">{getStatusText(status.cache.status)}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Taxa de Acerto</span>
                <span className="text-sm text-muted-foreground">{status.cache.hitRate}%</span>
              </div>
              <Progress value={status.cache.hitRate} className="mt-2" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Tamanho</span>
              <span className="text-sm">
                {status.cache.size} GB / {status.cache.maxSize} GB
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
