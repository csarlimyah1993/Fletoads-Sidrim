"use client"

import { useState, useEffect, useRef } from "react"
import { useGoogleMaps } from "@/hooks/use-google-maps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2 } from "lucide-react"

interface LocationPickerProps {
  apiKey: string
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void
  initialLocation?: { lat: number; lng: number }
}

export function LocationPicker({ apiKey, onLocationSelect, initialLocation }: LocationPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [address, setAddress] = useState("")
  const [searchAddress, setSearchAddress] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  const { isLoaded, googleMaps, error } = useGoogleMaps(apiKey)

  // Initialize map when Google Maps is loaded
  useEffect(() => {
    if (isLoaded && googleMaps && mapRef.current && !map) {
      const defaultLocation = initialLocation || { lat: -23.5505, lng: -46.6333 } // São Paulo

      const mapInstance = new googleMaps.maps.Map(mapRef.current, {
        center: defaultLocation,
        zoom: 15,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      })

      const markerInstance = new googleMaps.maps.Marker({
        position: defaultLocation,
        map: mapInstance,
        draggable: true,
      })

      setMap(mapInstance)
      setMarker(markerInstance)

      // Get address for initial location
      getAddressFromLatLng(defaultLocation.lat, defaultLocation.lng)

      // Add event listener for marker drag end
      if (markerInstance) {
        markerInstance.addListener("dragend", () => {
          const position = markerInstance.getPosition()
          if (position) {
            getAddressFromLatLng(position.lat(), position.lng())
          }
        })
      }

      // Add click event listener to map
      if (mapInstance) {
        mapInstance.addListener("click", (e: google.maps.MapMouseEvent) => {
          if (e.latLng) {
            markerInstance.setPosition(e.latLng)
            getAddressFromLatLng(e.latLng.lat(), e.latLng.lng())
          }
        })
      }
    }
  }, [isLoaded, mapRef, map, initialLocation, googleMaps])

  // Function to get address from latitude and longitude
  const getAddressFromLatLng = async (lat: number, lng: number) => {
    if (!isLoaded || !googleMaps) return

    try {
      const geocoder = new googleMaps.maps.Geocoder()
      const result = await geocoder.geocode({ location: { lat, lng } })

      if (result.results[0]) {
        setAddress(result.results[0].formatted_address)

        if (onLocationSelect) {
          onLocationSelect({
            lat,
            lng,
            address: result.results[0].formatted_address,
          })
        }
      }
    } catch (error) {
      console.error("Error getting address:", error)
    }
  }

  // Function to search for an address
  const searchForAddress = async () => {
    if (!isLoaded || !map || !marker || !searchAddress || !googleMaps) return

    setIsSearching(true)

    try {
      const geocoder = new googleMaps.maps.Geocoder()
      const result = await geocoder.geocode({ address: searchAddress })

      if (result.results[0] && result.results[0].geometry) {
        const location = result.results[0].geometry.location

        map.setCenter(location)
        marker.setPosition(location)

        setAddress(result.results[0].formatted_address)

        if (onLocationSelect) {
          onLocationSelect({
            lat: location.lat(),
            lng: location.lng(),
            address: result.results[0].formatted_address,
          })
        }
      }
    } catch (error) {
      console.error("Error searching for address:", error)
    } finally {
      setIsSearching(false)
    }
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-red-500">
            Erro ao carregar o Google Maps. Por favor, tente novamente mais tarde.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Selecionar Localização</CardTitle>
        <CardDescription>Escolha a localização do seu negócio no mapa</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder="Buscar endereço..."
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && searchForAddress()}
          />
          <Button onClick={searchForAddress} disabled={isSearching || !searchAddress}>
            {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buscar"}
          </Button>
        </div>

        <div ref={mapRef} className="h-[300px] w-full rounded-md border" style={{ opacity: isLoaded ? 1 : 0.5 }}>
          {!isLoaded && (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>

        {address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="h-4 w-4 mt-0.5 text-primary" />
            <span>{address}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setAddress("")}>
          Limpar
        </Button>
        <Button disabled={!address}>Confirmar Localização</Button>
      </CardFooter>
    </Card>
  )
}
