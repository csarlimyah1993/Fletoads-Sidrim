"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, AlertTriangle } from "lucide-react"
import { GoogleMap } from "@/components/ui/google-map"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"

interface Location {
  endereco?: string
  cidade?: string
  estado?: string
  cep?: string
  latitude?: number
  longitude?: number
}

export function UserLocationCard() {
  const { data: session, status } = useSession()
  const [state, setState] = useState<{
    loading: boolean
    error: string | null
    apiKeyMissing: boolean
    location: Location | null
  }>({
    loading: true,
    error: null,
    apiKeyMissing: false,
    location: null,
  })

  useEffect(() => {
    async function fetchLocation() {
      if (status === "loading") return

      if (status !== "authenticated") {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: "Usuário não autenticado",
        }))
        return
      }

      try {
        console.log("Sessão do usuário:", session)

        const response = await fetch("/api/dashboard/loja")
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || "Erro ao buscar localização")
        }

        if (!data.loja) {
          throw new Error("Loja não encontrada")
        }

        console.log("Dados da loja recebidos:", data.loja)

        // Extrair informações de endereço da loja
        let endereco = ""
        let cidade = ""
        let estado = ""
        let cep = ""
        let latitude = undefined
        let longitude = undefined

        // Verificar se temos endereço formatado
        if (data.loja.enderecoFormatado && typeof data.loja.enderecoFormatado === "string") {
          endereco = data.loja.enderecoFormatado
          console.log("Usando endereço formatado:", endereco)
        }

        // Extrair informações do objeto de endereço
        if (data.loja.endereco) {
          if (typeof data.loja.endereco === "string") {
            endereco = data.loja.endereco
          } else {
            // É um objeto de endereço
            const endObj = data.loja.endereco

            // Construir o endereço completo
            const parts = []
            if (endObj.rua) parts.push(endObj.rua)
            if (endObj.numero) parts.push(endObj.numero)
            if (endObj.complemento) parts.push(endObj.complemento)
            if (endObj.bairro) parts.push(endObj.bairro)

            endereco = parts.join(", ")
            cidade = endObj.cidade || ""
            estado = endObj.estado || ""
            cep = endObj.cep || ""

            // Verificar coordenadas
            latitude = endObj.latitude
            longitude = endObj.longitude

            console.log("Endereço extraído do objeto:", {
              endereco,
              cidade,
              estado,
              cep,
              latitude,
              longitude,
            })
          }
        }

        const location: Location = {
          endereco,
          cidade,
          estado,
          cep,
          latitude,
          longitude,
        }

        // Se não tiver coordenadas, tentar geocodificar o endereço
        if ((!location.latitude || !location.longitude) && (location.endereco || location.cidade || location.estado)) {
          try {
            await geocodeAddress(location)
          } catch (geocodeError: any) {
            console.error("Erro na geocodificação:", geocodeError)

            // Verificar se o erro é devido à falta de API Key
            if (geocodeError.message === "API Key não configurada") {
              setState((prev) => ({
                ...prev,
                loading: false,
                apiKeyMissing: true,
                location,
              }))
              return
            }
          }
        }

        setState({
          loading: false,
          error: null,
          apiKeyMissing: false,
          location,
        })
      } catch (error) {
        console.error("Erro ao buscar localização:", error)
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Erro desconhecido",
        }))
      }
    }

    fetchLocation()
  }, [session, status])

  async function geocodeAddress(location: Location) {
    try {
      // Construir o endereço para geocodificação
      const addressParts = []
      if (location.endereco) addressParts.push(location.endereco)
      if (location.cidade) addressParts.push(location.cidade)
      if (location.estado) addressParts.push(location.estado)
      if (location.cep) addressParts.push(location.cep)

      // Se não temos partes suficientes para um endereço válido
      if (addressParts.length < 2) {
        console.error("Endereço insuficiente para geocodificação:", addressParts)
        return
      }

      const addressString = addressParts.join(", ")
      console.log("Geocodificando endereço:", addressString)

      const response = await fetch(`/api/geocode?address=${encodeURIComponent(addressString)}`)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erro na resposta da geocodificação:", errorData)

        if (errorData.error === "API Key não configurada") {
          throw new Error("API Key não configurada")
        }

        throw new Error(errorData.error || "Erro na geocodificação")
      }

      const data = await response.json()
      console.log("Resposta da geocodificação:", data)

      if (data.results && data.results.length > 0) {
        const { lat, lng } = data.results[0].geometry.location
        location.latitude = lat
        location.longitude = lng
        console.log("Coordenadas encontradas:", lat, lng)
      } else {
        console.log("Nenhuma coordenada encontrada para o endereço")
      }
    } catch (error) {
      console.error("Erro ao geocodificar endereço:", error)
      throw error
    }
  }

  if (state.loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Localização</CardTitle>
          <CardDescription>Carregando sua localização...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm animate-pulse">Carregando...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm">{state.error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (state.apiKeyMissing) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Localização</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>API Key não configurada</AlertTitle>
            <AlertDescription>
              A chave da API do Google Maps não está configurada. O mapa não pode ser exibido.
            </AlertDescription>
          </Alert>

          {state.location && (
            <div className="space-y-2">
              <div className="flex items-center">
                <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                <span className="text-sm">
                  {state.location.cidade && state.location.estado
                    ? `${state.location.cidade}, ${state.location.estado}`
                    : "Localização"}
                </span>
              </div>

              {state.location.endereco && (
                <div className="text-xs text-muted-foreground">{state.location.endereco}</div>
              )}

              <Button
                variant="outline"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  // Abrir modal ou página de configuração
                  alert(
                    "Para configurar a API Key do Google Maps, adicione a variável de ambiente GOOGLE_MAPS_API_KEY ao seu projeto.",
                  )
                }}
              >
                Configurar API Key
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (!state.location) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm">Nenhuma localização encontrada</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { endereco, cidade, estado, cep, latitude, longitude } = state.location
  const hasCoordinates = latitude && longitude && !isNaN(latitude) && !isNaN(longitude)

  // Formatar o endereço para exibição
  const addressDisplay = [endereco, cidade && estado ? `${cidade}, ${estado}` : cidade || estado, cep]
    .filter(Boolean)
    .join(" - ")

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Localização</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{cidade && estado ? `${cidade}, ${estado}` : "Localização"}</span>
        </div>

        {addressDisplay && <div className="text-xs text-muted-foreground">{addressDisplay}</div>}

        {hasCoordinates ? (
          <GoogleMap latitude={latitude} longitude={longitude} height="180px" className="mt-2 rounded-md border" />
        ) : (
          <div className="h-[180px] w-full flex items-center justify-center bg-muted/30 rounded-md border mt-2">
            <p className="text-sm text-muted-foreground">Coordenadas não disponíveis</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
