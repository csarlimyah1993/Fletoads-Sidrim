"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Trash2, Upload, Loader2 } from "lucide-react"
import Image from "next/image"

export interface ImageUploadProps {
  value: string | string[]
  onChange: (value: string | string[]) => void
  onUpload?: (url: string) => void
  onRemove?: (index?: number) => void
  multiple?: boolean
  className?: string
}

export function ImageUpload({ value, onChange, onUpload, onRemove, multiple = false, className }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Converter value para array sempre
  const images = Array.isArray(value) ? value : value ? [value] : []

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setUploadProgress(0)

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        const formData = new FormData()
        formData.append("file", file)

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

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        clearInterval(interval)
        setUploadProgress(100)

        if (!response.ok) {
          throw new Error("Erro ao fazer upload da imagem")
        }

        const data = await response.json()
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
      }
    } catch (error) {
      console.error("Erro no upload:", error)
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
  }

  return (
    <div className={className}>
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
        <Button type="button" variant="outline" className="w-full max-w-xs" disabled={isUploading} asChild>
          <label className="cursor-pointer flex items-center justify-center">
            <Upload className="h-4 w-4 mr-2" />
            {isUploading ? "Enviando..." : multiple ? "Adicionar imagens" : "Adicionar imagem"}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleUpload}
              multiple={multiple}
              disabled={isUploading}
            />
          </label>
        </Button>
      </div>
    </div>
  )
}
