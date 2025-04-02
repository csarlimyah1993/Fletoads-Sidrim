"use client"

import { useEffect, useRef, useState } from "react"
import { Card } from "@/components/ui/card"

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
  const [mapLoaded, setMapLoaded] = useState(false)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    // Verificar se temos coordenadas válidas
    if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
      return
    }

    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript = () => {
      // Verificar se o script já foi carregado
      if (window.google && window.google.maps) {
        setMapLoaded(true)
        initMap()
        return
      }

      const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

      // Criar um callback global para quando o script carregar
      const callbackName = "googleMapsInitCallback"
      window[callbackName] = () => {
        setMapLoaded(true)
        initMap()
      }

      // Adicionar o script ao documento
      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&callback=${callbackName}`
      script.async = true
      script.defer = true
      script.onerror = () => {
        setMapError(true)
        console.error("Erro ao carregar o script do Google Maps")
      }
      document.head.appendChild(script)

      return () => {
        // Limpar o callback global quando o componente for desmontado
        window[callbackName] = null
      }
    }

    // Inicializar o mapa quando o script estiver carregado
    const initMap = () => {
      if (!mapRef.current || !window.google || !window.google.maps) {
        return
      }

      try {
        const google = window.google

        // Criar o mapa
        const mapOptions = {
          center: { lat: latitude, lng: longitude },
          zoom: zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        }

        const map = new google.maps.Map(mapRef.current, mapOptions)

        // Adicionar um marcador
        const marker = new google.maps.Marker({
          position: { lat: latitude, lng: longitude },
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
      } catch (error) {
        console.error("Erro ao inicializar o mapa:", error)
        setMapError(true)
      }
    }

    loadGoogleMapsScript()
  }, [latitude, longitude, zoom, storeName])

  // Se não temos coordenadas válidas, mostrar uma mensagem
  if (!latitude || !longitude || isNaN(latitude) || isNaN(longitude)) {
    return (
      <Card className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm p-4 text-center">
          Localização não disponível. Adicione coordenadas de latitude e longitude nas configurações da loja.
        </p>
      </Card>
    )
  }

  // Se ocorreu um erro ao carregar o mapa, mostrar uma mensagem
  if (mapError) {
    return (
      <Card className={`flex items-center justify-center ${className}`} style={{ height }}>
        <p className="text-muted-foreground text-sm p-4 text-center">
          Não foi possível carregar o mapa. Verifique sua conexão com a internet ou tente novamente mais tarde.
        </p>
      </Card>
    )
  }

  return (
    <Card className={className}>
      <div ref={mapRef} style={{ width: "100%", height }} />
    </Card>
  )
}

