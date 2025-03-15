"use client"

import { useState, useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Button } from "@/components/ui/button"
import { Loader2, Upload, X } from "lucide-react"
import Image from "next/image"

interface ImageUploadProps {
  value: string
  onChange: (value: string) => void
  tipo: "logo" | "banner"
  className?: string
}

export function ImageUpload({ value, onChange, tipo, className = "" }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)
      setError(null)

      try {
        const file = acceptedFiles[0]
        const formData = new FormData()
        formData.append("file", file)
        formData.append("tipo", tipo)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao fazer upload da imagem")
        }

        onChange(data.url)
      } catch (error) {
        console.error("Erro no upload:", error)
        setError(error instanceof Error ? error.message : "Ocorreu um erro ao fazer upload da imagem")
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, tipo],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 1,
  })

  const handleRemoveImage = () => {
    onChange("")
  }

  return (
    <div className={className}>
      {value ? (
        <div className="relative">
          <div className="relative aspect-video w-full overflow-hidden rounded-lg">
            <Image
              src={value || "/placeholder.svg"}
              alt={tipo === "logo" ? "Logo da loja" : "Banner da loja"}
              fill
              className={`object-contain ${tipo === "logo" ? "object-center" : "object-cover"}`}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute right-2 top-2"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          {...getRootProps()}
          className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors ${
            isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary"
          }`}
        >
          <input {...getInputProps()} />
          {isUploading ? (
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          ) : (
            <>
              <Upload className="mb-2 h-10 w-10 text-gray-400" />
              <p className="mb-1 text-sm font-medium">
                {isDragActive ? "Solte a imagem aqui" : "Arraste e solte uma imagem aqui"}
              </p>
              <p className="text-xs text-gray-500">ou clique para selecionar um arquivo</p>
              <p className="mt-2 text-xs text-gray-400">PNG, JPG, WEBP ou GIF (máx. 5MB)</p>
            </>
          )}
        </div>
      )}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
      {value && (
        <p className="mt-2 text-xs text-gray-500">
          Você também pode arrastar e soltar uma nova imagem para substituir a atual
        </p>
      )}
    </div>
  )
}

