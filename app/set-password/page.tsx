"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function SetPasswordPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success?: boolean
    message?: string
    error?: string
    warning?: string
    details?: any
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/set-password-direct", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          plainPassword: password,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: data.success,
          message: data.message,
          warning: data.warning,
          details: {
            plainPassword: data.plainPassword,
            hashedPassword: data.hashedPassword,
            matchedCount: data.matchedCount,
            modifiedCount: data.modifiedCount,
          },
        })
      } else {
        setResult({
          success: false,
          error: data.error || "Erro ao definir senha",
        })
      }
    } catch (error) {
      setResult({
        success: false,
        error: "Erro ao processar a solicitação: " + (error as Error).message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Definir Senha</CardTitle>
          <CardDescription>
            Use esta ferramenta para definir uma senha em texto plano para um usuário existente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {result?.success && (
              <Alert className="bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-900">
                <AlertDescription className="text-green-800 dark:text-green-300">
                  {result.message}
                  {result.details && (
                    <div className="mt-2 text-xs">
                      <p>Senha em texto plano: {result.details.plainPassword}</p>
                      <p>Hash gerado: {result.details.hashedPassword}</p>
                      <p>Documentos encontrados: {result.details.matchedCount}</p>
                      <p>Documentos modificados: {result.details.modifiedCount}</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
            {result?.warning && (
              <Alert className="bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-900">
                <AlertDescription className="text-yellow-800 dark:text-yellow-300">{result.warning}</AlertDescription>
              </Alert>
            )}
            {result?.error && (
              <Alert variant="destructive">
                <AlertDescription>{result.error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="usuario@exemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nova Senha (texto plano)</Label>
              <Input
                id="password"
                type="text"
                placeholder="Digite a nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Processando..." : "Definir Senha"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            Após definir a senha, você poderá fazer login com as novas credenciais.
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

