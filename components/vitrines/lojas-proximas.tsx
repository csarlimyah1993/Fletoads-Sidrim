"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Store, ChevronRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface Loja {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  endereco?: {
    cidade?: string
    estado?: string
  }
  distancia?: number
  categorias?: string[]
}

interface LojasProximasProps {
  defaultLatitude?: number
  defaultLongitude?: number
  defaultRaio?: number
  compact?: boolean
}

export function LojasProximas({
  defaultLatitude = -25.4963406,
  defaultLongitude = -49.1842516,
  defaultRaio = 20,
  compact = false,
}: LojasProximasProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lojas, setLojas] = useState<Loja[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLojas, setFilteredLojas] = useState<Loja[]>([])
  const [userLocation, setUserLocation] = useState({
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  })
  const [raio, setRaio] = useState(defaultRaio)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
        },
        (error) => {
          console.error("Erro ao obter localização:", error)
        },
      )
    }
  }, [])

  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      buscarLojasProximas()
    }
  }, [userLocation, raio])

  useEffect(() => {
    if (!lojas) return

    if (!searchTerm) {
      setFilteredLojas(lojas)
      return
    }

    const filtered = lojas.filter(
      (loja) =>
        loja.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loja.descricao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        loja.categorias?.some((cat) => cat.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    setFilteredLojas(filtered)
  }, [searchTerm, lojas])

  const buscarLojasProximas = async () => {
    try {
      setLoading(true)
      setError(null)

      if (!userLocation.latitude || !userLocation.longitude) {
        throw new Error("Localização não disponível. Por favor, permita o acesso à sua localização.")
      }

      const response = await fetch(
        `/api/lojas/proximas?latitude=${userLocation.latitude}&longitude=${userLocation.longitude}&raio=${raio}`,
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      setLojas(data.lojas || [])
      setFilteredLojas(data.lojas || [])
    } catch (err) {
      console.error("Erro ao buscar lojas próximas:", err)
      setError(err instanceof Error ? err.message : "Erro ao buscar lojas próximas")
      setLojas([])
      setFilteredLojas([])
    } finally {
      setLoading(false)
    }
  }

  const handleRaioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number.parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setRaio(value)
    }
  }

  // Versão compacta para mobile
  if (compact) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Lojas próximas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button 
            variant="outline" 
            className="w-full" 
            size="sm"
            onClick={buscarLojasProximas}
            disabled={loading}
          >
            {loading ? "Buscando..." : "Ver lojas próximas"}
          </Button>
          {error && (
            <p className="text-sm text-destructive mt-2">{error}</p>
          )}
        </CardContent>
      </Card>
    )
  }

  // Versão completa para desktop
  return (
    <div className="space-y-6">
      {/* Barra de busca e filtros */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex-1 w-full">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar lojas..."
                className="pl-9 h-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          {/* Botão para mostrar/ocultar filtros em mobile */}
          <Button 
            variant="outline" 
            className="md:hidden w-full" 
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar filtros' : 'Mostrar filtros'}
          </Button>
        </div>

        {/* Filtros - sempre visível em desktop, condicional em mobile */}
        <div className={`${showFilters ? 'block' : 'hidden'} md:block`}>
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Label htmlFor="raio" className="text-sm whitespace-nowrap">
                Raio:
              </Label>
              <Input
                id="raio"
                type="number"
                min="1"
                max="100"
                className="w-20 h-9"
                value={raio}
                onChange={handleRaioChange}
              />
              <span className="text-sm text-muted-foreground">km</span>
            </div>
            <Button 
              onClick={buscarLojasProximas} 
              size="sm" 
              className="h-9 w-full md:w-auto" 
              disabled={loading}
            >
              {loading ? "Buscando..." : "Atualizar"}
            </Button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive text-destructive p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {/* Grid de lojas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden h-full">
              <div className="aspect-square bg-muted/50 animate-pulse" />
              <CardContent className="p-4 space-y-2">
                <div className="h-5 bg-muted/50 rounded animate-pulse" />
                <div className="h-4 bg-muted/50 rounded animate-pulse w-3/4" />
              </CardContent>
            </Card>
          ))
        ) : filteredLojas.length > 0 ? (
          filteredLojas.map((loja) => (
            <Link href={`/vitrines/${loja._id}`} key={loja._id} className="group">
              <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-lg group-hover:border-primary">
                <div className="aspect-square relative bg-muted/50">
                  {loja.logo ? (
                    <Image
                      src={loja.logo}
                      alt={loja.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Store className="h-12 w-12 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <CardTitle className="text-lg line-clamp-1">{loja.nome}</CardTitle>
                  {loja.descricao && (
                    <CardDescription className="line-clamp-2 mt-1 text-sm">
                      {loja.descricao}
                    </CardDescription>
                  )}
                  <div className="mt-4 space-y-2">
                    {loja.endereco && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                        <span className="line-clamp-1">
                          {loja.endereco.cidade}
                          {loja.endereco.estado && `, ${loja.endereco.estado}`}
                        </span>
                      </div>
                    )}
                    {loja.distancia !== undefined && (
                      <div className="flex items-center text-sm font-medium text-primary">
                        <span>{loja.distancia.toFixed(1)} km de distância</span>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 border-t">
                  <Button variant="link" size="sm" className="ml-auto gap-1">
                    Ver loja
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Store className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma loja encontrada</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm
                ? "Tente ajustar sua busca ou aumentar o raio de pesquisa."
                : "Não encontramos lojas próximas à sua localização."}
            </p>
            <Button onClick={buscarLojasProximas}>Tentar novamente</Button>
          </div>
        )}
      </div>
    </div>
  )
}