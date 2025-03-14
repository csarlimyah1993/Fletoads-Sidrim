"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CadastroContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Dados do formulário
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Aqui você implementaria a lógica para enviar os dados para o backend
    // Por enquanto, apenas avançamos para o próximo passo
    setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Lado esquerdo - Formulário */}
      <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col">
        <button
          onClick={handleBack}
          className="flex items-center text-gray-700 mb-8 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          <span>Voltar</span>
        </button>

        <div className="max-w-md mx-auto w-full">
          <h1 className="text-2xl font-bold mb-8">1. Informe Seus Dados</h1>

          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div>
                <label htmlFor="nome" className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Lojista
                </label>
                <div className="relative">
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Seu nome..."
                    value={formData.nome}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Seu email..."
                    value={formData.email}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="senha" className="block text-sm font-medium text-gray-700 mb-1">
                    Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="senha"
                      name="senha"
                      type={showPassword ? "text" : "password"}
                      placeholder="Sua senha..."
                      value={formData.senha}
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

                <div>
                  <label htmlFor="confirmarSenha" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirmar Senha
                  </label>
                  <div className="relative">
                    <Input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Sua senha..."
                      value={formData.confirmarSenha}
                      onChange={handleChange}
                      className="pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="h-2 w-8 rounded-full bg-blue-600"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                </div>
              </div>

              <Button type="submit" className="w-full">
                Confirmar Dados
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Lado direito - Mapa */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-100 to-blue-400 relative overflow-hidden">
        {/* Pontos no mapa */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-blue-500"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: 0.7,
            }}
          />
        ))}

        {/* Linhas de grade do mapa */}
        <div className="absolute inset-0 grid grid-cols-8 grid-rows-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`v-${i}`} className="border-r border-blue-200 h-full" />
          ))}
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={`h-${i}`} className="border-b border-blue-200 w-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

