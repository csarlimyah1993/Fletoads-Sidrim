"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Shield, ShieldAlert, ShieldCheck, Mail, Smartphone } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import { OTPInput } from "@/components/ui/otp-input"

export default function SecuritySettings() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [twoFactorMethod, setTwoFactorMethod] = useState<"app" | "email">("app")
  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lastLogin, setLastLogin] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"app" | "email">("app")
  const [userEmail, setUserEmail] = useState<string>("")

  useEffect(() => {
    async function fetchSecuritySettings() {
      try {
        const response = await fetch("/api/admin/seguranca")
        if (!response.ok) {
          throw new Error("Falha ao carregar configurações de segurança")
        }

        const data = await response.json()
        setTwoFactorEnabled(data.twoFactorEnabled)
        setTwoFactorMethod(data.twoFactorMethod || "app")
        setLastLogin(data.lastLogin ? new Date(data.lastLogin).toLocaleString() : null)

        // Set user email from session
        if (session?.user?.email) {
          setUserEmail(session.user.email)
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast.error("Erro ao carregar configurações de segurança")
      } finally {
        setIsLoading(false)
      }
    }

    if (session?.user) {
      fetchSecuritySettings()
    }
  }, [session])

  const handleEnable2FA = async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (activeTab === "app") {
        const response = await fetch("/api/admin/seguranca", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "enable2FA",
            method: "app",
          }),
        })

        if (!response.ok) {
          throw new Error("Falha ao iniciar configuração de 2FA")
        }

        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setShowEnableDialog(true)
      } else if (activeTab === "email") {
        const response = await fetch("/api/admin/seguranca", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action: "enable2FAEmail",
            method: "email",
          }),
        })

        if (!response.ok) {
          throw new Error("Falha ao iniciar configuração de 2FA por email")
        }

        const data = await response.json()
        setShowEnableDialog(true)
        toast.success("Código de verificação enviado para seu email")
      }
    } catch (error) {
      console.error("Erro ao configurar 2FA:", error)
      toast.error("Erro ao configurar autenticação de dois fatores")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/seguranca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "verify2FA",
          token: verificationCode,
          method: activeTab,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Código inválido")
      }

      setTwoFactorEnabled(true)
      setTwoFactorMethod(activeTab)
      setShowEnableDialog(false)
      setVerificationCode("")
      toast.success(
        `Autenticação de dois fatores por ${activeTab === "app" ? "aplicativo" : "email"} ativada com sucesso`,
      )

      // Update session
      await update()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/seguranca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "disable2FA",
          token: disableCode,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Código inválido")
      }

      setTwoFactorEnabled(false)
      setShowDisableDialog(false)
      setDisableCode("")
      toast.success("Autenticação de dois fatores desativada com sucesso")

      // Update session
      await update()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const resendEmailCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/seguranca", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "resendEmailCode",
          method: "email",
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Erro ao reenviar código")
      }

      toast.success("Código reenviado para seu email")
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Autenticação de Dois Fatores</CardTitle>
          <CardDescription>Adicione uma camada extra de segurança à sua conta</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            {twoFactorEnabled ? (
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-medium">
                  Autenticação de dois fatores está ativada (
                  {twoFactorMethod === "app" ? "Aplicativo Autenticador" : "Email"})
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-600">
                <ShieldAlert className="h-5 w-5" />
                <span className="font-medium">Autenticação de dois fatores está desativada</span>
              </div>
            )}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            {twoFactorEnabled ? (
              <p>
                Sua conta está protegida com autenticação de dois fatores. Você precisará fornecer um código de
                verificação ao fazer login.
              </p>
            ) : (
              <div className="space-y-4">
                <p>
                  A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta. Além da sua senha,
                  você precisará fornecer um código de verificação.
                </p>

                <div className="border rounded-md p-4">
                  <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "app" | "email")}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="app" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        Aplicativo
                      </TabsTrigger>
                      <TabsTrigger value="email" className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        Email
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="app" className="mt-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Aplicativo Autenticador</h4>
                        <p className="text-sm text-muted-foreground">
                          Use um aplicativo como Google Authenticator, Microsoft Authenticator ou Authy para gerar
                          códigos de verificação.
                        </p>
                      </div>
                    </TabsContent>
                    <TabsContent value="email" className="mt-4">
                      <div className="space-y-2">
                        <h4 className="font-medium">Verificação por Email</h4>
                        <p className="text-sm text-muted-foreground">
                          Receba códigos de verificação no seu email ({userEmail || "seu email"}) quando fizer login.
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          {twoFactorEnabled ? (
            <Button variant="destructive" onClick={() => setShowDisableDialog(true)}>
              Desativar Autenticação de Dois Fatores
            </Button>
          ) : (
            <Button onClick={handleEnable2FA} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <Shield className="mr-2 h-4 w-4" />
                  Ativar Autenticação de Dois Fatores
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
          <CardDescription>Atualize sua senha regularmente para manter sua conta segura</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Uma senha forte deve ter pelo menos 8 caracteres e incluir letras maiúsculas, minúsculas, números e
            caracteres especiais.
          </p>
          <Button>Alterar Senha</Button>
        </CardContent>
      </Card>

      {lastLogin && (
        <Card>
          <CardHeader>
            <CardTitle>Atividade da Conta</CardTitle>
            <CardDescription>Informações sobre a atividade recente da sua conta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="font-medium">Último login:</span> {lastLogin}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Dialog for enabling 2FA */}
      <Dialog open={showEnableDialog} onOpenChange={setShowEnableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {activeTab === "app" ? "Configurar Autenticação por Aplicativo" : "Configurar Autenticação por Email"}
            </DialogTitle>
            <DialogDescription>
              {activeTab === "app"
                ? "Escaneie o código QR com seu aplicativo autenticador (como Google Authenticator, Microsoft Authenticator ou Authy)."
                : "Digite o código de verificação enviado para seu email."}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {activeTab === "app" && qrCode && (
              <div className="mb-4 p-2 bg-white rounded-lg">
                <Image src={qrCode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
              </div>
            )}
            {activeTab === "app" && secret && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Se não conseguir escanear o código QR, use este código:</p>
                <code className="bg-gray-100 p-2 rounded text-sm font-mono">{secret}</code>
              </div>
            )}
            <div className="w-full space-y-2">
              <Label htmlFor="verificationCode">Código de Verificação</Label>
              <OTPInput
                value={verificationCode}
                onChange={setVerificationCode}
                numInputs={6}
                renderInput={(props) => <Input {...props} className="w-12 h-12 text-center mx-1" />}
                containerStyle="flex justify-center gap-2"
              />
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>

            {activeTab === "email" && (
              <Button variant="outline" className="mt-4" onClick={resendEmailCode} disabled={isLoading}>
                Reenviar código
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnableDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleVerify2FA} disabled={isLoading || verificationCode.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                "Verificar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog for disabling 2FA */}
      <Dialog open={showDisableDialog} onOpenChange={setShowDisableDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Desativar Autenticação de Dois Fatores</DialogTitle>
            <DialogDescription>
              {twoFactorMethod === "app"
                ? "Para confirmar, digite o código atual do seu aplicativo autenticador."
                : "Para confirmar, digite o código enviado para seu email."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="disableCode">Código de Verificação</Label>
            <OTPInput
              value={disableCode}
              onChange={setDisableCode}
              numInputs={6}
              renderInput={(props) => <Input {...props} className="w-12 h-12 text-center mx-1" />}
              containerStyle="flex justify-center gap-2"
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {twoFactorMethod === "email" && (
              <Button variant="outline" className="mt-4 w-full" onClick={resendEmailCode} disabled={isLoading}>
                Reenviar código por email
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading || disableCode.length !== 6}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Desativando...
                </>
              ) : (
                "Desativar"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
