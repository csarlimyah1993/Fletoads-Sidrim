"use client"

import { useEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

interface GoogleMapProps {
  latitude: number
  longitude: number
  zoom?: number
  height?: string
  width?: string
  className?: string
}

// Verificar se a API do Google Maps já foi carregada
let googleMapsLoaded = false
let loadingPromise: Promise<void> | null = null

// Função para carregar o script do Google Maps
function loadGoogleMapsScript(): Promise<void> {
  if (googleMapsLoaded) {
    return Promise.resolve()
  }

  if (loadingPromise) {
    return loadingPromise
  }

  loadingPromise = new Promise((resolve, reject) => {
    try {
      // Verificar se já existe um script do Google Maps
      if (document.querySelector('script[src*="maps.googleapis.com/maps/api"]')) {
        console.log("Script do Google Maps já existe no documento")
        googleMapsLoaded = true
        resolve()
        return
      }

      console.log("Carregando script do Google Maps")

      // Criar um ID único para a função de callback
      const callbackName = `initGoogleMaps${Date.now()}`

      // Adicionar a função de callback ao objeto window
      ;(window as any)[callbackName] = () => {
        console.log("Google Maps API carregada com sucesso")
        googleMapsLoaded = true
        delete (window as any)[callbackName]
        resolve()
      }

      // Criar o script
      const script = document.createElement("script")
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = (error) => {
        console.error("Erro ao carregar o script do Google Maps:", error)
        reject(new Error("Falha ao carregar a API do Google Maps"))
      }

      // Adicionar o script ao documento
      document.head.appendChild(script)
    } catch (error) {
      console.error("Erro ao configurar o script do Google Maps:", error)
      reject(error)
    }
  })

  return loadingPromise
}

export function GoogleMap({
  latitude,
  longitude,
  zoom = 15,
  height = "400px",
  width = "100%",
  className,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  // ID único para este mapa
  const mapId = useRef(`map-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`)

  useEffect(() => {
    let isMounted = true

    async function initMap() {
      if (!mapRef.current) return

      try {
        setLoading(true)

        // Carregar o script do Google Maps
        await loadGoogleMapsScript()

        if (!isMounted) return

        // Verificar se as coordenadas são válidas
        if (isNaN(latitude) || isNaN(longitude)) {
          throw new Error("Coordenadas inválidas")
        }

        const position = { lat: latitude, lng: longitude }

        // Criar o mapa se ainda não existir
        if (!mapInstanceRef.current) {
          console.log(`Inicializando mapa ${mapId.current} em`, position)

          const map = new google.maps.Map(mapRef.current, {
            center: position,
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            zoomControl: true,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          })
          mapInstanceRef.current = map
        } else {
          // Atualizar o centro do mapa existente
          mapInstanceRef.current.setCenter(position)
          mapInstanceRef.current.setZoom(zoom)
        }

        // Criar ou atualizar o marcador
        if (!markerRef.current) {
          markerRef.current = new google.maps.Marker({
            position,
            map: mapInstanceRef.current,
            animation: google.maps.Animation.DROP,
          })
        } else {
          markerRef.current.setPosition(position)
        }

        setError(null)
      } catch (err) {
        console.error("Erro ao inicializar o mapa:", err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Erro ao carregar o mapa")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    initMap()

    return () => {
      isMounted = false
    }
  }, [latitude, longitude, zoom])

  return (
    <div className={cn("relative overflow-hidden rounded-md", className)} style={{ height, width }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 z-10">
          <p className="text-sm text-muted-foreground px-4 text-center">{error}</p>
        </div>
      )}

      <div
        id={mapId.current}
        ref={mapRef}
        className="h-full w-full"
        aria-label={`Mapa mostrando localização em latitude ${latitude} e longitude ${longitude}`}
      />
    </div>
  )
}
