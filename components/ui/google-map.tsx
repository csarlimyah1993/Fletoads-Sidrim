"use client"

import { useEffect, useRef } from "react"

// Declaração global para o tipo do Google Maps
declare global {
  interface Window {
    google: any
    initGoogleMap?: () => void
  }
}

export interface GoogleMapProps {
  apiKey?: string
  defaultCenter: { lat: number; lng: number }
  defaultZoom: number
  markers?: Array<{
    position: { lat: number; lng: number }
    title: string
  }>
}

export function GoogleMap({ apiKey, defaultCenter, defaultZoom, markers = [] }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)

  useEffect(() => {
    // Função para carregar o script do Google Maps
    const loadGoogleMapsScript = () => {
      if (window.google?.maps) {
        initMap()
        return
      }

      const script = document.createElement("script")
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initGoogleMap`
      script.async = true
      script.defer = true
      document.head.appendChild(script)

      window.initGoogleMap = initMap
    }

    // Função para inicializar o mapa
    const initMap = () => {
      if (!mapRef.current) return

      const mapOptions = {
        center: defaultCenter,
        zoom: defaultZoom,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      }

      const map = new window.google.maps.Map(mapRef.current, mapOptions)
      mapInstanceRef.current = map

      // Adicionar marcadores
      markers.forEach((marker) => {
        new window.google.maps.Marker({
          position: marker.position,
          map,
          title: marker.title,
        })
      })
    }

    loadGoogleMapsScript()

    // Cleanup
    return () => {
      if (window.initGoogleMap) {
        window.initGoogleMap = undefined
      }
    }
  }, [apiKey, defaultCenter, defaultZoom, markers])

  return <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
}
