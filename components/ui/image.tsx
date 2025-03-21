"use client"

import NextImage, { type ImageProps as NextImageProps } from "next/image"
import { useState } from "react"
import { PlaceholderImage } from "../placeholder-image"

interface ImageProps extends Omit<NextImageProps, "onError"> {
  fallbackText?: string
}

export function Image({ src, alt, fallbackText, ...props }: ImageProps) {
  const [error, setError] = useState(false)

  // If there's an error or no src, show placeholder
  if (error || !src) {
    return (
      <PlaceholderImage
        text={fallbackText || alt || "Image"}
        width={props.width as number}
        height={props.height as number}
        className={props.className as string}
      />
    )
  }

  // Use local placeholder for external URLs to avoid domain issues
  const isExternalUrl =
    typeof src === "string" &&
    (src.startsWith("http://") || src.startsWith("https://")) &&
    !src.startsWith(window.location.origin)

  // If it's an external URL and not from our domain, use a placeholder
  if (isExternalUrl) {
    // Extract a text from the URL for the placeholder
    const urlParts = (src as string).split("/")
    const placeholderText = urlParts[urlParts.length - 1] || alt || "Image"

    return (
      <PlaceholderImage
        text={placeholderText}
        width={props.width as number}
        height={props.height as number}
        className={props.className as string}
      />
    )
  }

  // Otherwise, use Next.js Image
  return <NextImage src={src} alt={alt} {...props} onError={() => setError(true)} />
}

