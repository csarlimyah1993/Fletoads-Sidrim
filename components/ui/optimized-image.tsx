"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"
import { cn } from "@/lib/utils"

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
  fallbackSrc?: string
  fallbackClassName?: string
}

export function OptimizedImage({
  src,
  alt,
  fallbackSrc = "/placeholder.svg",
  className,
  fallbackClassName,
  ...props
}: OptimizedImageProps) {
  const [error, setError] = useState(false)

  const handleError = () => {
    console.warn("Erro ao carregar imagem:", src)
    setError(true)
  }

  if (error) {
    return (
      <Image
        src={fallbackSrc || "/placeholder.svg"}
        alt={alt}
        className={cn(className, fallbackClassName)}
        unoptimized
        {...props}
      />
    )
  }

  return (
    <Image
      src={src || "/placeholder.svg"}
      alt={alt}
      className={className}
      onError={handleError}
      unoptimized // Usar esta opção para evitar problemas com domínios não configurados
      {...props}
    />
  )
}

