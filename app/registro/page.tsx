"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FcGoogle } from "react-icons/fc"
import { signIn } from "next-auth/react"
import { Loader2, Calendar, User, Mail, Phone, Lock, Eye, EyeOff, FileText, AlertCircle } from "lucide-react"

interface EventoAtivo {
  _id: string
  nome: string
  descricao?: string
  imagem?: string
}

export default function RegistroPage() {
  const [nome, setNome] = useState("")
  const [email, setEmail] = useState("")
  const [telefone, setTelefone] = useState("")
  const [cpf, setCpf] = useState("")
  const [password, setPassword] = useState("")
  const [confirmarSenha, setConfirmarSenha] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [eventoAtivo, setEventoAtivo] = useState<EventoAtivo | null>(null)
  const [loadingEvento, setLoadingEvento] = useState(true)
  const router = useRouter()

  // Buscar evento ativo
  useEffect(() => {
    const fetchEventoAtivo = async () => {
      try {
        const response = await fetch("/api/eventos/ativo")
        if (!response.ok) throw new Error("Falha ao buscar evento ativo")

        const data = await response.json()
        setEventoAtivo(data.eventoAtivo)
      } catch (error) {
        console.error("Erro ao buscar evento ativo:", error)
      } finally {
        setLoadingEvento(false)
      }
    }

    fetchEventoAtivo()
  }, [])

  const formatarCPF = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 3) return apenasNumeros
    if (apenasNumeros.length <= 6) return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`
    if (apenasNumeros.length <= 9)
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`
    return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`
  }

  const formatarTelefone = (valor: string) => {
    const apenasNumeros = valor.replace(/\D/g, "")
    if (apenasNumeros.length <= 2) return apenasNumeros
    if (apenasNumeros.length <= 6) return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`
    return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`
  }

  const handleCPFChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatarCPF(e.target.value))
  }

  const handleTelefoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTelefone(formatarTelefone(e.target.value))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validações
    if (password !== confirmarSenha) {
      setError("As senhas não coincidem")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome,
          email,
          password,
          cpf: cpf.replace(/\D/g, ""),
          telefone: telefone.replace(/\D/g, ""),
          eventoId: eventoAtivo?._id,
          eventoNome: eventoAtivo?.nome,
          tipoUsuario: "visitante", // Definir tipo de usuário como visitante
          role: "visitante", // Garantir que o role também seja definido como visitante
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Erro ao registrar usuário")
      }

      setSuccess(true)

      // Fazer login automático
      const loginResult = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (loginResult?.error) {
        throw new Error(loginResult.error)
      }

      // Redirecionar para vitrines após login bem-sucedido
      setTimeout(() => {
        router.push("/vitrines")
      }, 1500)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Erro ao registrar usuário")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setGoogleLoading(true)
      await signIn("google", { callbackUrl: "/vitrines" })
    } catch (error) {
      console.error("Erro ao registrar com Google:", error)
      setError("Erro ao registrar com Google")
      setGoogleLoading(false)
    }
  }

  // Se o cadastro foi bem-sucedido, mostrar mensagem de sucesso
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-green-600 dark:text-green-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Cadastro Realizado!</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {eventoAtivo
              ? `Sua conta foi criada com sucesso. Você será redirecionado para as vitrines do evento ${eventoAtivo.nome}.`
              : "Sua conta foi criada com sucesso. Você será redirecionado para as vitrines."}
          </p>
          <div className="animate-pulse">
            <Loader2 className="h-6 w-6 mx-auto text-primary" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Coluna esquerda - Imagem/Gradiente */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-fleto-primary via-fleto-dark to-fleto-secondary relative overflow-hidden">
        {eventoAtivo?.imagem ? (
          <>
            <Image
              src={eventoAtivo.imagem || "/placeholder.svg"}
              alt={eventoAtivo.nome}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-br from-fleto-primary/70 via-fleto-dark/70 to-fleto-secondary/70" />
          </>
        ) : null}

        <div className="relative z-10 max-w-md mx-auto flex flex-col justify-center h-full p-12 text-white">
          {eventoAtivo ? (
            <>
              <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full mb-4 backdrop-blur-sm">
                <Calendar className="h-4 w-4" />
                <span className="text-sm font-medium">Evento Ativo</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">{eventoAtivo.nome}</h1>
              {eventoAtivo.descricao && <p className="text-lg opacity-90 mb-8">{eventoAtivo.descricao}</p>}
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <p className="italic text-white/90">
                  "Registre-se para participar do evento e ter acesso a todas as lojas e produtos exclusivos."
                </p>
                <p className="mt-4 font-semibold">— Equipe FletoAds</p>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-4xl font-bold mb-6">Bem-vindo ao FletoAds</h1>
              <p className="text-lg opacity-90 mb-8">
                Registre-se como visitante para acessar vitrines e eventos exclusivos.
              </p>
              <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
                <p className="italic text-white/90">
                  "Como visitante, você terá acesso a todas as vitrines e poderá explorar produtos e serviços
                  exclusivos."
                </p>
                <p className="mt-4 font-semibold">— Equipe FletoAds</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Coluna direita - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image src="/assets/logoFleto.svg" alt="FletoAds Logo" width={180} height={60} priority />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {eventoAtivo ? `Registre-se para ${eventoAtivo.nome}` : "Crie sua conta de visitante"}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {eventoAtivo
                ? "Preencha seus dados para participar do evento"
                : "Preencha seus dados para acessar as vitrines como visitante"}
            </p>

            {/* Aviso para lojistas */}
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700 dark:text-blue-300 text-left">
                É um lojista?{" "}
                <Link href="/cadastro" className="font-medium underline">
                  Clique aqui
                </Link>{" "}
                para criar uma conta de lojista e gerenciar sua vitrine.
              </p>
            </div>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="nome" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nome completo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nome"
                  name="nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  required
                  className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Seu nome completo"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  CPF
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="cpf"
                    name="cpf"
                    value={cpf}
                    onChange={handleCPFChange}
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="telefone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Telefone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="telefone"
                    name="telefone"
                    value={telefone}
                    onChange={handleTelefoneChange}
                    required
                    className="w-full pl-10 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="(00) 00000-0000"
                    maxLength={15}
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">A senha deve ter pelo menos 6 caracteres</p>
            </div>

            <div>
              <label
                htmlFor="confirmarSenha"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Confirmar senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmarSenha"
                  name="confirmarSenha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-fleto-primary to-fleto-dark hover:from-fleto-dark hover:to-fleto-primary text-white font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fleto-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Registrando...
                </span>
              ) : (
                "Registrar como Visitante"
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">Ou continue com</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleSignup}
              disabled={googleLoading}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary disabled:opacity-50"
            >
              <FcGoogle className="h-5 w-5" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Google</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Já tem uma conta?{" "}
              <Link href="/login" className="text-fleto-primary dark:text-fleto-secondary font-medium hover:underline">
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
