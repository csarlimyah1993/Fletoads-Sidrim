"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Search, Save, Shield, Key, Lock, UserX } from "lucide-react"

interface SecurityConfig {
  senhaMinLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutDuration: number
}

interface SecurityLog {
  _id: string
  tipo: string
  usuario: string
  ip: string
  detalhes: string
  timestamp: string
}

export default function SegurancaPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [config, setConfig] = useState<SecurityConfig>({
    senhaMinLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
  })
  const [logs, setLogs] = useState<SecurityLog[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    async function fetchSecurityData() {
      try {
        setIsLoading(true)
        setError(null)

        const response = await fetch("/api/admin/seguranca")

        if (!response.ok) {
          throw new Error(`Erro ao buscar dados de segurança: ${response.status}`)
        }

        const data = await response.json()
        setConfig(data.config || config)
        setLogs(data.logs || [])
      } catch (err) {
        console.error("Erro ao buscar dados de segurança:", err)
        setError(err instanceof Error ? err.message : "Erro desconhecido ao buscar dados de segurança")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecurityData()
  }, [])

  const filteredLogs = logs.filter(
    (log) =>
      log.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.usuario.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.detalhes.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Formatar data e hora
  const formatarDataHora = (dataString: string) => {
    const data = new Date(dataString)
    return data.toLocaleString("pt-BR")
  }

  // Ícone para o tipo de log
  const getLogIcon = (tipo: string) => {
    switch (tipo) {
      case "login":
        return <Shield className="h-5 w-5 text-green-600" />
      case "login_failed":
        return <UserX className="h-5 w-5 text-red-600" />
      case "password_reset":
        return <Key className="h-5 w-5 text-blue-600" />
      case "account_locked":
        return <Lock className="h-5 w-5 text-orange-600" />
      default:
        return <Shield className="h-5 w-5 text-muted-foreground" />
    }
  }

  // Salvar configurações
  const handleSaveConfig = async () => {
    setIsSaving(true)
    try {
      // Aqui você implementaria a chamada de API para salvar as configurações
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulação de chamada de API
      // Exibir mensagem de sucesso
      alert("Configurações salvas com sucesso!")
    } catch (err) {
      console.error("Erro ao salvar configurações:", err)
      alert("Erro ao salvar configurações")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Segurança</h1>
      </div>

      <Tabs defaultValue="configuracoes">
        <TabsList>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
          <TabsTrigger value="logs">Logs de Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="configuracoes" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Política de Senhas</CardTitle>
              <CardDescription>Configure os requisitos para senhas de usuários</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="senhaMinLength">Comprimento mínimo da senha: {config.senhaMinLength} caracteres</Label>
                <Slider
                  id="senhaMinLength"
                  min={6}
                  max={16}
                  step={1}
                  value={[config.senhaMinLength]}
                  onValueChange={(value) => setConfig({ ...config, senhaMinLength: value[0] })}
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="requireUppercase">Exigir letras maiúsculas</Label>
                  <Switch
                    id="requireUppercase"
                    checked={config.requireUppercase}
                    onCheckedChange={(checked) => setConfig({ ...config, requireUppercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireLowercase">Exigir letras minúsculas</Label>
                  <Switch
                    id="requireLowercase"
                    checked={config.requireLowercase}
                    onCheckedChange={(checked) => setConfig({ ...config, requireLowercase: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireNumbers">Exigir números</Label>
                  <Switch
                    id="requireNumbers"
                    checked={config.requireNumbers}
                    onCheckedChange={(checked) => setConfig({ ...config, requireNumbers: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="requireSpecialChars">Exigir caracteres especiais</Label>
                  <Switch
                    id="requireSpecialChars"
                    checked={config.requireSpecialChars}
                    onCheckedChange={(checked) => setConfig({ ...config, requireSpecialChars: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Configurações de Sessão</CardTitle>
              <CardDescription>Configure as políticas de sessão e bloqueio de conta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Tempo limite de sessão: {config.sessionTimeout} minutos</Label>
                <Slider
                  id="sessionTimeout"
                  min={5}
                  max={120}
                  step={5}
                  value={[config.sessionTimeout]}
                  onValueChange={(value) => setConfig({ ...config, sessionTimeout: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxLoginAttempts">Máximo de tentativas de login: {config.maxLoginAttempts}</Label>
                <Slider
                  id="maxLoginAttempts"
                  min={3}
                  max={10}
                  step={1}
                  value={[config.maxLoginAttempts]}
                  onValueChange={(value) => setConfig({ ...config, maxLoginAttempts: value[0] })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">
                  Duração do bloqueio após tentativas falhas: {config.lockoutDuration} minutos
                </Label>
                <Slider
                  id="lockoutDuration"
                  min={5}
                  max={60}
                  step={5}
                  value={[config.lockoutDuration]}
                  onValueChange={(value) => setConfig({ ...config, lockoutDuration: value[0] })}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSaveConfig} disabled={isSaving} className="flex items-center gap-2">
              <Save className="h-4 w-4" />
              {isSaving ? "Salvando..." : "Salvar configurações"}
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Segurança</CardTitle>
              <CardDescription>Visualize os eventos de segurança do sistema</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar logs..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : error ? (
                <div className="bg-destructive/10 text-destructive p-4 rounded-md">{error}</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-medium">Tipo</th>
                        <th className="text-left py-3 px-4 font-medium">Usuário</th>
                        <th className="text-left py-3 px-4 font-medium">IP</th>
                        <th className="text-left py-3 px-4 font-medium">Detalhes</th>
                        <th className="text-left py-3 px-4 font-medium">Data/Hora</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLogs.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-8 text-muted-foreground">
                            Nenhum log encontrado
                          </td>
                        </tr>
                      ) : (
                        filteredLogs.map((log) => (
                          <tr key={log._id} className="border-b hover:bg-muted/50">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {getLogIcon(log.tipo)}
                                <span
                                  className={`capitalize ${
                                    log.tipo === "login"
                                      ? "text-green-600"
                                      : log.tipo === "login_failed" || log.tipo === "account_locked"
                                        ? "text-red-600"
                                        : "text-blue-600"
                                  }`}
                                >
                                  {log.tipo.replace("_", " ")}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">{log.usuario}</td>
                            <td className="py-3 px-4">{log.ip}</td>
                            <td className="py-3 px-4">{log.detalhes}</td>
                            <td className="py-3 px-4">{formatarDataHora(log.timestamp)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
