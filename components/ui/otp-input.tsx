"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  length?: number
  disabled?: boolean
  className?: string
}

export function OtpInput({ value, onChange, length = 6, disabled = false, className }: OtpInputProps) {
  const [otp, setOtp] = useState<string[]>(
    value
      .split("")
      .slice(0, length)
      .concat(Array(length - value.length).fill("")),
  )
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Atualizar o estado local quando o valor externo mudar
    if (value !== otp.join("")) {
      setOtp(
        value
          .split("")
          .slice(0, length)
          .concat(Array(length - value.length).fill("")),
      )
    }
  }, [value, length, otp])

  useEffect(() => {
    // Inicializar os refs
    inputRefs.current = inputRefs.current.slice(0, length)
  }, [length])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const newValue = e.target.value

    // Permitir apenas dígitos
    if (newValue && !/^\d+$/.test(newValue)) return

    // Lidar com colagem de vários dígitos
    if (newValue.length > 1) {
      const pastedValue = newValue.split("").slice(0, length)
      const newOtp = [...otp]

      for (let i = 0; i < pastedValue.length; i++) {
        if (index + i < length) {
          newOtp[index + i] = pastedValue[i]
        }
      }

      setOtp(newOtp)
      onChange(newOtp.join(""))

      // Focar no último campo preenchido ou no próximo disponível
      const nextIndex = Math.min(index + pastedValue.length, length - 1)
      inputRefs.current[nextIndex]?.focus()
      return
    }

    // Lidar com entrada de um único dígito
    const newOtp = [...otp]
    newOtp[index] = newValue
    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Mover para o próximo campo se este foi preenchido
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Mover para o campo anterior ao pressionar Backspace em um campo vazio
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }

    // Mover para o próximo campo ao pressionar seta direita no final do campo
    if (e.key === "ArrowRight" && index < length - 1) {
      const input = e.target as HTMLInputElement
      if (input.selectionStart === input.value.length) {
        inputRefs.current[index + 1]?.focus()
      }
    }

    // Mover para o campo anterior ao pressionar seta esquerda no início do campo
    if (e.key === "ArrowLeft" && index > 0) {
      const input = e.target as HTMLInputElement
      if (input.selectionStart === 0) {
        inputRefs.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>, index: number) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text/plain").trim()

    // Verificar se são apenas dígitos
    if (!/^\d+$/.test(pastedData)) return

    const pastedChars = pastedData.split("")
    const newOtp = [...otp]

    for (let i = 0; i < pastedChars.length; i++) {
      if (index + i < length) {
        newOtp[index + i] = pastedChars[i]
      }
    }

    setOtp(newOtp)
    onChange(newOtp.join(""))

    // Focar no último campo preenchido ou no próximo disponível
    const nextIndex = Math.min(index + pastedChars.length, length - 1)
    inputRefs.current[nextIndex]?.focus()
  }

  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length }).map((_, index) => (
        <Input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="\d*"
          maxLength={1}
          value={otp[index] || ""}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          onPaste={(e) => handlePaste(e, index)}
          disabled={disabled}
          className="w-10 h-12 text-center text-lg"
          aria-label={`Dígito ${index + 1} do código de verificação`}
        />
      ))}
    </div>
  )
}
