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
  const [uploadProgress, setUploadProgress] = useState(0)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      setIsUploading(true)
      setError(null)
      setUploadProgress(0)

      try {
        const file = acceptedFiles[0]

        // Log file information for debugging
        console.log("File being uploaded:", {
          name: file.name,
          type: file.type,
          size: file.size,
        })

        const formData = new FormData()
        formData.append("file", file)
        formData.append("tipo", tipo)

        // Simulated progress for better UX
        const progressInterval = setInterval(() => {
          setUploadProgress((prev) => {
            const newProgress = prev + Math.random() * 15
            return newProgress > 90 ? 90 : newProgress
          })
        }, 500)

        try {
          const response = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          clearInterval(progressInterval)

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || "Erro ao fazer upload da imagem")
          }

          const data = await response.json()
          console.log("Upload response:", data)

          setUploadProgress(100)
          onChange(data.url)
        } catch (uploadError) {
          clearInterval(progressInterval)
          console.error("Upload error:", uploadError)
          throw uploadError
        }
      } catch (error) {
        console.error("Erro no upload:", error)
        setError(error instanceof Error ? error.message : "Ocorreu um erro ao fazer upload da imagem")
        setUploadProgress(0)
      } finally {
        setIsUploading(false)
      }
    },
    [onChange, tipo],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/jpeg": [".jpeg", ".jpg"],
      "image/png": [".png"],
      "image/gif": [".gif"],
      "image/webp": [".webp"],
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
              unoptimized={value.includes("/temp-uploads/")} // Skip optimization for temp images
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
            <div className="flex flex-col items-center">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <div className="mt-4 w-full max-w-xs">
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
                  <div
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="mt-2 text-center text-sm text-gray-500">
                  {uploadProgress < 100 ? "Enviando..." : "Processando..."}
                </p>
              </div>
            </div>
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

