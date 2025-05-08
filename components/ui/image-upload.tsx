"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Loader2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

export interface ImageUploadProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  onUpload?: (url: string) => void
  onRemove?: (index?: number) => void
  multiple?: boolean
  className?: string
  disabled?: boolean
}

export function ImageUpload({
  value,
  onChange,
  onUpload,
  onRemove,
  multiple = false,
  className,
  disabled = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Converter value para array sempre
  const images = Array.isArray(value) ? value : value ? [value] : []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

        // Verificar tamanho do arquivo (limite de 5MB)
        if (file.size > 5 * 1024 * 1024) {
          throw new Error("O arquivo é muito grande. O tamanho máximo é 5MB.")
        }

        // Simular progresso de upload
        const interval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + 5
            if (newProgress >= 95) {
              clearInterval(interval)
              return 95
            }
            return newProgress
          })
        }, 100)

        console.log("Iniciando upload da imagem:", file.name)

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          clearInterval(interval)
          setUploadProgress(100)

          if (!response.ok) {
            const errorData = await response.text()
            console.error("Resposta de erro do servidor:", errorData)
            throw new Error(`Erro ao fazer upload da imagem: ${response.status} ${response.statusText}`)
          }

          const data = await response.json()
          console.log("Upload bem-sucedido, URL recebida:", data.url)

          const imageUrl = data.url

          if (multiple) {
            const newImages = [...images, imageUrl]
            onChange(newImages)
          } else {
            onChange(imageUrl)
          }

          if (onUpload) {
            onUpload(imageUrl)
          }

          toast({
            title: "Upload concluído",
            description: "A imagem foi carregada com sucesso.",
          })
        } catch (uploadError) {
          console.error("Erro durante o upload:", uploadError)
          throw uploadError
        }
      }
    } catch (error) {
      console.error("Erro no upload:", error)
      setError(error instanceof Error ? error.message : "Erro desconhecido ao fazer upload da imagem")
      toast({
        variant: "destructive",
        title: "Erro no upload",
        description: error instanceof Error ? error.message : "Não foi possível fazer o upload da imagem",
      })
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
      // Limpar o input para permitir selecionar o mesmo arquivo novamente
      if (e.target) {
        e.target.value = ""
      }
    }
  }

  const handleRemove = (index: number) => {
    if (multiple) {
      const newImages = [...images]
      newImages.splice(index, 1)
      onChange(newImages)
    } else {
      onChange("")
    }

    if (onRemove) {
      onRemove(index)
    }

    toast({
      title: "Imagem removida",
      description: "A imagem foi removida com sucesso.",
    })
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {images.map((image, index) => (
          <div key={`${image}-${index}`} className="relative aspect-square border rounded-md overflow-hidden group">
            <Image
              src={image || "/placeholder.svg"}
              alt={`Imagem ${index + 1}`}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleRemove(index)}
                disabled={disabled}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}

        {isUploading && (
          <div className="aspect-square border rounded-md overflow-hidden flex flex-col items-center justify-center bg-muted">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
            <div className="w-3/4 h-2 bg-muted-foreground/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{uploadProgress}%</p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <Button type="button" variant="outline" className="w-full max-w-xs" disabled={isUploading || disabled} asChild>
          <label className={`cursor-pointer flex items-center justify-center ${disabled ? "cursor-not-allowed" : ""}`}>
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Enviando..." : multiple ? "Adicionar imagens" : "Adicionar imagem"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              multiple={multiple}
              disabled={isUploading || disabled}
            />
          </label>
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-2 text-center">
        Formatos suportados: JPG, PNG, GIF. Tamanho máximo: 5MB
      </p>
    </div>
  )
}
