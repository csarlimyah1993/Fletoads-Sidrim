"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, X, ImageIcon, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Image from "next/image"

interface ProdutoImagemUploadProps {
  produtoId: string
  imagensAtuais?: string[]
  onImagesChange?: (images: string[]) => void
}

export function ProdutoImagemUpload({ produtoId, imagensAtuais = [], onImagesChange }: ProdutoImagemUploadProps) {
  const [imagens, setImagens] = useState<string[]>(imagensAtuais)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [planoInfo, setPlanoInfo] = useState<any>(null)

  useEffect(() => {
    const fetchPlanoInfo = async () => {
      try {
        const response = await fetch("/api/user/plan")
        if (!response.ok) throw new Error("Falha ao carregar informações do plano")
        const data = await response.json()
        setPlanoInfo(data)
      } catch (error) {
        console.error("Erro ao buscar informações do plano:", error)
        setPlanoInfo({ uso: { imagensPorProduto: 1 } })
      }
    }

    fetchPlanoInfo()
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Verificar limite de imagens do plano
    if (planoInfo && imagens.length >= planoInfo.uso.imagensPorProduto) {
      setError(`Seu plano permite apenas ${planoInfo.uso.imagensPorProduto} imagem(ns) por produto.`)
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const file = files[0]
      const formData = new FormData()
      formData.append("file", file)
      formData.append("produtoId", produtoId)

      const response = await fetch("/api/upload/produto-imagem", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Falha ao fazer upload da imagem")
      }

      const data = await response.json()
      const novasImagens = [...imagens, data.url]
      setImagens(novasImagens)

      if (onImagesChange) {
        onImagesChange(novasImagens)
      }
    } catch (error) {
      console.error("Erro ao fazer upload:", error)
      setError("Não foi possível fazer o upload da imagem. Tente novamente.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveImage = async (index: number) => {
    try {
      const imagemUrl = imagens[index]

      // Remover do servidor
      await fetch("/api/upload/produto-imagem", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          produtoId,
          imageUrl: imagemUrl,
        }),
      })

      // Atualizar estado local
      const novasImagens = imagens.filter((_, i) => i !== index)
      setImagens(novasImagens)

      if (onImagesChange) {
        onImagesChange(novasImagens)
      }
    } catch (error) {
      console.error("Erro ao remover imagem:", error)
      setError("Não foi possível remover a imagem. Tente novamente.")
    }
  }

  if (!planoInfo) {
    return <div>Carregando...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Imagens do Produto</h3>
        <span className="text-sm text-muted-foreground">
          {imagens.length} / {planoInfo.uso.imagensPorProduto}
        </span>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {imagens.map((imagem, index) => (
          <Card key={index} className="relative overflow-hidden group">
            <CardContent className="p-0">
              <div className="aspect-square relative">
                <Image
                  src={imagem || "/placeholder.svg"}
                  alt={`Imagem ${index + 1} do produto`}
                  fill
                  className="object-cover"
                />
                <Button
                  variant="destructive"
                  size="icon"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleRemoveImage(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {imagens.length < planoInfo.uso.imagensPorProduto && (
          <Card className="border-dashed">
            <CardContent className="p-0">
              <label className="flex flex-col items-center justify-center w-full h-full aspect-square cursor-pointer">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para adicionar</p>
                </div>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            </CardContent>
          </Card>
        )}

        {imagens.length === 0 && planoInfo.uso.imagensPorProduto === 0 && (
          <div className="col-span-full flex items-center justify-center p-4 border rounded-md">
            <div className="flex items-center text-muted-foreground">
              <ImageIcon className="h-5 w-5 mr-2" />
              <span>Upload de imagens não disponível no seu plano atual</span>
            </div>
          </div>
        )}
      </div>

      {planoInfo.isFreeTier && (
        <p className="text-sm text-muted-foreground">
          Faça upgrade do seu plano para adicionar mais imagens por produto.
        </p>
      )}
    </div>
  )
}

