"use client"

import type React from "react"

import { useState } from "react"
import { requestPasswordReset, verifyOTP, resetPassword } from "@/app/actions/forgot-password"
import Link from "next/link"

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [step, setStep] = useState(1)
  const [message, setMessage] = useState({ type: "", text: "" })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    const formData = new FormData()
    formData.append("email", email)

    const result = await requestPasswordReset(formData)

    setIsSubmitting(false)
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setStep(2)
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    const formData = new FormData()
    formData.append("email", email)
    formData.append("otp", otp)

    const result = await verifyOTP(formData)

    setIsSubmitting(false)
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setStep(3)
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setMessage({ type: "", text: "" })

    if (password !== confirmPassword) {
      setMessage({ type: "error", text: "As senhas não coincidem" })
      setIsSubmitting(false)
      return
    }

    const formData = new FormData()
    formData.append("email", email)
    formData.append("otp", otp)
    formData.append("password", password)
    formData.append("confirmPassword", confirmPassword)

    const result = await resetPassword(formData)

    setIsSubmitting(false)
    if (result.success) {
      setMessage({ type: "success", text: result.message })
      setTimeout(() => {
        window.location.href = "/login"
      }, 3000)
    } else {
      setMessage({ type: "error", text: result.message })
    }
  }

  // Função para lidar com a entrada manual do OTP
  const handleOtpChange = (value: string) => {
    setOtp(value)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Recuperação de Senha</h1>

        {message.text && (
          <div
            className={`p-3 rounded mb-4 ${message.type === "error" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"}`}
          >
            {message.text}
          </div>
        )}

        {step === 1 && (
          <form onSubmit={handleRequestReset} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Seu email cadastrado"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Enviando..." : "Enviar código"}
            </button>
            <div className="text-center mt-4">
              <Link href="/login" className="text-sm text-blue-600 hover:underline">
                Voltar para o login
              </Link>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Digite o código de 6 dígitos enviado para {email}
              </label>
              <div className="flex justify-center">
                {/* Implementação alternativa com inputs manuais */}
                <div className="flex gap-2">
                  {[...Array(6)].map((_, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={otp[index] || ""}
                      onChange={(e) => {
                        const value = e.target.value
                        if (/^[0-9]$/.test(value) || value === "") {
                          const newOtp = otp.split("")
                          newOtp[index] = value
                          setOtp(newOtp.join(""))

                          // Auto-focus next input
                          if (value && index < 5) {
                            const nextInput = document.querySelector(
                              `input[data-index="${index + 1}"]`,
                            ) as HTMLInputElement
                            if (nextInput) nextInput.focus()
                          }
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace
                        if (e.key === "Backspace" && !otp[index] && index > 0) {
                          const prevInput = document.querySelector(
                            `input[data-index="${index - 1}"]`,
                          ) as HTMLInputElement
                          if (prevInput) prevInput.focus()
                        }
                      }}
                      data-index={index}
                      className="w-12 h-12 text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ))}
                </div>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Verificando..." : "Verificar código"}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(1)} className="text-sm text-blue-600 hover:underline">
                Voltar
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Nova senha
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Digite sua nova senha"
              />
            </div>
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirme a nova senha
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirme sua nova senha"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isSubmitting ? "Atualizando..." : "Atualizar senha"}
            </button>
            <div className="text-center mt-4">
              <button type="button" onClick={() => setStep(2)} className="text-sm text-blue-600 hover:underline">
                Voltar
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
