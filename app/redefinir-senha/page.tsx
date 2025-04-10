"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"

export default function RedefinirSenhaPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [token, setToken] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tokenParam = searchParams?.get("token")
    if (tokenParam) {
      setToken(tokenParam)
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validar senhas
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
        body: JSON.stringify({ token, newPassword }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({
          type: "success",
          text: "Senha redefinida com sucesso! Você será redirecionado para a página de login.",
        })

        // Redirecionar para o login após alguns segundos
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setMessage({
          type: "error",
          text: data.error || "Ocorreu um erro ao redefinir sua senha.",
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Redefinir senha</CardTitle>
          <CardDescription>Digite sua nova senha para continuar.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            {message && (
              <Alert variant={message.type === "error" ? "destructive" : "default"}>
                <AlertDescription>{message.text}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" className="w-full" disabled={isLoading || !token}>
              {isLoading ? "Redefinindo..." : "Redefinir senha"}
            </Button>
            {!token && (
              <Alert variant="destructive">
                <AlertDescription>
                  Token de redefinição não encontrado. Por favor, solicite um novo link de redefinição.
                </AlertDescription>
              </Alert>
            )}
          </form>
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
