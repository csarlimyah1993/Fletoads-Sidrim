"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Store } from "lucide-react"
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
}

export function LojasProximas({
  defaultLatitude = -25.4963406, // Valor padrão para Curitiba
  defaultLongitude = -49.1842516, // Valor padrão para Curitiba
  defaultRaio = 20,
}: LojasProximasProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lojas, setLojas] = useState<Loja[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filteredLojas, setFilteredLojas] = useState<Loja[]>([])
  const [userLocation, setUserLocation] = useState<{
    latitude: number
    longitude: number
  }>({
    latitude: defaultLatitude,
    longitude: defaultLongitude,
  })
  const [raio, setRaio] = useState(defaultRaio)

  // Efeito para buscar a localização do usuário
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
          // Mantém a localização padrão
        },
      )
    }
  }, [])

  // Efeito para buscar lojas quando a localização mudar
  useEffect(() => {
    if (userLocation.latitude && userLocation.longitude) {
      buscarLojasProximas()
    }
  }, [userLocation, raio])

  // Efeito para filtrar lojas com base no termo de busca
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

      // Garantir que temos latitude e longitude
      if (!userLocation.latitude || !userLocation.longitude) {
        throw new Error(
          "Localização não disponível. Por favor, permita o acesso à sua localização ou insira manualmente.",
        )
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 w-full">
          <Label htmlFor="search" className="sr-only">
            Buscar lojas
          </Label>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              id="search"
              type="search"
              placeholder="Buscar por nome, categoria ou descrição..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="raio" className="whitespace-nowrap">
            Raio (km):
          </Label>
          <Input id="raio" type="number" min="1" max="100" className="w-20" value={raio} onChange={handleRaioChange} />
        </div>
        <Button onClick={buscarLojasProximas} disabled={loading}>
          {loading ? "Buscando..." : "Atualizar"}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {loading ? (
          // Esqueletos de carregamento
          Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="h-40 bg-gray-200 animate-pulse" />
              <CardContent className="p-4">
                <div className="h-5 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))
        ) : filteredLojas.length > 0 ? (
          filteredLojas.map((loja) => (
            <Link href={`/vitrines/${loja._id}`} key={loja._id}>
              <Card className="overflow-hidden h-full hover:shadow-md transition-shadow cursor-pointer">
                <div className="h-40 relative bg-gray-100">
                  {loja.logo ? (
                    <Image
                      src={loja.logo || "/placeholder.svg"}
                      alt={loja.nome}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <Store className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <h3 className="font-medium text-lg mb-1">{loja.nome}</h3>
                  {loja.endereco && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
                      <span className="truncate">
                        {loja.endereco.cidade}
                        {loja.endereco.cidade && loja.endereco.estado ? ", " : ""}
                        {loja.endereco.estado}
                      </span>
                    </div>
                  )}
                  {loja.distancia !== undefined && (
                    <div className="text-sm font-medium text-blue-600">{loja.distancia.toFixed(1)} km de distância</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12">
            <Store className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhuma loja encontrada</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm
                ? "Tente ajustar seus termos de busca ou aumentar o raio de pesquisa."
                : "Não encontramos lojas próximas à sua localização atual."}
            </p>
            <Button onClick={buscarLojasProximas}>Tentar novamente</Button>
          </div>
        )}
      </div>
    </div>
  )
}
