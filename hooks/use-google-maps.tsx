"use client"

import { useState, useEffect } from "react"

// Variável global para rastrear se o script já foi carregado
let isScriptLoaded = false
let isScriptLoading = false
let scriptLoadingPromise: Promise<void> | null = null

interface UseGoogleMapsOptions {
  apiKey?: string
}

export function useGoogleMaps({ apiKey }: UseGoogleMapsOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [loadError, setLoadError] = useState<Error | null>(null)

  useEffect(() => {
    // Se o script já foi carregado, apenas atualize o estado
    if (window.google && window.google.maps) {
      setIsLoaded(true)
      return
    }

    // Se o script já está sendo carregado, aguarde a promessa existente
    if (isScriptLoading && scriptLoadingPromise) {
      scriptLoadingPromise.then(() => setIsLoaded(true)).catch((error) => setLoadError(error))
      return
    }

    // Função para carregar o script
    const loadScript = () => {
      // Verificar se temos a API key do Google Maps
      const googleMapsApiKey = apiKey || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      if (!googleMapsApiKey) {
        const error = new Error("API key do Google Maps não encontrada")
        setLoadError(error)
        return Promise.reject(error)
      }

      // Marcar que o script está sendo carregado
      isScriptLoading = true

      // Criar uma promessa para o carregamento do script
      const promise = new Promise<void>((resolve, reject) => {
        // Criar um callback global para quando o script carregar
        const callbackName = "googleMapsInitCallback"
        window[callbackName] = () => {
          isScriptLoaded = true
          isScriptLoading = false
          setIsLoaded(true)
          resolve()
        }

        // Adicionar o script ao documento
        const script = document.createElement("script")
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=${callbackName}`
        script.async = true
        script.defer = true
        script.onerror = (error) => {
          isScriptLoading = false
          setLoadError(new Error("Erro ao carregar o script do Google Maps"))
          reject(error)
        }
        document.head.appendChild(script)
      })

      scriptLoadingPromise = promise
      return promise
    }

    // Carregar o script se ainda não foi carregado
    if (!isScriptLoaded && !isScriptLoading) {
      loadScript().catch((error) => console.error("Erro ao carregar Google Maps:", error))
    }

    // Cleanup
    return () => {
      // Não precisamos remover o script, pois queremos mantê-lo carregado
    }
  }, [apiKey])

  return { isLoaded, loadError }
}

