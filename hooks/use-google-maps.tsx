"use client"

import { useEffect, useState } from "react"
import { loadGoogleMaps } from "@/lib/load-google-maps"

declare global {
  interface Window {
    google: any
  }
}

export function useGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [googleMaps, setGoogleMaps] = useState<any>(null)

  useEffect(() => {
    loadGoogleMaps(apiKey)
      .then(() => {
        setIsLoaded(true)
        // After the script is loaded, the google object is available globally
        if (typeof window !== "undefined") {
          setGoogleMaps(window.google)
        }
      })
      .catch((err) => {
        setError(err)
      })
  }, [apiKey])

  return { isLoaded, googleMaps, error }
}
