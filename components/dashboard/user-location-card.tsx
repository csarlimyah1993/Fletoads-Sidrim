"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin } from 'lucide-react'
import { GoogleMap } from "@/components/ui/google-map"

interface UserLocationCardProps {
  loja?: any
}

export default function UserLocationCard({ loja }: UserLocationCardProps) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If loja is provided directly, we don't need to fetch
    if (loja) {
      setLoading(false)
    }
  }, [loja])

  // Extract coordinates from loja object
  const getCoordinates = () => {
    if (!loja) return null

    // Try to get coordinates from different possible formats
    if (loja.endereco?.coordinates?.lat && loja.endereco?.coordinates?.lng) {
      return {
        latitude: loja.endereco.coordinates.lat,
        longitude: loja.endereco.coordinates.lng
      }
    } else if (loja.endereco?.latitude && loja.endereco?.longitude) {
      return {
        latitude: loja.endereco.latitude,
        longitude: loja.endereco.longitude
      }
    } else {
      setError("Coordenadas não disponíveis")
      return null
    }
  }

  const coordinates = getCoordinates()
  const address = loja?.endereco?.enderecoFormatado || loja?.enderecoFormatado || 
                 (loja?.endereco ? `${loja.endereco.rua || ''}, ${loja.endereco.numero || ''}, ${loja.endereco.cidade || ''}, ${loja.endereco.estado || ''}` : null)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Localização da Loja</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-[150px] w-full" />
        ) : error ? (
          <div className="flex flex-col items-center justify-center h-[150px] bg-muted/30 rounded-md">
            <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">{error}</p>
            <button className="text-xs text-primary mt-2 hover:underline">Atualizar endereço</button>
          </div>
        ) : coordinates ? (
          <div className="h-[150px] w-full rounded-md overflow-hidden">
            <GoogleMap 
              latitude={coordinates.latitude} 
              longitude={coordinates.longitude} 
              address={address}
              zoom={15}
              height="150px"
              storeName={loja?.nome || "Minha Loja"}
            />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[150px] bg-muted/30 rounded-md">
            <MapPin className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Localização não configurada</p>
            <button className="text-xs text-primary mt-2 hover:underline">Configurar endereço</button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}