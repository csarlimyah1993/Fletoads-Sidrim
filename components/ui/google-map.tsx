"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { MapPin } from "lucide-react"

interface GoogleMapProps {
  address?: string
  latitude?: string | number | null
  longitude?: string | number | null
  storeName?: string
  height?: string
  zoom?: number
  onLocationChange?: (lat: number, lng: number) => void
  interactive?: boolean
}

export function GoogleMap({
  address,
  latitude,
  longitude,
  storeName = "Minha Loja",
  height = "300px",
  zoom = 15,
  onLocationChange,
  interactive = false,
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Função para carregar o mapa
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log("Inicializando mapa com:", { address, latitude, longitude, interactive })

        // Verificar se temos coordenadas válidas
        const hasValidCoordinates =
          latitude &&
          longitude &&
          !isNaN(Number(latitude)) &&
          !isNaN(Number(longitude)) &&
          Number(latitude) !== 0 &&
          Number(longitude) !== 0

        console.log("Coordenadas válidas:", hasValidCoordinates)

        // Se não temos coordenadas válidas, mas temos um endereço, tentamos geocodificar
        if (!hasValidCoordinates && address) {
          // Inicializar o loader do Google Maps
          const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
            version: "weekly",
            libraries: ["places", "geocoding"],
          })

          // Carregar a API do Google Maps
          const google = await loader.load()

          // Criar o geocoder
          const geocoder = new google.maps.Geocoder()

          // Geocodificar o endereço
          geocoder.geocode({ address }, (results, status) => {
            if (status === "OK" && results && results[0]) {
              const location = results[0].geometry.location

              // Criar o mapa com as coordenadas obtidas
              createMap(google, location.lat(), location.lng(), zoom)

              // Notificar o componente pai sobre a mudança de localização
              if (onLocationChange) {
                onLocationChange(location.lat(), location.lng())
              }
            } else {
              setError("Não foi possível encontrar a localização para este endereço.")
              setIsLoading(false)
            }
          })
        } else if (hasValidCoordinates) {
          // Se temos coordenadas válidas, criamos o mapa diretamente
          const loader = new Loader({
            apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
            version: "weekly",
          })

          const google = await loader.load()
          createMap(google, Number(latitude), Number(longitude), zoom)
        } else {
          // Se não temos nem coordenadas nem endereço
          setError("Coordenadas ou endereço não fornecidos.")
          setIsLoading(false)
        }
      } catch (err) {
        console.error("Erro ao inicializar o mapa:", err)
        setError("Erro ao carregar o mapa. Verifique sua chave de API.")
        setIsLoading(false)
      }
    }

    // Função para criar o mapa
    const createMap = (google: typeof globalThis.google, lat: number, lng: number, zoomLevel: number) => {
      if (!mapRef.current) return

      // Criar o mapa
      const map = new google.maps.Map(mapRef.current, {
        center: { lat, lng },
        zoom: zoomLevel,
        disableDefaultUI: !interactive,
        zoomControl: interactive,
        scrollwheel: interactive,
        mapTypeControl: interactive,
        streetViewControl: interactive,
        fullscreenControl: interactive,
      })

      // Criar o marcador
      const newMarker = new google.maps.Marker({
        position: { lat, lng },
        map,
        title: storeName,
        animation: google.maps.Animation.DROP,
      })

      // Adicionar janela de informação
      const infoWindow = new google.maps.InfoWindow({
        content: `<div style="padding: 8px;"><strong>${storeName}</strong><br>${address || ""}</div>`,
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

        // Permitir clicar no mapa para mover o marcador
        map.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng && newMarker) {
            newMarker.setPosition(e.latLng)
            if (onLocationChange) {
              onLocationChange(e.latLng.lat(), e.latLng.lng())
            }
          }
        })
      }

      // Salvar as instâncias
      setMapInstance(map)
      setMarker(newMarker)
      setIsLoading(false)
    }

    if (mapRef.current) {
      initMap()
    }

    // Limpeza ao desmontar
    return () => {
      if (marker) {
        marker.setMap(null)
      }
    }
  }, [address, latitude, longitude, storeName, zoom, onLocationChange, interactive])

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
