"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, Edit, Eye, Heart, MessageSquare, Share2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CriarPanfletoButton } from "@/components/criar-panfleto-button"

export function EventosContentUpdated() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Dados simulados dos eventos próximos
  const eventosProximos = [
    {
      id: "1",
      title: "Black Friday",
      period: "Cadastro de 01/10/2023 até 20/11/2023",
      description: "Cadastre sua empresa e para participar do evento!",
      image: "/placeholder.svg?height=300&width=500",
      color: "bg-gradient-to-r from-purple-900 to-yellow-500",
      badge: "",
    },
    {
      id: "2",
      title: "Dia Livre de Impostos - DLI",
      period: "Cadastro de 28/09/2023 até 05/10/2023",
      description: "Cadastre sua empresa e para participar do evento!",
      image: "/placeholder.svg?height=300&width=500",
      color: "bg-blue-900",
      badge: "NOVO",
    },
    {
      id: "3",
      title: "Passo A Paço 2023",
      period: "Cadastro de 28/08/2023 até 01/08/2023",
      description: "#Soumanaus. Cadastre sua empresa e para participar do evento!",
      image: "/placeholder.svg?height=300&width=500",
      color: "bg-gradient-to-r from-yellow-300 to-green-400",
      badge: "EVENTO",
    },
  ]

  // Dados simulados dos eventos ativos
  const eventosAtivos = [
    {
      id: "3",
      title: "Passo A Paço 2023 #Soumanaus",
      period: "De 07/08/2023 até 10/08/2023",
      image: "/placeholder.svg?height=48&width=48",
      panfletosCadastrados: 3,
      panfletosTotal: 10,
      panfletos: [
        {
          id: 301,
          title: "Chopp 300ml Em Dobro Cervejaria Rio Negro",
          price: "9,80",
          originalPrice: "12,50",
          image: "/placeholder.svg?height=200&width=200",
          badge: "PAÇO A PAÇO",
          stats: { views: 807, likes: 173, shares: 56, comments: 116 },
        },
        {
          id: 302,
          title: "Porção 3 Mini-Burguers Com Queijo E Salada",
          price: "24,50",
          originalPrice: "29,90",
          image: "/placeholder.svg?height=200&width=200",
          badge: "PAÇO A PAÇO",
          stats: { views: 807, likes: 173, shares: 56, comments: 116 },
        },
        {
          id: 303,
          title: "Chopp 500ml Pilsen Cervejaria Rio Negro",
          price: "12,50",
          originalPrice: "15,00",
          image: "/placeholder.svg?height=200&width=200",
          badge: "PAÇO A PAÇO",
          stats: { views: 807, likes: 173, shares: 56, comments: 116 },
        },
      ],
    },
  ]

  // Dados simulados dos eventos cadastrados
  const eventosCadastrados = [
    {
      id: "1",
      title: "Black Friday 2023",
      period: "De 06/11/2023 até 10/11/2023",
      image: "/placeholder.svg?height=48&width=48",
      panfletosCadastrados: 3,
      panfletosTotal: 10,
      panfletos: [
        {
          id: 101,
          title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
          price: "159,90",
          originalPrice: "189,90",
          image: "/placeholder.svg?height=200&width=200",
          badge: "BLACK FRIDAY",
          stats: { views: 807, likes: 173, shares: 56, comments: 116 },
        },
        {
          id: 102,
          title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
          price: "159,90",
          originalPrice: "189,90",
          image: "/placeholder.svg?height=200&width=200",
          badge: "BLACK FRIDAY",
          stats: { views: 807, likes: 173, shares: 56, comments: 116 },
        },
        {
          id: 103,
          title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
          price: "159,90",
          originalPrice: "189,90",
          image: "/placeholder.svg?height=200&width=200",
          badge: "BLACK FRIDAY",
          stats: { views: 807, likes: 173, shares: 56, comments: 116 },
        },
      ],
    },
  ]

  // Número de eventos a mostrar por slide
  const eventsPerSlide = 3

  // Calcular o número total de slides
  const totalSlides = Math.ceil(eventosProximos.length / eventsPerSlide)

  // Obter os eventos para o slide atual
  const getCurrentEvents = () => {
    const startIndex = currentSlide * eventsPerSlide
    return eventosProximos.slice(startIndex, startIndex + eventsPerSlide)
  }

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? totalSlides - 1 : prev - 1))
  }

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === totalSlides - 1 ? 0 : prev + 1))
  }

  // Fix: Add type annotation to the index parameter
  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

  const handleSaibaMais = (id: string) => {
    router.push(`/eventos/${id}`)
  }

  const handleEditPanfleto = (panfletoId: number) => {
    router.push(`/panfletos/${panfletoId}/editar`)
  }

  const handleVerMaisEventos = () => {
    // Implementar lógica para ver mais eventos
    console.log("Ver mais eventos")
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Eventos Próximos */}
      <div className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Eventos Próximos</h1>
          <Button variant="outline" onClick={handleVerMaisEventos}>
            Ver Mais Eventos
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {getCurrentEvents().map((evento) => (
            <EventoProximoCard
              key={evento.id}
              id={evento.id}
              title={evento.title}
              period={evento.period}
              description={evento.description}
              image={evento.image}
              color={evento.color}
              badge={evento.badge}
              onSaibaMais={() => handleSaibaMais(evento.id)}
            />
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handlePrevSlide}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex gap-1">
              {Array.from({ length: totalSlides }).map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-blue-600" : "bg-gray-300"}`}
                  onClick={() => handleDotClick(index)}
                />
              ))}
            </div>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={handleNextSlide}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Eventos Ativos */}
      {eventosAtivos.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Eventos Ativos</h2>

          {eventosAtivos.map((evento) => (
            <div key={evento.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-yellow-400 rounded-lg overflow-hidden">
                    <Image src={evento.image || "/placeholder.svg"} alt={evento.title} width={48} height={48} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{evento.period}</p>
                    <h3 className="text-lg font-bold">{evento.title}</h3>
                  </div>
                  <div className="ml-auto">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Panfletos Cadastrados</p>
                      <p className="text-xl font-bold">
                        <span className="text-blue-600">{evento.panfletosCadastrados}</span>
                        <span className="text-gray-400">/{evento.panfletosTotal}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Create Flyer Card */}
                  <div className="bg-white rounded-lg border p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-2">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6.66669V33.3334"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.66669 20H33.3334"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <CriarPanfletoButton variant="ghost" eventoId={evento.id} />
                  </div>

                  {/* Event Flyers */}
                  {evento.panfletos.map((panfleto) => (
                    <div key={panfleto.id} className="bg-white rounded-lg border overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={panfleto.image || "/placeholder.svg"}
                          alt={panfleto.title}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute left-2 top-2 bg-green-500">{panfleto.badge}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full shadow-sm"
                          onClick={() => handleEditPanfleto(panfleto.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500">R$ {panfleto.originalPrice}</p>
                        <p className="text-lg font-bold text-orange-500">R$ {panfleto.price}</p>
                        <h3 className="text-sm font-medium line-clamp-2 h-10 mt-1">{panfleto.title}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{panfleto.stats.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{panfleto.stats.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            <span>{panfleto.stats.shares}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{panfleto.stats.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mx-4 mb-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(evento.panfletosCadastrados / evento.panfletosTotal) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Eventos Cadastrados */}
      {eventosCadastrados.length > 0 && (
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Eventos Cadastrados</h2>

          {eventosCadastrados.map((evento) => (
            <div key={evento.id} className="bg-white rounded-lg shadow-sm overflow-hidden mb-8">
              <div className="p-4 border-b">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-black rounded-lg overflow-hidden">
                    <Image src={evento.image || "/placeholder.svg"} alt={evento.title} width={48} height={48} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">{evento.period}</p>
                    <h3 className="text-lg font-bold">{evento.title}</h3>
                  </div>
                  <div className="ml-auto">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Panfletos Cadastrados</p>
                      <p className="text-xl font-bold">
                        <span className="text-blue-600">{evento.panfletosCadastrados}</span>
                        <span className="text-gray-400">/{evento.panfletosTotal}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Create Flyer Card */}
                  <div className="bg-white rounded-lg border p-4 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 flex items-center justify-center mb-2">
                      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M20 6.66669V33.3334"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M6.66669 20H33.3334"
                          stroke="#475569"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <CriarPanfletoButton variant="ghost" eventoId={evento.id} />
                  </div>

                  {/* Event Flyers */}
                  {evento.panfletos.map((panfleto) => (
                    <div key={panfleto.id} className="bg-white rounded-lg border overflow-hidden">
                      <div className="relative aspect-square">
                        <Image
                          src={panfleto.image || "/placeholder.svg"}
                          alt={panfleto.title}
                          fill
                          className="object-cover"
                        />
                        <Badge className="absolute left-2 top-2 bg-black text-white">{panfleto.badge}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full shadow-sm"
                          onClick={() => handleEditPanfleto(panfleto.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="p-3">
                        <p className="text-xs text-gray-500">R$ {panfleto.originalPrice}</p>
                        <p className="text-lg font-bold text-orange-500">R$ {panfleto.price}</p>
                        <h3 className="text-sm font-medium line-clamp-2 h-10 mt-1">{panfleto.title}</h3>
                        <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                          <div className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            <span>{panfleto.stats.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            <span>{panfleto.stats.likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Share2 className="h-3 w-3" />
                            <span>{panfleto.stats.shares}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{panfleto.stats.comments}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mx-4 mb-4 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full"
                  style={{ width: `${(evento.panfletosCadastrados / evento.panfletosTotal) * 100}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-between items-center mb-8">
        <div className="text-xs text-gray-500">Designed by REZZON</div>
      </div>
    </div>
  )
}

// Componente de card de evento próximo
// Fix: Add proper type annotations to the props
interface EventoProximoCardProps {
  id: string
  title: string
  period: string
  description: string
  image: string
  color: string
  badge: string
  onSaibaMais: () => void
}

function EventoProximoCard({
  id,
  title,
  period,
  description,
  image,
  color,
  badge,
  onSaibaMais,
}: EventoProximoCardProps) {
  return (
    <div className={`relative rounded-lg p-4 ${color} text-white`}>
      {badge && <Badge className="absolute right-2 top-2 bg-white text-blue-600">{badge}</Badge>}
      <h3 className="mb-2 text-xl font-bold">{title}</h3>
      <p className="mb-4 text-sm opacity-90">{description}</p>
      <Button variant="outline" size="sm" className="text-white border-current hover:bg-white/10" onClick={onSaibaMais}>
        Saiba Mais
      </Button>
    </div>
  )
}