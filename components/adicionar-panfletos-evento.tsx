"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  Search,
  Share2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CriarPanfletoButton } from "@/components/criar-panfleto-button"

interface AdicionarPanfletosEventoProps {
  eventoId: string
}

export function AdicionarPanfletosEvento({ eventoId }: AdicionarPanfletosEventoProps) {
  const router = useRouter()

  const [selectedPanfletos, setSelectedPanfletos] = useState<number[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Dados simulados do evento
  const evento = {
    id: eventoId,
    title: "Black Friday 2024",
    period: "De 06/11/2024 até 10/11/2024",
    image: "/placeholder.svg?height=48&width=48",
    maxPanfletos: 10,
  }

  // Dados simulados de panfletos cadastrados para o evento
  const panfletosCadastrados = [
    {
      id: 101,
      title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      price: "159,90",
      originalPrice: "189,90",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 102,
      title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      price: "159,90",
      originalPrice: "189,90",
      image: "/placeholder.svg?height=200&width=200",
    },
    {
      id: 103,
      title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      price: "159,90",
      originalPrice: "189,90",
      image: "/placeholder.svg?height=200&width=200",
    },
  ]

  // Dados simulados de panfletos ativos que podem ser adicionados ao evento
  const panfletosAtivos = [
    {
      id: 1,
      title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      price: "159,90",
      originalPrice: "189,90",
      period: "18/11/21 - 25/11/21",
      image: "/placeholder.svg?height=200&width=200",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 2,
      title: "Sapatilha Creme Em Couro Com Lacinho",
      price: "159,90",
      originalPrice: "189,90",
      period: "18/11/21 - 25/11/21",
      image: "/placeholder.svg?height=200&width=200",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 3,
      title: "Tênis Terracota Com Solado Em Borracha",
      price: "159,90",
      originalPrice: "189,90",
      period: "18/11/21 - 25/11/21",
      image: "/placeholder.svg?height=200&width=200",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 4,
      title: "Sapato Branco Em Couro Com Fivela Dourada",
      price: "159,90",
      originalPrice: "189,90",
      period: "18/11/21 - 25/11/21",
      image: "/placeholder.svg?height=200&width=200",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 5,
      title: "Chinelos Com Alça Branca Em Tecido",
      price: "159,90",
      originalPrice: "189,90",
      period: "18/11/21 - 25/11/21",
      image: "/placeholder.svg?height=200&width=200",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 6,
      title: "Sapato Em Camurça Marrom Com Fivela",
      price: "159,90",
      originalPrice: "189,90",
      period: "18/11/21 - 25/11/21",
      image: "/placeholder.svg?height=200&width=200",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
  ]

  // Filtrar panfletos ativos com base na pesquisa
  const filteredPanfletos = panfletosAtivos.filter((panfleto) =>
    panfleto.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleToggleSelect = (id: number) => {
    if (selectedPanfletos.includes(id)) {
      setSelectedPanfletos(selectedPanfletos.filter((panfletoId) => panfletoId !== id))
    } else {
      if (selectedPanfletos.length < 4) {
        setSelectedPanfletos([...selectedPanfletos, id])
      }
    }
  }

  const handleAddToEvent = () => {
    // Aqui você implementaria a lógica para adicionar os panfletos selecionados ao evento
    alert(`${selectedPanfletos.length} panfletos adicionados ao evento com sucesso!`)
    router.push(`/eventos/${eventoId}`)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleAddAll = () => {
    // Adicionar todos os panfletos filtrados (até o limite de 4)
    const toAdd = filteredPanfletos.slice(0, 4).map((p) => p.id)
    setSelectedPanfletos(toAdd)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Adicionar Panfletos</h1>
        </div>
        <CriarPanfletoButton eventoId={eventoId}>Criar Novo Panfleto de Eventos</CriarPanfletoButton>
      </div>

      {/* Event Info */}
      <div className="bg-white rounded-lg p-4 mb-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-black rounded-lg overflow-hidden">
            <Image src={evento.image || "/placeholder.svg"} alt={evento.title} width={64} height={64} />
          </div>
          <div>
            <p className="text-sm text-gray-500">{evento.period}</p>
            <h2 className="text-xl font-bold">{evento.title}</h2>
          </div>
          <div className="ml-auto">
            <div className="text-right">
              <p className="text-sm text-gray-500">Panfletos Cadastrados</p>
              <p className="text-xl font-bold">
                <span className="text-blue-600">{panfletosCadastrados.length}</span>
                <span className="text-gray-400">/{evento.maxPanfletos}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Registered Flyers */}
      <div className="mb-8">
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
            <CriarPanfletoButton variant="ghost" eventoId={eventoId} />
          </div>

          {/* Registered Flyers */}
          {panfletosCadastrados.map((panfleto) => (
            <div key={panfleto.id} className="bg-white rounded-lg border overflow-hidden">
              <div className="relative aspect-square">
                <Image src={panfleto.image || "/placeholder.svg"} alt={panfleto.title} fill className="object-cover" />
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full shadow-sm"
                  onClick={() => router.push(`/panfletos/${panfleto.id}/editar`)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">R$ {panfleto.originalPrice}</p>
                <p className="text-lg font-bold text-orange-500">R$ {panfleto.price}</p>
                <h3 className="text-sm font-medium line-clamp-2 h-10 mt-1">{panfleto.title}</h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-12">
        <div
          className="h-full bg-blue-600 rounded-full"
          style={{ width: `${(panfletosCadastrados.length / evento.maxPanfletos) * 100}%` }}
        ></div>
      </div>

      {/* Active Flyers Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Adicionar Panfletos Ativos</h2>
          <Button variant="outline" onClick={handleAddAll}>
            Adicionar Todos
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Input
              placeholder="Procurar em panfletos..."
              className="w-full pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          </div>
          <div className="w-full md:w-64">
            <Button variant="outline" className="w-full justify-between">
              <span>Mais procurados</span>
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M5 7.5L10 12.5L15 7.5"
                  stroke="#64748B"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>
          </div>
        </div>

        {/* Flyers Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {filteredPanfletos.map((panfleto) => (
            <div
              key={panfleto.id}
              className={`bg-white rounded-lg border overflow-hidden relative ${
                selectedPanfletos.includes(panfleto.id) ? "ring-2 ring-blue-500" : ""
              }`}
              onClick={() => handleToggleSelect(panfleto.id)}
            >
              {selectedPanfletos.includes(panfleto.id) && (
                <div className="absolute top-2 right-2 z-10 h-6 w-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="relative aspect-square">
                <Image src={panfleto.image || "/placeholder.svg"} alt={panfleto.title} fill className="object-cover" />
                <Badge className="absolute left-2 top-2 bg-blue-500">PANFLETO</Badge>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">{panfleto.period}</p>
                <h3 className="text-sm font-medium line-clamp-2 h-10 my-1">{panfleto.title}</h3>
                <div className="mt-1 mb-2">
                  <p className="text-xs text-gray-500">R$</p>
                  <p className="text-lg font-bold text-orange-500">{panfleto.price}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
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

        {/* Pagination */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="default" size="icon" className="h-8 w-8 bg-blue-500">
              1
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-between items-center">
        <div className="text-xs text-gray-500">Designed by REZZON</div>
        <div className="flex gap-4">
          <Button variant="outline" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button onClick={handleAddToEvent} disabled={selectedPanfletos.length === 0}>
            Adicionar Panfletos ao Evento
          </Button>
        </div>
      </div>
    </div>
  )
}
