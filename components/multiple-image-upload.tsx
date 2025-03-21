"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ImagePlus, X, Loader2 } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/components/ui/use-toast"
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel"

interface MultipleImageUploadProps {
  value: string[]
  onChange: (value: string[]) => void
  maxImages: number
}

export function MultipleImageUpload({ value, onChange, maxImages = 5 }: MultipleImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files

    if (!files || files.length === 0) return

    if (value.length + files.length > maxImages) {
      toast({
        title: "Limite de imagens excedido",
        description: `Você pode adicionar no máximo ${maxImages} imagens.`,
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData()
        formData.append("file", file)

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        })

        if (!response.ok) {
          throw new Error("Falha ao fazer upload da imagem")
        }

        const data = await response.json()
        return data.url
      })

      const uploadedUrls = await Promise.all(uploadPromises)
      onChange([...value, ...uploadedUrls])
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      toast({
        title: "Erro no upload",
        description: "Não foi possível fazer o upload da imagem. Tente novamente mais tarde.",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemove = (index: number) => {
    const newImages = [...value]
    newImages.splice(index, 1)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {value.length > 0 && (
        <Carousel className="w-full">
          <CarouselContent>
            {value.map((image, index) => (
              <CarouselItem key={index} className="basis-full md:basis-1/2 lg:basis-1/3">
                <Card className="relative overflow-hidden h-48">
                  <Image src={image || "/placeholder.svg"} alt={`Imagem ${index + 1}`} fill className="object-cover" />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-8 w-8"
                    onClick={() => handleRemove(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      )}

      <div className="flex items-center justify-center">
        <Button
          variant="outline"
          onClick={() => document.getElementById("image-upload")?.click()}
          disabled={isUploading || value.length >= maxImages}
          className="w-full h-24 border-dashed"
        >
          {isUploading ? (
            <Loader2 className="h-6 w-6 animate-spin" />
          ) : (
            <>
              <ImagePlus className="h-6 w-6 mr-2" />
              <span>
                {value.length === 0 ? "Adicionar imagens" : `Adicionar mais imagens (${value.length}/${maxImages})`}
              </span>
            </>
          )}
        </Button>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleUpload}
          className="hidden"
          disabled={isUploading || value.length >= maxImages}
        />
      </div>
    </div>
  )
}

