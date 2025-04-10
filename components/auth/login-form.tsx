"use client"

import type React from "react"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setDebugInfo(null)

    try {
      console.log("Tentando login com:", { email, password })
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      console.log("Resultado do login:", result)

      if (result?.error) {
        setError(`Credenciais inválidas. Por favor, tente novamente. (${result.error})`)

        // Adicionar informações de depuração em desenvolvimento
        if (process.env.NODE_ENV === "development") {
          try {
            const debugResponse = await fetch("/api/debug-auth")
            const debugData = await debugResponse.json()
            setDebugInfo(JSON.stringify(debugData, null, 2))
          } catch (debugError) {
            console.error("Erro ao buscar informações de depuração:", debugError)
          }
        }
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setError("Ocorreu um erro ao fazer login. Por favor, tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>Entre com suas credenciais para acessar o sistema.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/esqueci-senha" className="text-sm text-blue-600 hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {debugInfo && (
          <div className="mt-4 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-40">
            <pre>{debugInfo}</pre>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          Não tem uma conta?{" "}
          <Link href="/registro" className="text-blue-600 hover:underline">
            Registre-se
          </Link>
        </p>
      </CardFooter>
    </Card>
  )
}
