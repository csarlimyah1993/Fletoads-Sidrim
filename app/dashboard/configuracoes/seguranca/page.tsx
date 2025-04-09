"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, ShieldCheck, AlertTriangle } from "lucide-react"
import Image from "next/image"

export default function SegurancaPage() {
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorSetupData, setTwoFactorSetupData] = useState<{
    qrCodeUrl: string
    secret: string
  } | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [isLoadingStatus, setIsLoadingStatus] = useState(true)

  // Verificar status atual da autenticação de dois fatores
  useEffect(() => {
    const checkTwoFactorStatus = async () => {
      try {
        const response = await fetch("/api/auth/two-factor/status")
        const data = await response.json()

        if (response.ok) {
          setTwoFactorEnabled(data.enabled)
        }
      } catch (error) {
        console.error("Erro ao verificar status da autenticação de dois fatores:", error)
      } finally {
        setIsLoadingStatus(false)
      }
    }

    checkTwoFactorStatus()
  }, [])

  // Configurar autenticação de dois fatores
  const setupTwoFactor = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/two-factor/setup", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao configurar autenticação de dois fatores")
      }

      setTwoFactorSetupData({
        qrCodeUrl: data.qrCodeUrl,
        secret: data.secret,
      })
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao configurar autenticação de dois fatores")
    } finally {
      setIsLoading(false)
    }
  }

  // Verificar código e ativar autenticação de dois fatores
  const verifyAndEnableTwoFactor = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError("Código de verificação inválido")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/auth/two-factor/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: verificationCode,
          secret: twoFactorSetupData?.secret,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Código de verificação inválido")
      }

      setTwoFactorEnabled(true)
      setSuccess("Autenticação de dois fatores ativada com sucesso!")
      setBackupCodes(data.backupCodes || [])
      setTwoFactorSetupData(null)
      setVerificationCode("")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao verificar código")
    } finally {
      setIsLoading(false)
    }
  }

  // Desativar autenticação de dois fatores
  const disableTwoFactor = async () => {
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/two-factor/disable", {
        method: "POST",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao desativar autenticação de dois fatores")
      }

      setTwoFactorEnabled(false)
      setSuccess("Autenticação de dois fatores desativada com sucesso!")
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao desativar autenticação de dois fatores")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Segurança da Conta</h2>
      </div>

      <Tabs defaultValue="two-factor" className="space-y-4">
        <TabsList>
          <TabsTrigger value="two-factor">Autenticação de Dois Fatores</TabsTrigger>
          <TabsTrigger value="senha">Alterar Senha</TabsTrigger>
        </TabsList>

        <TabsContent value="two-factor" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-2xl">Autenticação de Dois Fatores</CardTitle>
                <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
              </div>
              <ShieldCheck className="h-8 w-8 text-green-500" />
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoadingStatus ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : twoFactorEnabled ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                      <ShieldCheck className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">Autenticação de dois fatores está ativada</p>
                      <p className="text-sm text-muted-foreground">
                        Sua conta está protegida com autenticação de dois fatores
                      </p>
                    </div>
                  </div>

                  <Button variant="destructive" onClick={disableTwoFactor} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Desativando...
                      </>
                    ) : (
                      "Desativar Autenticação de Dois Fatores"
                    )}
                  </Button>
                </div>
              ) : twoFactorSetupData ? (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Escaneie o código QR</h3>
                    <p className="text-sm text-muted-foreground">
                      Use um aplicativo autenticador como Google Authenticator, Authy ou Microsoft Authenticator para
                      escanear o código QR abaixo.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="bg-white p-4 rounded-lg">
                      <Image
                        src={twoFactorSetupData.qrCodeUrl || "/placeholder.svg"}
                        alt="QR Code para autenticação de dois fatores"
                        width={200}
                        height={200}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Ou insira este código manualmente</h3>
                    <p className="text-sm text-muted-foreground">
                      Se não conseguir escanear o código QR, insira este código no seu aplicativo autenticador:
                    </p>
                    <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md font-mono text-center">
                      {twoFactorSetupData.secret}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="verification-code">Código de verificação</Label>
                    <Input
                      id="verification-code"
                      placeholder="Digite o código de 6 dígitos"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      maxLength={6}
                    />
                    <p className="text-xs text-muted-foreground">
                      Digite o código de 6 dígitos gerado pelo seu aplicativo autenticador
                    </p>
                  </div>

                  <div className="flex space-x-2">
                    <Button onClick={verifyAndEnableTwoFactor} disabled={isLoading || verificationCode.length !== 6}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Verificando...
                        </>
                      ) : (
                        "Verificar e Ativar"
                      )}
                    </Button>
                    <Button variant="outline" onClick={() => setTwoFactorSetupData(null)} disabled={isLoading}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <p>
                    A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta, exigindo não
                    apenas uma senha, mas também um código gerado por um aplicativo autenticador.
                  </p>

                  <div className="flex items-center space-x-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                      <AlertTriangle className="h-6 w-6 text-amber-600" />
                    </div>
                    <div>
                      <p className="font-medium">Autenticação de dois fatores está desativada</p>
                      <p className="text-sm text-muted-foreground">Recomendamos ativar para maior segurança</p>
                    </div>
                  </div>

                  <Button onClick={setupTwoFactor} disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Configurando...
                      </>
                    ) : (
                      "Configurar Autenticação de Dois Fatores"
                    )}
                  </Button>
                </div>
              )}

              {backupCodes.length > 0 && (
                <div className="mt-6 space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Códigos de backup</h3>
                    <p className="text-sm text-muted-foreground">
                      Guarde estes códigos em um lugar seguro. Você pode usá-los para acessar sua conta caso perca
                      acesso ao seu aplicativo autenticador.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {backupCodes.map((code, index) => (
                      <div key={index} className="bg-gray-100 dark:bg-gray-800 p-2 rounded-md font-mono text-center">
                        {code}
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" onClick={() => setBackupCodes([])}>
                    Entendi, guardei os códigos
                  </Button>
                </div>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="senha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Alterar Senha</CardTitle>
              <CardDescription>Atualize sua senha para manter sua conta segura</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Senha Atual</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova Senha</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar Nova Senha</Label>
                <Input id="confirm-password" type="password" />
              </div>
            </CardContent>
            <CardFooter>
              <Button>Alterar Senha</Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

