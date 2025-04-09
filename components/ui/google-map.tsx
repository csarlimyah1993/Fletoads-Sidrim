"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"
import { AlertCircle, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGoogleMaps } from "@/hooks/use-google-maps"

interface GoogleMapProps {
  latitude: number | null
  longitude: number | null
  address?: string
  storeName?: string
  zoom?: number
  height?: string
  className?: string
}

export function GoogleMap({
  latitude,
  longitude,
  address,
  storeName = "Loja",
  zoom = 15,
  height = "400px",
  className = "",
}: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null)
  const [mapError, setMapError] = useState(false)
  const { isLoaded, loadError } = useGoogleMaps()

  // Inicializar o mapa quando o script estiver carregado
  useEffect(() => {
    // Verificar se temos coordenadas válidas ou um endereço
    if ((!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) && !address) {
      return
    }

    // Se o script não foi carregado ou houve erro, não prosseguir
    if (!isLoaded || loadError) {
      return
    }

    // Se o elemento de referência não existe, não prosseguir
    if (!mapRef.current || !window.google || !window.google.maps) {
      return
    }

    // Se já temos uma instância do mapa, não criar outra
    if (mapInstance) {
      return
    }

    try {
      const google = window.google

      // Criar o mapa
      const mapOptions = {
        zoom: zoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
        zoomControl: true,
      }

      const map = new google.maps.Map(mapRef.current, mapOptions)
      setMapInstance(map)

      // Se temos coordenadas, usamos elas diretamente
      if (latitude && longitude && !isNaN(latitude) && !isNaN(longitude)) {
        const position = { lat: latitude, lng: longitude }
        map.setCenter(position)

        // Adicionar um marcador
        const marker = new google.maps.Marker({
          position: position,
          map: map,
          title: storeName,
          animation: google.maps.Animation.DROP,
        })

        // Adicionar uma janela de informações
        if (storeName) {
          const infoWindow = new google.maps.InfoWindow({
            content: `<div style="font-weight: bold;">${storeName}</div>`,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })
        }
      }
      // Se não temos coordenadas mas temos um endereço, usamos o geocoding
      else if (address) {
        const geocoder = new google.maps.Geocoder()
        geocoder.geocode({ address: address }, (results: any, status: any) => {
          if (status === "OK" && results && results[0]) {
            const position = results[0].geometry.location
            map.setCenter(position)

            // Adicionar um marcador
            const marker = new google.maps.Marker({
              position: position,
              map: map,
              title: storeName,
              animation: google.maps.Animation.DROP,
            })

            // Adicionar uma janela de informações
            if (storeName) {
              const infoWindow = new google.maps.InfoWindow({
                content: `<div style="font-weight: bold;">${storeName}</div>`,
              })

              marker.addListener("click", () => {
                infoWindow.open(map, marker)
              })
            }
          } else {
            console.error("Geocode falhou:", status)
            setMapError(true)
          }
        })
      }
    } catch (error) {
      console.error("Erro ao inicializar o mapa:", error)
      setMapError(true)
    }

    // Cleanup
    return () => {
      // Não precisamos limpar o mapa, pois o elemento será removido do DOM
    }
  }, [isLoaded, loadError, latitude, longitude, address, zoom, storeName, mapInstance])

  // Se não temos coordenadas válidas nem endereço, mostrar uma mensagem
  if ((!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) && !address) {
    return (
      <Card className={`flex flex-col items-center justify-center ${className}`} style={{ height }}>
        <div className="p-6 text-center">
          <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm mb-4">
            Localização não disponível. Adicione coordenadas de latitude e longitude nas configurações da loja.
          </p>
          <Button variant="outline" size="sm" asChild>
            <a href="/dashboard/perfil-da-loja/editar">Adicionar Localização</a>
          </Button>
        </div>
      </Card>
    )
  }

  // Se a API key está faltando ou houve erro ao carregar o script
  if (loadError) {
    return (
      <Card className={`flex flex-col items-center justify-center ${className}`} style={{ height }}>
        <div className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
          <p className="text-muted-foreground text-sm mb-2">
            API key do Google Maps não configurada ou erro ao carregar o script. Verifique as variáveis de ambiente.
          </p>
          <p className="text-xs text-muted-foreground">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</p>
        </div>
      </Card>
    )
  }

  // Se ocorreu um erro ao inicializar o mapa, mostrar uma mensagem
  if (mapError) {
    return (
      <Card className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm p-4 text-center">
          Não foi possível carregar o mapa. Verifique sua conexão com a internet ou tente novamente mais tarde.
        </p>
      </Card>
    )
  }

  // Se o script ainda está carregando, mostrar um estado de carregamento
  if (!isLoaded) {
    return (
      <Card className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm">Carregando mapa...</p>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div ref={mapRef} style={{ width: "100%", height }} />
    </Card>
  )
}

