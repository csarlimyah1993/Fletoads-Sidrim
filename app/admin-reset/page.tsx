"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function AdminResetPage() {
  const [secretKey, setSecretKey] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    credentials?: { email: string; password: string }
  } | null>(null)

  const handleReset = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/reset-admin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ secretKey }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Erro ao redefinir senha do admin:", error)
      setResult({
        success: false,
        message: "Ocorreu um erro ao tentar redefinir a senha do admin.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Redefinir Senha do Admin</CardTitle>
          <CardDescription>Use esta página para redefinir a senha do administrador</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="secretKey" className="text-sm font-medium">
              Chave Secreta
            </label>
            <Input
              id="secretKey"
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              placeholder="Digite a chave secreta"
            />
            <p className="text-xs text-gray-500">
              A chave secreta padrão é &quot;fletoads_admin_reset&quot; se não for definida no ambiente.
            </p>
          </div>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <AlertDescription>
                {result.message}
                {result.success && result.credentials && (
                  <div className="mt-2 p-2 bg-gray-100 rounded">
                    <p>
                      <strong>Email:</strong> {result.credentials.email}
                    </p>
                    <p>
                      <strong>Senha:</strong> {result.credentials.password}
                    </p>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button onClick={handleReset} disabled={isLoading} className="w-full">
            {isLoading ? "Redefinindo..." : "Redefinir Senha do Admin"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

