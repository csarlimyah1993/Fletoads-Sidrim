"use client"

import type React from "react"
import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { FcGoogle } from "react-icons/fc"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Email ou senha inválidos")
        setIsLoading(false)
        return
      }

      // Adicionar um pequeno atraso para garantir que o cookie seja definido
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Redirecionar para o dashboard
      router.push("/dashboard")
    } catch (error) {
      setError("Ocorreu um erro ao fazer login")
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      await signIn("google", { callbackUrl: "/dashboard" })
    } catch (error) {
      setError("Ocorreu um erro ao fazer login com Google")
      setIsLoading(false)
    }
  }

  const handleForgotPassword = () => {
    window.location.href = "/esqueci-senha"
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Coluna esquerda - Imagem/Gradiente */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-fleto-primary via-fleto-dark to-fleto-secondary justify-center items-center p-12">
        <div className="max-w-md text-white">
          <h1 className="text-4xl font-bold mb-6">Bem-vindo ao FletoAds</h1>
          <p className="text-lg opacity-90 mb-8">
            Gerencie suas campanhas, produtos e vendas em um só lugar. 
            Potencialize seu negócio com nossa plataforma completa.
          </p>
          <div className="bg-white/10 p-6 rounded-lg backdrop-blur-sm">
            <p className="italic text-white/90">
              "O FletoAds transformou a maneira como gerencio meu negócio. 
              Agora consigo acompanhar todas as minhas vendas e campanhas de forma simples e eficiente."
            </p>
            <p className="mt-4 font-semibold">— Maria Silva, Loja Conceito</p>
          </div>
        </div>
      </div>
      
      {/* Coluna direita - Formulário */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <Image 
                src="/assets/logoFleto.svg" 
                alt="FletoAds Logo" 
                width={180} 
                height={60} 
                priority
              />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Acesse sua conta
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Entre com suas credenciais para continuar
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
              <p>{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="seu@email.com"
              />
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Senha
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-fleto-primary dark:text-fleto-secondary hover:underline bg-transparent border-none p-0 cursor-pointer"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="••••••••"
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-fleto-primary to-fleto-dark hover:from-fleto-dark hover:to-fleto-primary text-white font-medium rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-fleto-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Entrando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Ou continue com
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center gap-3 py-3 px-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-fleto-primary dark:focus:ring-fleto-secondary disabled:opacity-50"
            >
              <FcGoogle className="h-5 w-5" />
              <span className="text-gray-700 dark:text-gray-300 font-medium">Google</span>
            </button>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Não tem uma conta?{" "}
              <Link 
                href="/cadastro" 
                className="text-fleto-primary dark:text-fleto-secondary font-medium hover:underline"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}