"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {
  Edit,
  Eye,
  ExternalLink,
  Globe,
  QrCode,
  Share2,
  Smartphone,
  Tablet,
  ComputerIcon as Desktop,
  Copy,
  Check,
  ChevronDown,
  Settings,
  Palette,
  LayoutIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function VitrineWebContent() {
  const router = useRouter()
  const [activeDevice, setActiveDevice] = useState("desktop")
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState("preview")

  // URL da vitrine
  const vitrineUrl = "https://lojadecalcados.fletoads.com"

  // Estatísticas da vitrine
  const stats = {
    views: 1247,
    uniqueVisitors: 856,
    averageTime: "2m 34s",
    conversionRate: "3.2%",
  }

  // Produtos em destaque
  const featuredProducts = [
    {
      id: 1,
      name: "Tênis Casual Masculino",
      price: 299.9,
      originalPrice: 349.9,
      image: "/placeholder.svg?height=200&width=200",
      status: "active",
    },
    {
      id: 2,
      name: "Sapatilha Creme Em Couro Com Lacinho",
      price: 159.9,
      originalPrice: 189.9,
      image: "/placeholder.svg?height=200&width=200",
      status: "active",
    },
    {
      id: 3,
      name: "Tênis Terracota Com Solado Em Borracha",
      price: 199.9,
      originalPrice: 229.9,
      image: "/placeholder.svg?height=200&width=200",
      status: "active",
    },
  ]

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(vitrineUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleEditAppearance = () => {
    router.push("/vitrine-web/personalizar")
  }

  const handleEditProducts = () => {
    router.push("/vitrine")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Sua Vitrine Web</h1>
          <p className="text-gray-500">Gerencie sua vitrine online e acompanhe o desempenho dos seus produtos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2" onClick={handleEditAppearance}>
            <Palette className="h-4 w-4" />
            Personalizar
          </Button>
          <Button className="gap-2" onClick={() => router.push("/vitrine-publica")}>
            <ExternalLink className="h-4 w-4" />
            Visitar Vitrine
          </Button>
        </div>
      </div>

      {/* URL e QR Code */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-semibold mb-4">Link da sua Vitrine</h2>
            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <Input value={vitrineUrl} readOnly className="pr-24" />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 gap-1"
                  onClick={handleCopyUrl}
                >
                  {copied ? (
                    <>
                      <Check className="h-3.5 w-3.5" />
                      <span>Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copiar</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Compartilhe este link com seus clientes para que eles possam acessar sua vitrine online.
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                Compartilhar
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <Settings className="h-4 w-4" />
                    Configurações
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>
                    <Globe className="h-4 w-4 mr-2" />
                    Domínio personalizado
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <LayoutIcon className="h-4 w-4 mr-2" />
                    Layout da vitrine
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Settings className="h-4 w-4 mr-2" />
                    Configurações avançadas
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <h2 className="text-lg font-semibold mb-4">QR Code</h2>
            <div className="border p-2 rounded-lg bg-white mb-2">
              <Image src="/placeholder.svg?height=150&width=150" alt="QR Code" width={150} height={150} />
            </div>
            <Button variant="outline" size="sm" className="gap-1">
              <QrCode className="h-4 w-4" />
              Baixar QR Code
            </Button>
          </div>
        </div>
      </Card>

      {/* Estatísticas e Visualização */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Estatísticas */}
        <div className="lg:col-span-1">
          <Card className="p-6 h-full">
            <h2 className="text-lg font-semibold mb-4">Estatísticas</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Visualizações</span>
                <span className="font-semibold">{stats.views}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Visitantes únicos</span>
                <span className="font-semibold">{stats.uniqueVisitors}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Tempo médio</span>
                <span className="font-semibold">{stats.averageTime}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-500">Taxa de conversão</span>
                <span className="font-semibold">{stats.conversionRate}</span>
              </div>
            </div>
            <div className="mt-6">
              <Button variant="outline" className="w-full">
                Ver relatório completo
              </Button>
            </div>
          </Card>
        </div>

        {/* Visualização */}
        <div className="lg:col-span-2">
          <Card className="p-6 h-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Visualização</h2>
              <div className="flex border rounded-md">
                <Button
                  variant={activeDevice === "mobile" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setActiveDevice("mobile")}
                >
                  <Smartphone className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeDevice === "tablet" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setActiveDevice("tablet")}
                >
                  <Tablet className="h-4 w-4" />
                </Button>
                <Button
                  variant={activeDevice === "desktop" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setActiveDevice("desktop")}
                >
                  <Desktop className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div
              className="relative bg-gray-100 rounded-lg overflow-hidden"
              style={{
                height: "400px",
                maxWidth: activeDevice === "mobile" ? "320px" : activeDevice === "tablet" ? "768px" : "100%",
                margin: "0 auto",
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  src="/placeholder.svg?height=400&width=800"
                  alt="Vitrine Preview"
                  fill
                  className="object-cover"
                />
                <Button className="absolute top-4 right-4 gap-2 z-10">
                  <ExternalLink className="h-4 w-4" />
                  Abrir
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Produtos em Destaque */}
      <Card className="p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Produtos em Destaque</h2>
          <Button variant="outline" className="gap-2" onClick={handleEditProducts}>
            <Edit className="h-4 w-4" />
            Gerenciar Produtos
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featuredProducts.map((product) => (
            <div key={product.id} className="border rounded-lg overflow-hidden">
              <div className="relative aspect-square bg-gray-100">
                <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                <Badge className="absolute top-2 left-2 bg-green-500">Destaque</Badge>
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate">{product.name}</h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500 line-through">R$ {product.originalPrice.toFixed(2)}</span>
                  <span className="text-lg font-bold text-orange-500">R$ {product.price.toFixed(2)}</span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {product.status === "active" ? "Ativo" : "Inativo"}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Eye className="h-3 w-3" />
                    <span>247</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Footer */}
      <div className="text-center text-xs text-gray-500 py-4">Designed by REZZON</div>
    </div>
  )
}

