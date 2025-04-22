"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { MapPin } from "lucide-react"

// Interface para as props originais que estavam sendo usadas
interface GoogleMapProps {
  defaultCenter?: { lat: number; lng: number }
  defaultZoom?: number
  markers?: Array<{ position: { lat: number; lng: number }; title: string }>
  apiKey?: string
  // Mantendo também as props da versão anterior para compatibilidade
  latitude?: number | string | null
  longitude?: number | string | null
  address?: string
  storeName?: string
  height?: string
  zoom?: number
  onLocationChange?: (lat: number, lng: number) => void
  interactive?: boolean
}

export function GoogleMap({
  defaultCenter,
  defaultZoom = 15,
  markers = [],
  apiKey,
  // Props da versão anterior
  latitude: latitudeProp,
  longitude: longitudeProp,
  address,
  storeName,
  height = "300px",
  zoom: zoomProp,
  onLocationChange,
  interactive = false,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Determinar quais valores usar com base nas props fornecidas
  const latitude = defaultCenter?.lat ?? (Number(latitudeProp) || 0)
  const longitude = defaultCenter?.lng ?? (Number(longitudeProp) || 0)
  const zoom = defaultZoom ?? zoomProp ?? 15
  const actualApiKey = apiKey ?? process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  // Função para carregar o mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!mapRef.current) return

        // Verificar se temos coordenadas válidas
        const hasValidCoordinates = latitude !== 0 && longitude !== 0 && !isNaN(latitude) && !isNaN(longitude)

        if (!hasValidCoordinates) {
          setError("Coordenadas inválidas")
          setIsLoading(false)
          return
        }

        // Inicializar o loader do Google Maps
        const loader = new Loader({
          apiKey: actualApiKey || "",
          version: "weekly",
        })

        // Carregar a API do Google Maps
        const google = await loader.load()

        if (!google) {
          setError("Falha ao carregar a API do Google Maps.")
          setIsLoading(false)
          return
        }

        // Criar o mapa
        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: zoom,
          disableDefaultUI: !interactive,
          zoomControl: interactive,
          scrollwheel: interactive,
          mapTypeControl: interactive,
          streetViewControl: interactive,
          fullscreenControl: interactive,
        })

        // Adicionar marcadores
        if (markers && markers.length > 0) {
          markers.forEach((marker) => {
            const newMarker = new google.maps.Marker({
              position: marker.position,
              map,
              title: marker.title,
              animation: google.maps.Animation.DROP,
            })

            // Adicionar janela de informação
            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="padding: 8px;"><strong>${marker.title}</strong></div>`,
            })

            // Abrir a janela de informação ao clicar no marcador
            newMarker.addListener("click", () => {
              infoWindow.open(map, newMarker)
            })

            // Se o mapa for interativo, permitir arrastar o marcador
            if (interactive && onLocationChange) {
              newMarker.setDraggable(true)
              newMarker.addListener("dragend", () => {
                const position = newMarker.getPosition()
                if (position && onLocationChange) {
                  onLocationChange(position.lat(), position.lng())
                }
              })
            }
          })
        } else if (hasValidCoordinates) {
          // Se não temos marcadores mas temos coordenadas, criar um marcador padrão
          const newMarker = new google.maps.Marker({
            position: { lat: latitude, lng: longitude },
            map,
            title: storeName || address || "Localização",
            animation: google.maps.Animation.DROP,
          })

          // Adicionar janela de informação
          if (address || storeName) {
            const infoWindow = new google.maps.InfoWindow({
              content: `<div style="padding: 8px;"><strong>${storeName || ""}</strong><br>${address || ""}</div>`,
            })

            // Abrir a janela de informação ao clicar no marcador
            newMarker.addListener("click", () => {
              infoWindow.open(map, newMarker)
            })
          }

          // Se o mapa for interativo, permitir arrastar o marcador
          if (interactive && onLocationChange) {
            newMarker.setDraggable(true)
            newMarker.addListener("dragend", () => {
              const position = newMarker.getPosition()
              if (position && onLocationChange) {
                onLocationChange(position.lat(), position.lng())
              }
            })
          }
        }

        setMapInstance(map)
        setIsLoading(false)
      } catch (err) {
        console.error("Erro ao inicializar o mapa:", err)
        setError("Erro ao carregar o mapa. Verifique sua chave de API.")
        setIsLoading(false)
      }
    }

    if (mapRef.current) {
      initMap()
    }

    // Limpeza ao desmontar
    return () => {
      if (mapInstance) {
        // Limpar recursos do mapa se necessário
      }
    }
  }, [latitude, longitude, zoom, markers, address, storeName, interactive, onLocationChange, actualApiKey])

  // Renderizar o componente
  return (
    <div className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 z-10">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 z-10 p-4">
          <MapPin className="h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-muted-foreground text-center">{error}</p>
          {address && (
            <p className="mt-2 text-sm text-center">
              <strong>Endereço:</strong> {address}
            </p>
          )}
        </div>
      )}

      <div ref={mapRef} className="w-full h-full rounded-md overflow-hidden" style={{ height }} />
    </div>
  )
}
