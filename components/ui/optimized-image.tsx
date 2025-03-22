"use client"

import { useState, useEffect } from "react"
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
  const [loaded, setLoaded] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleError = () => {
    console.warn("Erro ao carregar imagem:", src)
    setError(true)
  }

  const handleLoad = () => {
    setLoaded(true)
  }

  // Não renderizar nada até que o componente esteja montado no cliente
  if (!mounted) {
    return null
  }

  if (error) {
    return (
      <Image
        src={fallbackSrc || "/placeholder.svg"}
        alt={alt}
        className={cn(className, fallbackClassName)}
        unoptimized
        onLoad={handleLoad}
        {...props}
      />
    )
  }

  return (
    <Image
      src={src || fallbackSrc}
      alt={alt}
      className={cn(className, !loaded && "opacity-0", loaded && "opacity-100 transition-opacity duration-300")}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized // Usar esta opção para evitar problemas com domínios não configurados
      {...props}
    />
  )
}

