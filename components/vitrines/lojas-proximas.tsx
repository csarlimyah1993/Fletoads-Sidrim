"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { MapPin, Navigation, Store, AlertCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface Loja {
  _id: string
  nome: string
  descricao?: string
  logo?: string
  categorias?: string[]
  endereco?: {
    rua?: string
    numero?: string
    bairro?: string
    cidade?: string
    estado?: string
  }
  distancia: number
}

export function LojasProximas() {
  const { toast } = useToast()
  const [lojas, setLojas] = useState<Loja[]>([])
  const [loading, setLoading] = useState(true)
  const [localizando, setLocalizando] = useState(false)
  const [erro, setErro] = useState("")
  const [coordenadas, setCoordenadas] = useState<{ latitude: number; longitude: number } | null>(null)

  useEffect(() => {
    // Verificar se já temos as coordenadas salvas
    const coordenadasSalvas = localStorage.getItem("coordenadas")
    if (coordenadasSalvas) {
      try {
        const coords = JSON.parse(coordenadasSalvas)
        setCoordenadas(coords)
        buscarLojasProximas(coords.latitude, coords.longitude)
      } catch (error) {
        console.error("Erro ao processar coordenadas salvas:", error)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const obterLocalizacao = () => {
    setLocalizando(true)
    setErro("")

    if (!navigator.geolocation) {
      setErro("Geolocalização não é suportada pelo seu navegador")
      setLocalizando(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }

        setCoordenadas(coords)
        localStorage.setItem("coordenadas", JSON.stringify(coords))
        buscarLojasProximas(coords.latitude, coords.longitude)
      },
      (error) => {
        console.error("Erro ao obter localização:", error)
        let mensagem = "Não foi possível obter sua localização"

        switch (error.code) {
          case error.PERMISSION_DENIED:
            mensagem = "Você precisa permitir o acesso à sua localização"
            break
          case error.POSITION_UNAVAILABLE:
            mensagem = "Informações de localização indisponíveis"
            break
          case error.TIMEOUT:
            mensagem = "Tempo esgotado ao tentar obter localização"
            break
        }

        setErro(mensagem)
        setLocalizando(false)

        toast({
          title: "Erro de localização",
          description: mensagem,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  const buscarLojasProximas = async (latitude: number, longitude: number) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/lojas/proximas?latitude=${latitude}&longitude=${longitude}&raio=20`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Erro desconhecido" }))
        throw new Error(errorData.error || `Erro ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()

      if (!data.lojas || !Array.isArray(data.lojas)) {
        throw new Error("Formato de resposta inválido")
      }

      setLojas(data.lojas)
    } catch (error) {
      console.error("Erro ao buscar lojas próximas:", error)
      setErro(error instanceof Error ? error.message : "Erro ao buscar lojas próximas")

      toast({
        title: "Erro",
        description: "Não foi possível carregar as lojas próximas",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLocalizando(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl text-primary">Lojas Próximas</CardTitle>
        <CardDescription>Encontre lojas perto de você</CardDescription>
      </CardHeader>
      <CardContent>
        {!coordenadas ? (
          <div className="text-center py-6">
            <div className="mb-4">
              <Navigation className="h-12 w-12 mx-auto text-primary opacity-80" />
            </div>
            <h3 className="text-lg font-medium mb-2">Compartilhe sua localização</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Para mostrarmos as lojas mais próximas de você, precisamos saber sua localização.
            </p>

            {erro && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{erro}</AlertDescription>
              </Alert>
            )}

            <Button onClick={obterLocalizacao} className="w-full" disabled={localizando}>
              {localizando ? "Localizando..." : "Compartilhar localização"}
            </Button>
          </div>
        ) : loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Buscando lojas próximas...</p>
          </div>
        ) : erro ? (
          <div className="py-6 text-center">
            <AlertCircle className="h-12 w-12 mx-auto text-destructive opacity-80 mb-4" />
            <h3 className="font-medium mb-2">Erro ao buscar lojas</h3>
            <p className="text-sm text-muted-foreground mb-4">{erro}</p>
            <Button variant="outline" onClick={obterLocalizacao}>
              Tentar novamente
            </Button>
          </div>
        ) : lojas.length > 0 ? (
          <div className="space-y-4">
            {lojas.map((loja) => (
              <Card key={loja._id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                  <div className="w-24 h-24 bg-muted flex-shrink-0">
                    {loja.logo ? (
                      <Image
                        src={loja.logo || "/placeholder.svg"}
                        alt={loja.nome}
                        width={96}
                        height={96}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/10">
                        <Store className="h-8 w-8 text-primary/60" />
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex-1">
                    <h3 className="font-medium text-base line-clamp-1">{loja.nome}</h3>

                    {loja.categorias && loja.categorias.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1 mb-2">
                        {loja.categorias.slice(0, 2).map((categoria) => (
                          <Badge key={categoria} variant="outline" className="text-xs">
                            {categoria}
                          </Badge>
                        ))}
                        {loja.categorias.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{loja.categorias.length - 2}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="line-clamp-1">
                        {loja.endereco?.cidade}, {loja.endereco?.estado}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="secondary" className="text-xs">
                        {loja.distancia} km
                      </Badge>
                      <Button asChild size="sm" variant="ghost">
                        <Link href={`/vitrines/${loja._id}`}>Ver loja</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <div className="text-center pt-2">
              <Button variant="outline" size="sm" onClick={obterLocalizacao}>
                Atualizar localização
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Store className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
            <h3 className="font-medium mt-4 mb-1">Nenhuma loja encontrada</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Não encontramos lojas próximas à sua localização atual.
            </p>
            <Button variant="outline" onClick={obterLocalizacao}>
              Tentar novamente
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

