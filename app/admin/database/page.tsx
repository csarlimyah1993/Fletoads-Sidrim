"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Loader2, Database, HardDrive, FileText, AlertTriangle } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface CollectionStats {
  name: string
  count: number
  size: number
  avgObjSize: number
  storageSize: number
  indexes: number
}

interface DatabaseStats {
  name: string
  collections: CollectionStats[]
  stats: {
    db: string
    collections: number
    views: number
    objects: number
    avgObjSize: number
    dataSize: number
    storageSize: number
    indexes: number
    indexSize: number
  }
}

export default function DatabasePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dbStats, setDbStats] = useState<DatabaseStats | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchDatabaseStats = async () => {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/database/stats")

        if (!response.ok) {
          throw new Error(`Erro ao buscar estatísticas do banco de dados: ${response.status}`)
        }

        const data = await response.json()

        if (data.status === "success") {
          setDbStats(data.data)
        } else {
          throw new Error(data.message || "Erro ao buscar estatísticas do banco de dados")
        }
      } catch (error) {
        console.error("Erro ao buscar estatísticas do banco de dados:", error)
        setError((error as Error).message || "Não foi possível carregar as estatísticas do banco de dados")
      } finally {
        setIsLoading(false)
      }
    }

    fetchDatabaseStats()
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

  if (isLoading && !dbStats) {
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
        <h2 className="text-3xl font-bold tracking-tight">Banco de Dados</h2>
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
            <CardTitle className="text-sm font-medium">Coleções</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats?.stats.collections || 0}</div>
            <p className="text-xs text-muted-foreground">{dbStats?.stats.views || 0} views</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats?.stats.objects?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Tamanho médio: {formatBytes(dbStats?.stats.avgObjSize || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tamanho dos Dados</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatBytes(dbStats?.stats.dataSize || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Armazenamento: {formatBytes(dbStats?.stats.storageSize || 0)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Índices</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dbStats?.stats.indexes || 0}</div>
            <p className="text-xs text-muted-foreground">Tamanho: {formatBytes(dbStats?.stats.indexSize || 0)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Estatísticas das Coleções</CardTitle>
          <CardDescription>Detalhes de todas as coleções no banco de dados {dbStats?.name || ""}</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Tamanho</TableHead>
                <TableHead>Tamanho Médio</TableHead>
                <TableHead>Armazenamento</TableHead>
                <TableHead>Índices</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dbStats?.collections.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    Nenhuma coleção encontrada
                  </TableCell>
                </TableRow>
              ) : (
                dbStats?.collections.map((collection) => (
                  <TableRow key={collection.name}>
                    <TableCell className="font-medium">{collection.name}</TableCell>
                    <TableCell>{collection.count.toLocaleString()}</TableCell>
                    <TableCell>{formatBytes(collection.size)}</TableCell>
                    <TableCell>{formatBytes(collection.avgObjSize)}</TableCell>
                    <TableCell>{formatBytes(collection.storageSize)}</TableCell>
                    <TableCell>{collection.indexes}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Utilização de Espaço</CardTitle>
          <CardDescription>Distribuição do espaço de armazenamento por coleção</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dbStats?.collections.slice(0, 5).map((collection) => {
              const percentage =
                dbStats.stats.storageSize > 0 ? (collection.storageSize / dbStats.stats.storageSize) * 100 : 0

              return (
                <div key={collection.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{collection.name}</span>
                    <span className="text-sm font-medium">
                      {formatBytes(collection.storageSize)} ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

