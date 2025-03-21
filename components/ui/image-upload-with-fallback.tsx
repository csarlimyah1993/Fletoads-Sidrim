"use client"

import type React from "react"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

interface ImageUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onChange: (value: string) => void
  tipo?: "logo" | "banner" | "produto" | "perfil"
}

export function ImageUpload({ value, onChange, tipo = "logo", className, ...props }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "")

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setPreview(newValue)
  }

  // Definir dimensões com base no tipo
  const getDimensions = () => {
    switch (tipo) {
      case "banner":
        return "h-40 w-full"
      case "logo":
        return "h-32 w-32"
      case "produto":
        return "h-48 w-full"
      case "perfil":
        return "h-24 w-24 rounded-full"
      default:
        return "h-32 w-32"
    }
  }

  return (
    <div className={cn("space-y-4", className)} {...props}>
      <div className="flex flex-col items-center">
        {preview ? (
          <div className={cn("relative overflow-hidden bg-gray-100", getDimensions())}>
            <img
              src={preview || "/placeholder.svg"}
              alt="Preview"
              className="h-full w-full object-cover"
              onError={() => setPreview("")}
            />
          </div>
        ) : (
          <div className={cn("flex items-center justify-center bg-gray-100 text-gray-400", getDimensions())}>
            {tipo === "perfil" ? (
              <span className="text-2xl font-semibold">U</span>
            ) : (
              <span className="text-sm">Sem imagem</span>
            )}
          </div>
        )}
      </div>

      <div>
        <Label htmlFor={`image-url-${tipo}`}>URL da Imagem</Label>
        <Input
          id={`image-url-${tipo}`}
          type="text"
          value={value || ""}
          onChange={handleInputChange}
          placeholder="https://exemplo.com/imagem.jpg"
        />
      </div>
    </div>
  )
}

