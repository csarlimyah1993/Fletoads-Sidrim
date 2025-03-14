"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Calendar, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function EventosContent() {
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
    },
    {
      id: "2",
      title: "Dia Livre de Impostos - DLI",
      period: "Cadastro de 28/09/2023 até 05/10/2023",
      description: "Cadastre sua empresa e para participar do evento!",
      image: "/placeholder.svg?height=300&width=500",
      color: "bg-blue-900",
    },
    {
      id: "3",
      title: "Passo A Paço 2023",
      period: "Cadastro de 28/08/2023 até 01/08/2023",
      description: "#Soumanaus. Cadastre sua empresa e para participar do evento!",
      image: "/placeholder.svg?height=300&width=500",
      color: "bg-gradient-to-r from-yellow-300 to-green-400",
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

  const handleDotClick = (index) => {
    setCurrentSlide(index)
  }

  const handleSaibaMais = (id) => {
    router.push(`/eventos/${id}`)
  }

  const handleCadastrarParticipacao = () => {
    // Aqui você pode implementar a lógica para cadastrar participação em um evento
    // Por exemplo, redirecionar para uma página de cadastro ou abrir um modal
    console.log("Cadastrar participação em evento")
  }

  const handleVerMaisEventos = () => {
    // Aqui você pode implementar a lógica para ver mais eventos
    // Por exemplo, redirecionar para uma página com todos os eventos
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {getCurrentEvents().map((evento) => (
            <EventoCard
              key={evento.id}
              id={evento.id}
              title={evento.title}
              period={evento.period}
              description={evento.description}
              image={evento.image}
              color={evento.color}
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
      <div className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Eventos Ativos</h2>

        <Card className="p-8 flex flex-col items-center justify-center text-center">
          <div className="mb-4 h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Search className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-gray-600 mb-2">Você ainda não cadastrou participação em nenhum evento.</p>
          <p className="text-gray-600 mb-6">Fique atento aos alertas e não perca!</p>
          <Button className="gap-2" onClick={handleCadastrarParticipacao}>
            <Plus className="h-4 w-4" />
            Cadastrar Participação Em Evento
          </Button>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-right text-xs text-gray-500 py-4">Designed by REZZON</div>
    </div>
  )
}

// Componente de card de evento
function EventoCard({ id, title, period, description, image, color, onSaibaMais }) {
  return (
    <Card className="overflow-hidden">
      <div className={`relative h-40 ${color}`}>
        <Badge className="absolute left-3 top-3 bg-white text-gray-800 z-10">EVENTO</Badge>
        <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover mix-blend-overlay" />
      </div>
      <div className="p-4">
        <div className="flex items-center gap-1 text-sm text-gray-500 mb-2">
          <Calendar className="h-4 w-4" />
          <span>{period}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        <Button variant="outline" className="w-full" onClick={onSaibaMais}>
          Saiba Mais
        </Button>
      </div>
    </Card>
  )
}

