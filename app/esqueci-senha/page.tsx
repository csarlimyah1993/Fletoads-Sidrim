"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { OtpInput } from "@/components/ui/otp-input"
import Link from "next/link"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showOtpForm, setShowOtpForm] = useState(false)
  const [otpCode, setOtpCode] = useState("")
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [resetToken, setResetToken] = useState("")

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/solicitar-reset-senha", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Se o email estiver cadastrado, um código de verificação será enviado para sua caixa de entrada.",
        })
        setShowOtpForm(true)
      } else {
        setMessage({
          type: "error",
          text: data.error || "Ocorreu um erro ao processar sua solicitação.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ocorreu um erro ao processar sua solicitação.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/verificar-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otpCode }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Código verificado com sucesso. Defina sua nova senha.",
        })
        setShowPasswordForm(true)
        setResetToken(data.token)
      } else {
        setMessage({
          type: "error",
          text: data.error || "Código inválido ou expirado.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ocorreu um erro ao verificar o código.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      setMessage({
        type: "error",
        text: "As senhas não coincidem.",
      })
      return
    }

    if (newPassword.length < 6) {
      setMessage({
        type: "error",
        text: "A senha deve ter pelo menos 6 caracteres.",
      })
      return
    }

    setIsLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token: resetToken, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Senha redefinida com sucesso! Você já pode fazer login com sua nova senha.",
        })
        // Limpar formulários
        setShowOtpForm(false)
        setShowPasswordForm(false)
      } else {
        setMessage({
          type: "error",
          text: data.error || "Ocorreu um erro ao redefinir sua senha.",
        })
      }
    } catch (error) {
      setMessage({
        type: "error",
        text: "Ocorreu um erro ao redefinir sua senha.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Recuperação de Senha</CardTitle>
          <CardDescription>
            {!showOtpForm
              ? "Informe seu email para receber um código de verificação."
              : !showPasswordForm
                ? "Digite o código de verificação enviado para seu email."
                : "Digite sua nova senha."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showOtpForm ? (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Enviando..." : "Enviar código de verificação"}
              </Button>
            </form>
          ) : !showPasswordForm ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otpCode">Código de verificação</Label>
                <OtpInput
                  value={otpCode}
                  onChange={setOtpCode}
                  length={6}
                  disabled={isLoading}
                  className="justify-center"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Verifique sua caixa de entrada e digite o código de 6 dígitos que enviamos para {email}
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading || otpCode.length !== 6}>
                {isLoading ? "Verificando..." : "Verificar código"}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Redefinindo..." : "Redefinir senha"}
              </Button>
            </form>
          )}

          {message && (
            <Alert variant={message.type === "error" ? "destructive" : "default"} className="mt-4">
              <AlertDescription>{message.text}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/login" className="text-sm text-blue-600 hover:underline">
            Voltar para o login
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
