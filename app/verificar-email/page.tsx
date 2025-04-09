"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Mail, CheckCircle, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function VerificarEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [verificando, setVerificando] = useState(false)
  const [verificado, setVerificado] = useState(false)
  const [erro, setErro] = useState("")

  const token = searchParams.get("token")

  useEffect(() => {
    if (token) {
      verificarToken(token)
    }
  }, [token])

  const verificarToken = async (token: string) => {
    try {
      setVerificando(true)
      setErro("")

      const response = await fetch(`/api/auth/verificar-email?token=${token}`)
      const data = await response.json()

      if (response.ok) {
        setVerificado(true)
        toast({
          title: "Sucesso",
          description: "Seu email foi verificado com sucesso!",
        })

        // Redirecionar para login após 3 segundos
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        setErro(data.error || "Token inválido ou expirado")
        toast({
          title: "Erro",
          description: data.error || "Não foi possível verificar seu email",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao verificar token:", error)
      setErro("Ocorreu um erro ao verificar seu email")
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao verificar seu email",
        variant: "destructive",
      })
    } finally {
      setVerificando(false)
    }
  }

  const enviarEmailVerificacao = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast({
        title: "Erro",
        description: "Por favor, insira um email válido",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const response = await fetch("/api/auth/verificar-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Sucesso",
          description: "Email de verificação enviado com sucesso!",
        })
        setEmail("")
      } else {
        toast({
          title: "Erro",
          description: data.error || "Não foi possível enviar o email de verificação",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erro ao enviar email de verificação:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao enviar o email de verificação",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Verificação de Email</CardTitle>
          <CardDescription className="text-center">
            {token ? "Estamos verificando seu email..." : "Insira seu email para receber um link de verificação"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {token ? (
            <div className="flex flex-col items-center justify-center py-6">
              {verificando ? (
                <div className="flex flex-col items-center space-y-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  <p className="text-center text-sm text-muted-foreground">Verificando seu email...</p>
                </div>
              ) : verificado ? (
                <div className="flex flex-col items-center space-y-4">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                  <div className="text-center">
                    <p className="font-medium">Email verificado com sucesso!</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Você será redirecionado para a página de login em instantes...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <AlertCircle className="h-16 w-16 text-red-500" />
                  <div className="text-center">
                    <p className="font-medium text-red-500">{erro}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Por favor, solicite um novo link de verificação.
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={enviarEmailVerificacao} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    id="email"
                    placeholder="seu@email.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-10"
                  />
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Enviando..." : "Enviar link de verificação"}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-muted-foreground w-full">
            Já tem uma conta?{" "}
            <a href="/login" className="text-primary hover:underline">
              Faça login
            </a>
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}

