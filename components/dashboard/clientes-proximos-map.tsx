"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Navigation, Search, ZoomIn, ZoomOut } from "lucide-react"

export function ClientesProximosMap() {
  const [zoom, setZoom] = useState(1)

  // Dados simulados de clientes próximos
  const clientesProximos = [
    { id: 1, nome: "Maria Silva", distancia: 0.8, endereco: "Rua das Flores, 123" },
    { id: 2, nome: "João Oliveira", distancia: 1.2, endereco: "Av. Principal, 456" },
    { id: 3, nome: "Ana Santos", distancia: 2.5, endereco: "Rua do Comércio, 789" },
    { id: 4, nome: "Carlos Pereira", distancia: 3.1, endereco: "Travessa da Paz, 101" },
    { id: 5, nome: "Lúcia Ferreira", distancia: 4.7, endereco: "Alameda das Árvores, 202" },
  ]

  return (
    <div className="space-y-4">
      <div className="relative h-[200px] bg-muted rounded-lg overflow-hidden">
        {/* Mapa simulado */}
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <div className="text-muted-foreground">Mapa de clientes próximos</div>

          {/* Pins simulados */}
          {clientesProximos.map((cliente, index) => (
            <div
              key={cliente.id}
              className="absolute w-3 h-3 bg-primary rounded-full"
              style={{
                top: `${30 + index * 15}%`,
                left: `${20 + index * 12}%`,
                transform: "translate(-50%, -50%)",
              }}
            />
          ))}

          {/* Pin central (sua loja) */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <MapPin className="h-6 w-6 text-destructive" />
          </div>
        </div>

        {/* Controles do mapa */}
        <div className="absolute top-2 right-2 flex flex-col gap-1">
          <Button variant="secondary" size="icon" onClick={() => setZoom(Math.min(zoom + 0.2, 2))}>
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="secondary" size="icon" onClick={() => setZoom(Math.max(zoom - 0.2, 0.5))}>
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>

        <div className="absolute top-2 left-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar endereço..."
              className="h-9 rounded-md border border-input bg-background px-8 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 w-[180px]"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-medium">Clientes próximos:</h4>
        <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
          {clientesProximos.map((cliente) => (
            <Card key={cliente.id} className="p-2">
              <CardContent className="p-0 flex justify-between items-center">
                <div>
                  <p className="text-sm font-medium">{cliente.nome}</p>
                  <p className="text-xs text-muted-foreground">{cliente.endereco}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    <span>{cliente.distancia} km</span>
                  </Badge>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
}

