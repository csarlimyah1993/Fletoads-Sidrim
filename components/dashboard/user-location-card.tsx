"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Loader2 } from "lucide-react"
import { GoogleMap } from "@/components/ui/google-map"

interface UserLocation {
  endereco: {
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
    cep?: string
    complemento?: string
    latitude?: number
    longitude?: number
  }
  nome?: string
}

export function UserLocationCard() {
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserLocation = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Buscar dados do perfil do usuário
        const response = await fetch("/api/usuario/perfil")

        if (!response.ok) {
          throw new Error(`Erro ao buscar perfil: ${response.status}`)
        }

        const userData = await response.json()

        if (!userData.perfil?.endereco) {
          setUserLocation({
            endereco: {
              rua: "Endereço não configurado",
              cidade: "Configure seu endereço no perfil",
            },
            nome: userData.nome || "Meu Perfil",
          })
          return
        }

        setUserLocation({
          endereco: userData.perfil.endereco,
          nome: userData.nome || "Meu Perfil",
        })
      } catch (err) {
        console.error("Erro ao buscar localização do usuário:", err)
        setError("Não foi possível carregar sua localização")

        // Usar dados de exemplo em caso de erro
        setUserLocation({
          endereco: {
            rua: "Endereço não disponível",
            cidade: "Verifique sua conexão",
          },
          nome: "Meu Perfil",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserLocation()
  }, [])

  const formatAddress = (endereco: UserLocation["endereco"]) => {
    const parts = []
    if (endereco.rua) parts.push(endereco.rua + (endereco.numero ? `, ${endereco.numero}` : ""))
    if (endereco.bairro) parts.push(endereco.bairro)
    if (endereco.cidade) parts.push(endereco.cidade)
    if (endereco.estado) parts.push(endereco.estado)
    if (endereco.cep) parts.push(endereco.cep)

    return parts.join(", ")
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Sua Localização</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-[200px] bg-gray-100 rounded-md">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!userLocation) return null

  const hasCoordinates = userLocation.endereco.latitude !== undefined && userLocation.endereco.longitude !== undefined
  const formattedAddress = formatAddress(userLocation.endereco)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Sua Localização</CardTitle>
        <CardDescription className="flex items-center">
          <MapPin className="h-3.5 w-3.5 mr-1" />
          {userLocation.endereco.cidade && userLocation.endereco.estado
            ? `${userLocation.endereco.cidade}, ${userLocation.endereco.estado}`
            : "Localização não configurada"}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        {hasCoordinates ? (
          <div className="h-[200px] w-full overflow-hidden rounded-md">
            <GoogleMap
              latitude={userLocation.endereco.latitude || null}
              longitude={userLocation.endereco.longitude || null}
              address={formattedAddress}
              storeName={userLocation.nome || "Minha Localização"}
              zoom={15}
            />
          </div>
        ) : formattedAddress ? (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">{formattedAddress}</p>
            <p className="text-xs text-muted-foreground mt-2">
              Configure coordenadas geográficas no perfil para visualizar no mapa.
            </p>
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-muted-foreground">
              Nenhum endereço cadastrado. Atualize seu perfil para adicionar sua localização.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
