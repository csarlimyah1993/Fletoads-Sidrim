"use client"

import type React from "react"

import { useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Upload, X } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"

interface ImageUploadProps {
  value: string
  onChange: (url: string) => void
  tipo: "logo" | "banner" | "produto"
  className?: string
}

export function ImageUpload({ value, onChange, tipo, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(value || null)

  const handleUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]

      if (!file) return

      // Validar tipo de arquivo
      const validTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]
      if (!validTypes.includes(file.type)) {
        toast.error("Formato de arquivo inválido. Use JPEG, PNG, WEBP ou GIF.")
        return
      }

      // Validar tamanho (máximo 5MB)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        toast.error("Arquivo muito grande. O tamanho máximo é 5MB.")
        return
      }

      try {
        setIsUploading(true)

        // Criar preview local
        const reader = new FileReader()
        reader.onload = () => {
          setPreview(reader.result as string)
        }
        reader.readAsDataURL(file)

        // Preparar FormData
        const formData = new FormData()
        formData.append("file", file)
        formData.append("tipo", tipo)

        // Enviar para a API
        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error || "Erro ao fazer upload da imagem")
        }

        const data = await response.json()
        onChange(data.url)
        toast.success("Imagem enviada com sucesso!")
      } catch (error) {
        console.error("Erro no upload:", error)
        toast.error(error instanceof Error ? error.message : "Erro ao fazer upload da imagem")
        // Limpar preview em caso de erro
        setPreview(value || null)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, tipo, value],
  )

  const handleRemove = useCallback(() => {
    setPreview(null)
    onChange("")
  }, [onChange])

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex flex-col items-center justify-center space-y-2">
        {preview ? (
          <div className="relative">
            <div
              className={`
              ${tipo === "logo" ? "w-40 h-40" : tipo === "banner" ? "w-full h-40" : "w-40 h-40"}
              overflow-hidden rounded-md border border-border
            `}
            >
              <Image
                src={preview || "/placeholder.svg"}
                alt={`Imagem de ${tipo}`}
                fill
                className={`
                  ${tipo === "logo" ? "object-contain" : "object-cover"}
                `}
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
              onClick={handleRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div
            className={`
              ${tipo === "logo" ? "w-40 h-40" : tipo === "banner" ? "w-full h-40" : "w-40 h-40"}
              flex flex-col items-center justify-center rounded-md border border-dashed border-border bg-muted/30
            `}
          >
            <div className="flex flex-col items-center justify-center p-4 text-center">
              <div className="mb-2 flex items-center justify-center rounded-full bg-primary/10 p-2">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <p className="mb-1 text-sm font-medium">Arraste ou clique para fazer upload</p>
              <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP ou GIF (máx. 5MB)</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        <Label
          htmlFor={`image-upload-${tipo}`}
          className="cursor-pointer text-sm font-medium text-primary hover:underline"
        >
          {isUploading ? "Enviando..." : preview ? "Trocar imagem" : "Selecionar imagem"}
        </Label>
        <input
          id={`image-upload-${tipo}`}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleUpload}
          disabled={isUploading}
        />
      </div>
    </div>
  )
}

