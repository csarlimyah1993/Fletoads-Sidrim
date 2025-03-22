"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, Loader2 } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value?: string
  onChange?: (url: string) => void
  onRemove?: () => void
  disabled?: boolean
  tipo?: string
  className?: string
}

export function ImageUpload({ value, onChange, onRemove, disabled, tipo = "geral", className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError(null)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("tipo", tipo)

      const response = await fetch("/api/upload/imagem", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Falha ao fazer upload da imagem")
      }

      const data = await response.json()

      if (onChange) {
        onChange(data.url)
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setError(error instanceof Error ? error.message : "Erro ao fazer upload da imagem")
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageError = () => {
    console.warn("Erro ao carregar imagem:", value)
    setImageError(true)
  }

  // Verificar se a URL da imagem é válida
  const isValidImageUrl = value && typeof value === "string" && value.startsWith("http")

  return (
    <div className={className}>
      {isValidImageUrl && !imageError ? (
        <Card className="relative overflow-hidden">
          <CardContent className="p-0">
            <div className="aspect-square relative">
              <Image
                src={value || "/placeholder.svg"}
                alt="Imagem carregada"
                fill
                className="object-cover"
                onError={handleImageError}
                unoptimized // Usar esta opção para evitar problemas com domínios não configurados
              />
              {!disabled && (
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2"
                  onClick={onRemove}
                  type="button"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-0">
            <label className="flex flex-col items-center justify-center w-full h-full aspect-square cursor-pointer">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                {isUploading ? (
                  <Loader2 className="h-8 w-8 text-muted-foreground animate-spin mb-2" />
                ) : (
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                )}
                <p className="text-sm text-muted-foreground">{isUploading ? "Enviando..." : "Clique para adicionar"}</p>
                {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleUpload}
                disabled={isUploading || disabled}
              />
            </label>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

