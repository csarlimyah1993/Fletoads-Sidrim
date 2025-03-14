"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  ChevronDown,
  ChevronUp,
  Edit,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  ShoppingBag,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export function PanfletoDetalhes({ id }) {
  const router = useRouter()
  const [infoExpanded, setInfoExpanded] = useState(true)
  const [statsExpanded, setStatsExpanded] = useState(true)

  // Dados simulados do panfleto
  const panfleto = {
    id,
    title: "Tênis Terracota Com Cadarço e Solado Em Borracha branca, Interior em Couro",
    period: "18/11/21 - 25/11/21",
    tags: ["PROMOÇÃO", "BEGE", "TÊNIS", "CALÇADOS"],
    originalPrice: "189,90",
    price: "159,90",
    unitsAvailable: 15,
    description:
      "Apresentamos o nosso Tênis Terracota com Solado em Borracha, uma escolha que combina estilo e durabilidade para acompanhar você em todas as suas aventuras urbanas. Com sua cor terracota única e vibrante, este tênis adiciona um toque de personalidade ao seu visual, destacando-se na multidão.",
    images: [
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
      "/placeholder.svg?height=300&width=300",
    ],
    info: {
      itemsSold: 12,
      inStock: 15,
      creationDate: "05/09/2023",
      endDate: "07/09/2023",
      status: "Ativo (48 horas restantes)",
      type: "Panfleto Lojista",
    },
    stats: {
      visits: 120,
      likes: 56,
      shares: 24,
      comments: 12,
    },
  }

  const handleBack = () => {
    router.back()
  }

  const handleEdit = () => {
    router.push(`/panfletos/${id}/editar`)
  }

  return (
    <div className="p-4 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={handleBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold">Detalhes do Panfleto</h1>
        </div>
        <Button variant="outline" className="gap-2" onClick={handleEdit}>
          <Edit className="h-4 w-4" />
          Editar Panfleto
        </Button>
      </div>

      {/* Main Content */}
      <Card className="p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Images */}
          <div>
            <div className="relative aspect-square bg-gray-100 rounded-md overflow-hidden mb-4">
              <Image src="/placeholder.svg?height=500&width=500" alt={panfleto.title} fill className="object-cover" />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {panfleto.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-square bg-gray-100 rounded-md overflow-hidden border-2 border-gray-200"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${panfleto.title} - imagem ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-blue-500">PANFLETO</Badge>
              <div className="flex items-center gap-1 text-sm text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{panfleto.period}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
              {panfleto.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="px-3 py-1">
                  {tag}
                </Badge>
              ))}
            </div>

            <h2 className="text-xl font-bold mb-4">{panfleto.title}</h2>

            <div className="mb-4">
              <p className="text-sm text-gray-500 line-through">R$ {panfleto.originalPrice}</p>
              <p className="text-3xl font-bold text-orange-500">R$ {panfleto.price}</p>
            </div>

            <div className="flex items-center gap-2 mb-6">
              <ShoppingBag className="h-5 w-5 text-gray-500" />
              <span className="font-medium">Unidades Disponíveis: {panfleto.unitsAvailable}</span>
            </div>

            <Button className="w-full bg-blue-600 hover:bg-blue-700">Comprar Agora</Button>
          </div>
        </div>

        {/* Product Description */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-3">Descrição do Produto</h3>
          <p className="text-gray-700">{panfleto.description}</p>
        </div>
      </Card>

      {/* General Information */}
      <Card className="p-4 md:p-6 mb-6">
        <button className="flex items-center justify-between w-full" onClick={() => setInfoExpanded(!infoExpanded)}>
          <h3 className="text-lg font-semibold">Informações Gerais</h3>
          {infoExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {infoExpanded && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoItem label="Itens Vendidos:" value={`${panfleto.info.itemsSold} unidades`} />
            <InfoItem label="Em Estoque:" value={`${panfleto.info.inStock} unidades`} />
            <InfoItem label="Data de Criação:" value={panfleto.info.creationDate} />
            <InfoItem label="Data de Encerramento:" value={panfleto.info.endDate} />
            <InfoItem label="Status:" value={panfleto.info.status} />
            <InfoItem label="Tipo:" value={panfleto.info.type} />
          </div>
        )}
      </Card>

      {/* Statistics */}
      <Card className="p-4 md:p-6 mb-6">
        <button className="flex items-center justify-between w-full" onClick={() => setStatsExpanded(!statsExpanded)}>
          <h3 className="text-lg font-semibold">Estatísticas</h3>
          {statsExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-500" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-500" />
          )}
        </button>

        {statsExpanded && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard value={panfleto.stats.visits} label="Visitas" icon={<Eye className="h-5 w-5 text-blue-500" />} />
            <StatCard value={panfleto.stats.likes} label="Likes" icon={<Heart className="h-5 w-5 text-blue-500" />} />
            <StatCard
              value={panfleto.stats.shares}
              label="Compartilhamentos"
              icon={<Share2 className="h-5 w-5 text-blue-500" />}
            />
            <StatCard
              value={panfleto.stats.comments}
              label="Comentários"
              icon={<MessageSquare className="h-5 w-5 text-blue-500" />}
            />
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </div>
  )
}

// Components
function InfoItem({ label, value }) {
  return (
    <div className="flex flex-col">
      <span className="text-gray-500 text-sm">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  )
}

function StatCard({ value, label, icon }) {
  return (
    <Card className="p-4 flex flex-col items-center justify-center">
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="flex items-center gap-1 text-sm text-gray-500">
        {icon}
        <span>{label}</span>
      </div>
    </Card>
  )
}

