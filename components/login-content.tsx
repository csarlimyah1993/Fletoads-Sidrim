"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, User, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { mockUsers } from "@/lib/mockdata"

export function LoginContent() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginSuccess, setLoginSuccess] = useState(false)

  useEffect(() => {
    // Se o login for bem-sucedido, redireciona após um breve delay
    if (loginSuccess) {
      const timer = setTimeout(() => {
        window.location.href = "/"
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [loginSuccess])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpa o erro quando o usuário começa a digitar novamente
    if (error) setError("")
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Tentando fazer login com:", formData.email)
    setIsLoading(true)
    setError("")

    // Simula um delay de autenticação
    setTimeout(() => {
      // Verifica se as credenciais correspondem a algum usuário mock
      const user = mockUsers.find((user) => user.email === formData.email && user.password === formData.password)

      if (user) {
        // Simula o armazenamento do usuário na sessão
        localStorage.setItem("currentUser", JSON.stringify(user))
        console.log("Login bem-sucedido, redirecionando...")

        // Marca o login como bem-sucedido para acionar o useEffect
        setLoginSuccess(true)
      } else {
        setError("Email ou senha inválidos. Tente novamente.")
        setIsLoading(false)
      }
    }, 1000)
  }

  // Função para preencher automaticamente as credenciais de demo
  const fillDemoCredentials = () => {
    setFormData({
      email: "demo@fletoads.com",
      password: "demo123",
    })
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Background com laptop */}
      <div className="hidden md:flex md:w-1/2 bg-[#14213D] items-center justify-center p-8 relative overflow-hidden">
        {/* Elementos flutuantes decorativos */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-12 h-12 bg-blue-500/10 rounded-lg"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animation: `float ${Math.random() * 10 + 5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 5}s`,
            }}
          />
        ))}

        <div className="relative z-10 text-center">
          <Image
            src="/placeholder.svg?height=40&width=120"
            alt="Fletoads"
            width={120}
            height={40}
            className="mx-auto mb-4"
          />
          <h1 className="text-white text-2xl font-medium mb-2">Seja Bem-Vindo(a) ao Fletoads</h1>
          <p className="text-gray-300">Faça o login e tenha acesso à sua conta lojista!</p>

          {/* Imagem do laptop */}
          <div className="mt-8 relative">
            <Image
              src="/placeholder.svg?height=300&width=400"
              alt="Dashboard Preview"
              width={400}
              height={300}
              className="mx-auto"
            />
          </div>
        </div>
      </div>

      {/* Lado direito - Formulário de login */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Image
              src="/placeholder.svg?height=40&width=120"
              alt="Fletoads"
              width={120}
              height={40}
              className="mx-auto"
            />
            <h2 className="mt-6 text-2xl font-bold">Acesse sua conta</h2>
            <p className="mt-2 text-sm text-muted-foreground">Entre com suas credenciais para acessar o painel</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loginSuccess && (
            <Alert className="mb-4 bg-green-50 text-green-800 border-green-200">
              <AlertDescription>Login bem-sucedido! Redirecionando...</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <div className="relative">
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  required
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Senha"
                  value={formData.password}
                  onChange={handleChange}
                  className="pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full bg-[#2B6CB0]" disabled={isLoading || loginSuccess}>
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>

            <div className="text-center">
              <a href="#" className="text-sm text-gray-600 hover:text-gray-800 transition-colors">
                Esqueceu sua senha?
              </a>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground text-center mb-2">Credenciais de demonstração:</p>
              <div className="grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                <div className="text-center">
                  <p>
                    <strong>Email:</strong> demo@fletoads.com
                  </p>
                  <p>
                    <strong>Senha:</strong> demo123
                  </p>
                  <Button type="button" variant="outline" size="sm" className="mt-2" onClick={fillDemoCredentials}>
                    Preencher automaticamente
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

