"use client"

import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface ImageProps extends NextImageProps {
  fallback?: string
}

export function Image({ className, fallback = "/placeholder.svg", alt, src, ...props }: ImageProps) {
  const [error, setError] = useState(false)

  // Adicionar sizes automaticamente se fill estiver presente
  const imageProps = {
    ...props,
    sizes: props.fill ? "100vw" : props.sizes,
  }

  return (
    <NextImage
      className={cn("transition-all", className)}
      alt={alt}
      onError={() => setError(true)}
      src={error ? fallback : src}
      {...imageProps}
    />
  )
}
