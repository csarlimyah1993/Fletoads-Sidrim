"use client"

import { useEffect, useRef } from "react"
import { Loader } from "lucide-react"

interface GoogleMapProps {
  latitude: number | null
  longitude: number | null
  address?: string
  storeName?: string
  zoom?: number
}

export function GoogleMap({ latitude, longitude, address, storeName = "Loja", zoom = 15 }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markerRef = useRef<google.maps.Marker | null>(null)

  useEffect(() => {
    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript = () => {
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      return new Promise<void>((resolve) => {
        script.onload = () => resolve()
      })
    }

    // Função para inicializar o mapa
    const initMap = async () => {
      if (!mapRef.current) return

      // Se o Google Maps API não estiver carregado, carregue-o
      if (typeof window.google === "undefined" || !window.google.maps) {
        await loadGoogleMapsScript()
      }

      // Inicializar o mapa com coordenadas padrão (será atualizado depois)
      const defaultPosition = { lat: -23.5505, lng: -46.6333 } // São Paulo como padrão

      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: defaultPosition,
        zoom: zoom,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      })

      // Se temos coordenadas, use-as diretamente
      if (latitude !== null && longitude !== null) {
        const position = { lat: latitude, lng: longitude }
        mapInstanceRef.current.setCenter(position)

        // Adicionar marcador
        markerRef.current = new google.maps.Marker({
          position,
          map: mapInstanceRef.current,
          title: storeName,
        })
      }
      // Se temos um endereço, mas não coordenadas, use o Geocoder para obter as coordenadas
      else if (address) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const position = results[0].geometry.location
            mapInstanceRef.current?.setCenter(position)

            // Adicionar marcador
            markerRef.current = new google.maps.Marker({
              position,
              map: mapInstanceRef.current,
              title: storeName,
            })
          } else {
            console.error("Geocode falhou devido a: " + status)
          }
        })
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
    }
  }, [latitude, longitude, address, storeName, zoom])

  return (
    <div className="relative w-full h-full min-h-[300px]">
      <div ref={mapRef} className="w-full h-full rounded-md" />
      {!latitude && !longitude && !address && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
          <div className="flex items-center gap-2">
            <Loader className="h-4 w-4 animate-spin" />
            <span>Carregando mapa...</span>
          </div>
        </div>
      )}
    </div>
  )
}
