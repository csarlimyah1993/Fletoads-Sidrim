"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import { useSession } from "next-auth/react"

interface UserLocation {
  cidade: string
  estado: string
  pais?: string
}

export function UserLocationCard() {
  const [location, setLocation] = useState<UserLocation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchUserLocation = async () => {
      if (!session?.user?.id) return

      try {
        const response = await fetch(`/api/usuarios/${session.user.id}`)

        if (!response.ok) {
          throw new Error(`Erro ao buscar perfil: ${response.status}`)
        }

        const userData = await response.json()
        console.log("Dados do usuário:", userData) // Log para debug

        // Verificar se o usuário tem endereço cadastrado
        if (userData.endereco && userData.endereco.cidade && userData.endereco.estado) {
          setLocation({
            cidade: userData.endereco.cidade,
            estado: userData.endereco.estado,
            pais: userData.endereco.pais || "Brasil",
          })
        } else {
          setError("Endereço não cadastrado")
        }
      } catch (error) {
        console.error("Erro ao buscar localização do usuário:", error)
        setError("Não foi possível carregar a localização.")
      } finally {
        setLoading(false)
      }
    }

    fetchUserLocation()
  }, [session])

  if (loading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
            <span className="text-sm animate-pulse">Carregando localização...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Localização</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" />
            <span className="text-sm">Endereço não cadastrado</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Localização</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {location?.cidade}, {location?.estado}
            {location?.pais && location.pais !== "Brasil" ? `, ${location.pais}` : ""}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
