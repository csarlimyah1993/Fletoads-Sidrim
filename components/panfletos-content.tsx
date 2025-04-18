"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  FileText,
  Clock,
  Zap,
  XCircle,
  Calendar,
  QrCode,
  ChevronDown,
  Timer,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { CriarPanfletoButton } from "@/components/criar-panfleto-button"

// Define TypeScript interfaces for our components
interface StatusCardProps {
  id: string
  icon: React.ReactNode
  label: string
  count: number
  total: number
  color: string
  isActive: boolean
  onClick: () => void
}

interface ProductStats {
  views: number
  likes: number
  shares: number
  comments: number
}

interface ProductCardProps {
  image: string
  title: string
  price: string
  period: string
  stats: ProductStats
  type: string[] | string
  timeRemaining?: string
  activeFilter: string
}

interface StatusCardData {
  id: string
  icon: React.ReactNode
  label: string
  count: number
  total: number
  color: string
}

interface ProductData {
  id: number
  image: string
  title: string
  price: string
  period: string
  stats: ProductStats
  type: string[] | string
  timeRemaining?: string
}

export function PanfletosContent() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all") // 'all', 'ativos', 'programados', 'hotpromo', 'desativados', 'eventos'

  // Status card data
  const statusCards: StatusCardData[] = [
    {
      id: "ativos",
      icon: <FileText className="h-5 w-5" />,
      label: "Ativos",
      count: activeFilter === "programados" ? 6 : activeFilter === "hotpromo" ? 2 : 6,
      total: 10,
      color: "bg-blue-500",
    },
    {
      id: "programados",
      icon: <Clock className="h-5 w-5" />,
      label: "Programados",
      count: 6,
      total: 10,
      color: activeFilter === "programados" ? "bg-blue-600" : "bg-blue-400",
    },
    {
      id: "hotpromo",
      icon: <Zap className="h-5 w-5" />,
      label: "Hotpromo",
      count: activeFilter === "hotpromo" ? 2 : 0,
      total: 10,
      color: activeFilter === "hotpromo" ? "bg-blue-600" : "bg-gray-300",
    },
    {
      id: "desativados",
      icon: <XCircle className="h-5 w-5" />,
      label: "Desativados",
      count: 2,
      total: 8,
      color: "bg-blue-500",
    },
    {
      id: "eventos",
      icon: <Calendar className="h-5 w-5" />,
      label: "Eventos",
      count: 3,
      total: 4,
      color: "bg-blue-500",
    },
  ]

  // Product data
  const products: ProductData[] = [
    {
      id: 1,
      image: "/placeholder.svg?height=200&width=200",
      title: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      price: "159,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["hotpromo", "programado"],
      timeRemaining: "12:10:32 restantes",
    },
    {
      id: 2,
      image: "/placeholder.svg?height=200&width=200",
      title: "Sapatilha Creme Em Couro Com Lacinho",
      price: "159,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["hotpromo", "programado"],
      timeRemaining: "12:10:32 restantes",
    },
    {
      id: 3,
      image: "/placeholder.svg?height=200&width=200",
      title: "Tênis Terracota Com Solado Em Borracha",
      price: "159,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["hotpromo", "programado"],
      timeRemaining: "12:10:32 restantes",
    },
    {
      id: 4,
      image: "/placeholder.svg?height=200&width=200",
      title: "Sapato Branco Em Couro Com Fivela Dourada",
      price: "159,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["hotpromo", "programado"],
      timeRemaining: "12:10:32 restantes",
    },
    {
      id: 5,
      image: "/placeholder.svg?height=200&width=200",
      title: "Chinelos Com Alça Branca Em Tecido",
      price: "159,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["hotpromo", "programado"],
      timeRemaining: "12:10:32 restantes",
    },
    {
      id: 6,
      image: "/placeholder.svg?height=200&width=200",
      title: "Sapato Em Camurça Marrom Com Fivela",
      price: "159,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["hotpromo", "programado"],
      timeRemaining: "12:10:32 restantes",
    },
    {
      id: 7,
      image: "/placeholder.svg?height=200&width=200",
      title: "Bota Cano Curto Em Couro",
      price: "199,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["ativo"],
    },
    {
      id: 8,
      image: "/placeholder.svg?height=200&width=200",
      title: "Sandália Rasteira Com Tiras",
      price: "129,90",
      period: "16/11/21 - 25/11/21",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
      type: ["ativo"],
    },
  ]

  // Filter products based on active filter
  const filteredProducts =
    activeFilter === "all" || activeFilter === ""
      ? products
      : products.filter((product) =>
          Array.isArray(product.type)
            ? product.type.includes(activeFilter.replace("s", "")) // Remove plural 's' for matching
            : product.type === activeFilter.replace("s", ""),
        )

  // Handle status card click
  const handleStatusCardClick = (cardId: string) => {
    setActiveFilter(cardId === activeFilter ? "all" : cardId)
  }

  // Handle new panfleto button click
  const handleNewPanfleto = () => {
    console.log("Redirecionando para /panfletos/criar/v7")
    router.push("/panfletos/criar/v7")
  }

  return (
    <>
      {/* Header Section */}
      <div className="bg-blue-600 text-white p-4 md:p-6">
        <h1 className="text-xl md:text-2xl font-bold mb-2">Panfletos</h1>
        <p className="mb-6">
          Crie panfletos instantaneamente, programe uma data para ativação ou reative seus panfletos antigos. Clique nos
          cards para ver seus panfletos organizados por status.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {statusCards.map((card) => (
            <StatusCard
              key={card.id}
              id={card.id}
              icon={card.icon}
              label={card.label}
              count={card.count}
              total={card.total}
              color={card.color}
              isActive={activeFilter === card.id}
              onClick={() => handleStatusCardClick(card.id)}
            />
          ))}
        </div>
      </div>

      {/* Validate Code Section - Only hide if in hotpromo mode */}
      {activeFilter !== "hotpromo" && (
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-700 mb-1">Validar Código</h2>
          <p className="text-gray-500 text-sm mb-4">
            Insira o código do panfleto apresentar ou escaneie o QR Code para validar e dar baixa no panfleto
            apresentado pelo cliente.
          </p>

          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                  Código do Panfleto
                </label>
                <Input id="code" placeholder="Insira o código" className="w-full" />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2">
                  <QrCode className="h-4 w-4" />
                  Escanear Código
                </Button>
                <Button variant="ghost" className="text-blue-600">
                  Verificar Código
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Search Flyers Section */}
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Buscar Panfletos</h2>

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
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Flyers Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              image={product.image}
              title={product.title}
              price={product.price}
              period={product.period}
              stats={product.stats}
              type={product.type}
              timeRemaining={product.timeRemaining}
              activeFilter={activeFilter}
            />
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

      {/* Fixed New Flyer Button */}
      <div className="fixed bottom-6 right-6">
        <CriarPanfletoButton className="bg-blue-600 hover:bg-blue-700">Novo Panfleto</CriarPanfletoButton>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </>
  )
}

// Components
function StatusCard({ id, icon, label, count, total, color, isActive, onClick }: StatusCardProps) {
  return (
    <Card
      className={`flex flex-col items-center p-4 hover:shadow-md transition-shadow cursor-pointer ${
        isActive ? "bg-blue-600 text-white" : "bg-white"
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div
          className={`h-8 w-8 ${isActive ? "bg-white text-blue-600" : color} rounded-full flex items-center justify-center ${isActive ? "text-blue-600" : "text-white"}`}
        >
          {icon}
        </div>
        <div className="text-lg font-bold">
          {count}
          <span className={`text-sm ${isActive ? "text-blue-200" : "text-gray-400"}`}>/{total}</span>
        </div>
      </div>
      <span className="text-sm">{label}</span>
    </Card>
  )
}

function ProductCard({ image, title, price, period, stats, type, timeRemaining, activeFilter }: ProductCardProps) {
  const router = useRouter()

  // Determine badge type and color based on active filter
  let badgeText = "PANFLETO"
  let badgeColor = "bg-blue-500"

  if (activeFilter === "hotpromo") {
    badgeText = "HOTPROMO"
    badgeColor = "bg-red-500"
  } else if (activeFilter === "programados") {
    badgeText = "PROGRAMADO"
    badgeColor = "bg-green-500"
  }

  const handleCardClick = () => {
    // Usar um ID simulado para demonstração
    router.push(`/panfletos/1`)
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer" onClick={handleCardClick}>
      <div className="relative">
        <div className="aspect-square bg-gray-100 relative">
          <Image src={image || "/placeholder.svg"} alt={title} fill className="object-cover" />
          <Badge className={`absolute left-2 top-2 ${badgeColor}`}>{badgeText}</Badge>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1 h-8 w-8 bg-white/80 rounded-full"
            onClick={(e) => {
              e.stopPropagation() // Evita que o clique no botão propague para o card
            }}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        {activeFilter === "hotpromo" && timeRemaining && (
          <div className="flex items-center gap-1 text-xs text-red-500 mb-1">
            <Timer className="h-3 w-3" />
            <span>{timeRemaining}</span>
          </div>
        )}
        <p className="text-xs text-gray-500">{period}</p>
        <h3 className="text-sm font-medium line-clamp-2 h-10 my-1">{title}</h3>
        <div className="mt-1 mb-2">
          <p className="text-xs text-gray-500">R$</p>
          <p className="text-lg font-bold text-orange-500">{price}</p>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Eye className="h-3 w-3" />
            <span>{stats.views}</span>
          </div>
          <div className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            <span>{stats.likes}</span>
          </div>
          <div className="flex items-center gap-1">
            <Share2 className="h-3 w-3" />
            <span>{stats.shares}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="h-3 w-3" />
            <span>{stats.comments}</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
