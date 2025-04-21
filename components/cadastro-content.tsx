"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, User, Mail, Eye, EyeOff, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface FormData {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  telefone: string
  aceitaTermos: boolean
}

interface FormErrors {
  nome: string
  email: string
  senha: string
  confirmarSenha: string
  telefone: string
  aceitaTermos: string
}

export function CadastroContent() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [mapPoints, setMapPoints] = useState<Array<{ top: string; left: string }>>([])
  const [emailExiste, setEmailExiste] = useState(false)
  const [cadastroSucesso, setCadastroSucesso] = useState(false)
  const [contadorRedirecionamento, setContadorRedirecionamento] = useState(3)

  // Dados do formulário
  const [formData, setFormData] = useState<FormData>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    aceitaTermos: false,
  })

  const [errors, setErrors] = useState<FormErrors>({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
    telefone: "",
    aceitaTermos: "",
  })

  // Gerar pontos do mapa apenas no lado do cliente para evitar erro de hidratação
  useEffect(() => {
    const points = Array.from({ length: 20 }).map(() => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
    }))
    setMapPoints(points)
  }, [])

  // Contador para redirecionamento após cadastro bem-sucedido
  useEffect(() => {
    if (cadastroSucesso && contadorRedirecionamento > 0) {
      const timer = setTimeout(() => {
        setContadorRedirecionamento(contadorRedirecionamento - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (cadastroSucesso && contadorRedirecionamento === 0) {
      router.push("/login")
    }
  }, [cadastroSucesso, contadorRedirecionamento, router])

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const checkEmailExists = async (email: string) => {
    if (isCheckingEmail || !email) return

    setIsCheckingEmail(true)
    try {
      // Adicionar timestamp para evitar cache
      const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}&t=${Date.now()}`)
      const data = await response.json()

      if (data.exists) {
        setEmailExiste(true)
        setErrors((prev) => ({
          ...prev,
          email: "Este email já está em uso",
        }))
      } else {
        setEmailExiste(false)
        // Limpar erro apenas se o erro atual for sobre email já em uso
        if (errors.email === "Este email já está em uso") {
          setErrors((prev) => ({
            ...prev,
            email: "",
          }))
        }
      }
    } catch (error) {
      console.error("Erro ao verificar email:", error)
    } finally {
      setIsCheckingEmail(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Limpar erro quando o usuário digita
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }

    // Limpar o erro de email existente quando o usuário altera o email
    if (name === "email" && emailExiste) {
      setEmailExiste(false)
    }
  }

  // Verificar email quando o usuário terminar de digitar (após 500ms de inatividade)
  useEffect(() => {
    if (!formData.email || !isValidEmail(formData.email)) return

    const timer = setTimeout(() => {
      checkEmailExists(formData.email)
    }, 500)

    return () => clearTimeout(timer)
  }, [formData.email])

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      aceitaTermos: checked,
    }))

    if (errors.aceitaTermos) {
      setErrors((prev) => ({
        ...prev,
        aceitaTermos: "",
      }))
    }
  }

  const validateForm = () => {
    let isValid = true
    const newErrors = { ...errors }

    // Validar nome
    if (!formData.nome.trim()) {
      newErrors.nome = "Nome é obrigatório"
      isValid = false
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = "Email inválido"
      isValid = false
    }

    // Validar telefone - Agora mais flexível
    if (formData.telefone) {
      // Remove tudo que não é número para verificar o comprimento
      const numerosTelefone = formData.telefone.replace(/\D/g, "")

      // Verifica se tem 10 ou 11 dígitos (com ou sem o 9)
      if (numerosTelefone.length < 10 || numerosTelefone.length > 11) {
        newErrors.telefone = "Telefone deve ter 10 ou 11 dígitos"
        isValid = false
      }
    }

    // Validar senha
    if (formData.senha.length < 6) {
      newErrors.senha = "A senha deve ter pelo menos 6 caracteres"
      isValid = false
    }

    // Validar confirmação de senha
    if (formData.senha !== formData.confirmarSenha) {
      newErrors.confirmarSenha = "As senhas não coincidem"
      isValid = false
    }

    // Validar aceitação dos termos
    if (!formData.aceitaTermos) {
      newErrors.aceitaTermos = "Você deve aceitar os termos e condições"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const formatTelefone = (value: string) => {
    // Remove tudo que não é número
    const numbers = value.replace(/\D/g, "")

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)

    // Aplica a máscara
    if (limitedNumbers.length <= 2) {
      // Apenas DDD
      return limitedNumbers.length ? `(${limitedNumbers}` : ""
    } else if (limitedNumbers.length <= 6) {
      // DDD + início do número
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2)}`
    } else if (limitedNumbers.length <= 10) {
      // Formato (99) 9999-9999 (sem o 9 inicial)
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 6)}-${limitedNumbers.slice(6)}`
    } else {
      // Formato (99) 99999-9999 (com o 9 inicial)
      return `(${limitedNumbers.slice(0, 2)}) ${limitedNumbers.slice(2, 7)}-${limitedNumbers.slice(7)}`
    }
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatTelefone(e.target.value)
    setFormData((prev) => ({
      ...prev,
      telefone: formattedValue,
    }))

    if (errors.telefone) {
      setErrors((prev) => ({
        ...prev,
        telefone: "",
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      // Enviar dados para o backend
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email.toLowerCase().trim(), // Normalizar o email
          password: formData.senha,
          telefone: formData.telefone,
          // tipoUsuario é sempre "lojista" no backend
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 409) {
          setEmailExiste(true)
          setErrors((prev) => ({
            ...prev,
            email: "Este email já está em uso",
          }))
          throw new Error("Este email já está em uso")
        }
        throw new Error(data.error || "Erro ao cadastrar usuário")
      }

      // Cadastro bem-sucedido
      toast.success("Cadastro realizado com sucesso! Redirecionando para o login...")
      setCadastroSucesso(true)
    } catch (error) {
      toast.error((error as Error).message || "Erro ao cadastrar usuário")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
    } else {
      router.push("/")
    }
  }

  // Se o cadastro foi bem-sucedido, mostrar mensagem de sucesso
  if (cadastroSucesso) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-600 mb-6">
            Sua conta foi criada com sucesso. Você será redirecionado para a página de login em{" "}
            {contadorRedirecionamento} segundos.
          </p>
          <Button onClick={() => router.push("/login")} className="w-full">
            Ir para o Login Agora
          </Button>
        </div>
      </div>
    )
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
                  Nome Completo
                </label>
                <div className="relative">
                  <Input
                    id="nome"
                    name="nome"
                    type="text"
                    placeholder="Seu nome completo..."
                    value={formData.nome}
                    onChange={handleChange}
                    className={`pl-10 ${errors.nome ? "border-red-500" : ""}`}
                    required
                  />
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.nome && <p className="text-red-500 text-sm mt-1">{errors.nome}</p>}
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
                    className={`pl-10 ${errors.email || emailExiste ? "border-red-500" : ""}`}
                    required
                  />
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  {isCheckingEmail && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-t-blue-500 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                {!errors.email &&
                  formData.email &&
                  isValidEmail(formData.email) &&
                  !emailExiste &&
                  !isCheckingEmail && <p className="text-green-500 text-sm mt-1">Email disponível</p>}
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <Input
                    id="telefone"
                    name="telefone"
                    type="tel"
                    placeholder="(00) 00000-0000"
                    value={formData.telefone}
                    onChange={handleTelefoneChange}
                    className={`pl-10 ${errors.telefone ? "border-red-500" : ""}`}
                  />
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
                {errors.telefone && <p className="text-red-500 text-sm mt-1">{errors.telefone}</p>}
                <p className="text-xs text-gray-500 mt-1">Formato: (99) 99999-9999 ou (99) 9999-9999</p>
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
                      className={`pr-10 ${errors.senha ? "border-red-500" : ""}`}
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
                  {errors.senha && <p className="text-red-500 text-sm mt-1">{errors.senha}</p>}
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
                      className={`pr-10 ${errors.confirmarSenha ? "border-red-500" : ""}`}
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
                  {errors.confirmarSenha && <p className="text-red-500 text-sm mt-1">{errors.confirmarSenha}</p>}
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox id="aceitaTermos" checked={formData.aceitaTermos} onCheckedChange={handleCheckboxChange} />
                <Label htmlFor="aceitaTermos" className={`text-sm ${errors.aceitaTermos ? "text-red-500" : ""}`}>
                  Eu aceito os{" "}
                  <a href="/termos" className="text-blue-600 hover:underline">
                    termos e condições
                  </a>
                </Label>
              </div>
              {errors.aceitaTermos && <p className="text-red-500 text-sm">{errors.aceitaTermos}</p>}
            </div>

            <div className="mt-16 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex space-x-2">
                  <div className="h-2 w-8 rounded-full bg-blue-600"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                  <div className="h-2 w-2 rounded-full bg-gray-300"></div>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="h-4 w-4 border-2 border-t-white border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin mr-2"></div>
                    Processando...
                  </div>
                ) : (
                  "Confirmar Dados"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Lado direito - Mapa */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-100 to-blue-400 relative overflow-hidden">
        {/* Pontos no mapa - Renderizados apenas no cliente */}
        {mapPoints.map((point, i) => (
          <div
            key={i}
            className="absolute h-2 w-2 rounded-full bg-blue-500"
            style={{
              top: point.top,
              left: point.left,
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
