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
import { Loader2, Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

export default function SecuritySettings() {
  const { data: session, update } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showEnableDialog, setShowEnableDialog] = useState(false)
  const [showDisableDialog, setShowDisableDialog] = useState(false)
  const [qrCode, setQrCode] = useState<string | null>(null)
  const [secret, setSecret] = useState<string | null>(null)
  const [verificationCode, setVerificationCode] = useState("")
  const [disableCode, setDisableCode] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [lastLogin, setLastLogin] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSecuritySettings() {
      try {
        const response = await fetch("/api/admin/seguranca")
        if (!response.ok) {
          throw new Error("Falha ao carregar configurações de segurança")
        }

        const data = await response.json()
        setTwoFactorEnabled(data.twoFactorEnabled)
        setLastLogin(data.lastLogin ? new Date(data.lastLogin).toLocaleString() : null)
      } catch (error) {
        console.error("Erro ao carregar configurações:", error)
        toast.error("Erro ao carregar configurações de segurança")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSecuritySettings()
  }, [])

  const handleEnable2FA = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/admin/seguranca", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Falha ao iniciar configuração de 2FA")
      }

      const data = await response.json()
      setQrCode(data.qrCode)
      setSecret(data.secret)
      setShowEnableDialog(true)
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
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token: verificationCode }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Código inválido")
      }

      setTwoFactorEnabled(true)
      setShowEnableDialog(false)
      setVerificationCode("")
      toast.success("Autenticação de dois fatores ativada com sucesso")

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
      const response = await fetch(`/api/admin/seguranca?token=${disableCode}`, {
        method: "DELETE",
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
                <span className="font-medium">Autenticação de dois fatores está ativada</span>
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
              <p>
                A autenticação de dois fatores adiciona uma camada extra de segurança à sua conta. Além da sua senha,
                você precisará fornecer um código de verificação gerado pelo seu aplicativo autenticador.
              </p>
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
            <DialogTitle>Configurar Autenticação de Dois Fatores</DialogTitle>
            <DialogDescription>
              Escaneie o código QR com seu aplicativo autenticador (como Google Authenticator, Microsoft Authenticator
              ou Authy).
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center py-4">
            {qrCode && (
              <div className="mb-4 p-2 bg-white rounded-lg">
                <Image src={qrCode || "/placeholder.svg"} alt="QR Code" width={200} height={200} />
              </div>
            )}
            {secret && (
              <div className="mb-4 text-center">
                <p className="text-sm text-gray-500 mb-1">Se não conseguir escanear o código QR, use este código:</p>
                <code className="bg-gray-100 p-2 rounded text-sm font-mono">{secret}</code>
              </div>
            )}
            <div className="w-full space-y-2">
              <Label htmlFor="verificationCode">Código de Verificação</Label>
              <Input
                id="verificationCode"
                placeholder="Digite o código de 6 dígitos"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
              />
              {error && (
                <Alert variant="destructive" className="mt-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnableDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleVerify2FA} disabled={isLoading || !verificationCode}>
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
            <DialogDescription>Para confirmar, digite o código atual do seu aplicativo autenticador.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="disableCode">Código de Verificação</Label>
            <Input
              id="disableCode"
              placeholder="Digite o código de 6 dígitos"
              value={disableCode}
              onChange={(e) => setDisableCode(e.target.value)}
            />
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableDialog(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDisable2FA} disabled={isLoading || !disableCode}>
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
