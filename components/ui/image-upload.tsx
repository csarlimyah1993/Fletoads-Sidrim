"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Loader2, Upload } from "lucide-react"

interface ImageUploadProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  onChange: (value: string) => void
  tipo?: "logo" | "banner" | "produto" | "perfil"
}

export function ImageUpload({ value, onChange, tipo = "logo", className, ...props }: ImageUploadProps) {
  const [preview, setPreview] = useState<string>(value || "")
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    onChange(newValue)
    setPreview(newValue)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      setIsUploading(true)

      // Criar um FormData para enviar o arquivo
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", tipo)

      // Enviar o arquivo para a API
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem")
      }

      const data = await response.json()
      const imageUrl = data.url

      // Atualizar o valor e a prévia
      onChange(imageUrl)
      setPreview(imageUrl)
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error)
      alert("Erro ao fazer upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
      // Limpar o input de arquivo
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
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

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor={`image-url-${tipo}`}>URL da Imagem</Label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="h-8 px-3 text-xs"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Upload className="mr-1 h-3 w-3" />
                Upload
              </>
            )}
          </Button>
        </div>
        <div className="flex gap-2">
          <Input
            id={`image-url-${tipo}`}
            type="text"
            value={value || ""}
            onChange={handleInputChange}
            placeholder="https://exemplo.com/imagem.jpg"
            className="flex-1"
          />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      </div>
    </div>
  )
}

