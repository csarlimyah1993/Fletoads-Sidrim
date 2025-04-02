"use client"

import { useEffect, useRef, useState } from "react"
import { Loader } from "lucide-react"

interface GoogleMapProps {
  latitude?: number | null
  longitude?: number | null
  address?: string | null
  storeName?: string
}

// Declare google variable
declare global {
  interface Window {
    google: any
  }
}

export function GoogleMap({ latitude, longitude, address, storeName }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Load Google Maps API script
    const loadGoogleMapsScript = () => {
      const existingScript = document.getElementById("google-maps-script")
      if (!existingScript) {
        const script = document.createElement("script")
        script.id = "google-maps-script"
        script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBnSrCl0UmrKmK0uVDrVMX7NnNnqg8z1Yk&libraries=places`
        script.async = true
        script.defer = true
        script.onload = initMap
        script.onerror = () => setError("Falha ao carregar o Google Maps")
        document.head.appendChild(script)
      } else {
        initMap()
      }
    }

    // Initialize the map
    const initMap = async () => {
      if (!mapRef.current) return

      try {
        const { Map, Marker, InfoWindow } = window.google.maps

        let mapPosition

        // If we have coordinates, use them directly
        if (latitude && longitude) {
          mapPosition = { lat: latitude, lng: longitude }
        }
        // Otherwise, try to geocode the address
        else if (address) {
          try {
            const geocoder = new window.google.maps.Geocoder()
            const result = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
              geocoder.geocode({ address }, (results, status) => {
                if (status === "OK") {
                  resolve(results)
                } else {
                  reject(new Error(`Geocoding failed: ${status}`))
                }
              })
            })

            if (result && result[0]?.geometry?.location) {
              mapPosition = {
                lat: result[0].geometry.location.lat(),
                lng: result[0].geometry.location.lng(),
              }
            } else {
              throw new Error("Não foi possível encontrar o endereço no mapa")
            }
          } catch (geocodeError) {
            console.error("Geocoding error:", geocodeError)
            setError("Não foi possível localizar o endereço no mapa")
            setIsLoading(false)
            return
          }
        } else {
          setError("Dados de localização insuficientes")
          setIsLoading(false)
          return
        }

        // Create the map
        const map = new Map(mapRef.current, {
          center: mapPosition,
          zoom: 15,
          mapTypeControl: false,
          fullscreenControl: true,
          streetViewControl: false,
        })

        // Add a marker
        const marker = new Marker({
          position: mapPosition,
          map,
          title: storeName || "Localização da Loja",
          animation: window.google.maps.Animation.DROP,
        })

        // Add info window with store name
        if (storeName) {
          const infoWindow = new InfoWindow({
            content: `<div style="font-weight: 500; padding: 5px;">${storeName}</div>`,
          })

          marker.addListener("click", () => {
            infoWindow.open(map, marker)
          })

          // Open info window by default
          infoWindow.open(map, marker)
        }

        setIsLoading(false)
      } catch (err) {
        console.error("Error initializing map:", err)
        setError("Erro ao inicializar o mapa")
        setIsLoading(false)
      }
    }

    loadGoogleMapsScript()

    return () => {
      // Cleanup if needed
    }
  }, [latitude, longitude, address, storeName])

  if (error) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted/30 rounded-md">
        <p className="text-muted-foreground">{error}</p>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full rounded-md" />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
          <div className="flex flex-col items-center gap-2">
            <Loader className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Carregando mapa...</p>
          </div>
        </div>
      )}
    </div>
  )
}

