"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Search,
  Tag,
  FileText,
  Ticket,
  Zap,
  ArrowUpRight,
  Filter,
  SlidersHorizontal,
  Eye,
  Heart,
  Share2,
  MessageSquare,
  Edit,
  Trash2,
  MoreVertical,
  CheckSquare,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"

export function VitrineGerenciamentoContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("produtos")

  // Dados de exemplo para cada tipo de conteúdo
  const produtos = [
    {
      id: 1,
      nome: "Tênis Casual Masculino",
      descricao: "Tênis casual em couro legítimo com solado em borracha",
      categoria: "Calçados",
      precoOriginal: 349.9,
      preco: 299.9,
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      stats: { views: 807, likes: 173, shares: 56, comments: 116 },
    },
    {
      id: 2,
      nome: "Sapatilha Creme Em Couro Com Lacinho",
      descricao: "Sapatilha feminina em couro legítimo com detalhe em laço",
      categoria: "Calçados",
      precoOriginal: 189.9,
      preco: 159.9,
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      stats: { views: 542, likes: 98, shares: 32, comments: 64 },
    },
    {
      id: 3,
      nome: "Tênis Terracota Com Solado Em Borracha",
      descricao: "Tênis na cor terracota com solado em borracha antiderrapante",
      categoria: "Calçados",
      precoOriginal: 229.9,
      preco: 199.9,
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      stats: { views: 623, likes: 145, shares: 41, comments: 87 },
    },
  ]

  const panfletos = [
    {
      id: 1,
      titulo: "Promoção de Verão",
      descricao: "Descontos especiais em toda a linha de verão",
      validade: "30/01/2025",
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      stats: { views: 1254, likes: 342, shares: 128, comments: 76 },
    },
    {
      id: 2,
      titulo: "Liquidação de Inverno",
      descricao: "Últimas peças com até 70% de desconto",
      validade: "15/02/2025",
      imagem: "/placeholder.svg?height=300&width=300",
      status: "agendado",
      stats: { views: 0, likes: 0, shares: 0, comments: 0 },
    },
    {
      id: 3,
      titulo: "Novidades da Coleção",
      descricao: "Confira os lançamentos da nova coleção",
      validade: "Sem validade",
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
      stats: { views: 876, likes: 231, shares: 87, comments: 42 },
    },
  ]

  const cupons = [
    {
      id: 1,
      codigo: "BEMVINDO20",
      desconto: "20%",
      descricao: "Cupom de boas-vindas para primeira compra",
      validade: "31/12/2025",
      usos: 143,
      limite: 500,
      status: "ativo",
    },
    {
      id: 2,
      codigo: "ANIVERSARIO30",
      desconto: "30%",
      descricao: "Cupom especial para aniversariantes",
      validade: "31/12/2025",
      usos: 87,
      limite: 300,
      status: "ativo",
    },
    {
      id: 3,
      codigo: "FRETEGRATIS",
      desconto: "Frete Grátis",
      descricao: "Cupom para frete grátis em compras acima de R$200",
      validade: "31/03/2025",
      usos: 215,
      limite: 1000,
      status: "ativo",
    },
  ]

  const hotpromos = [
    {
      id: 1,
      titulo: "Flash Sale - 24h",
      descricao: "Promoção relâmpago com 50% OFF",
      inicio: "15/01/2025 08:00",
      fim: "16/01/2025 08:00",
      imagem: "/placeholder.svg?height=300&width=300",
      status: "agendado",
    },
    {
      id: 2,
      titulo: "Compre 1 Leve 2",
      descricao: "Na compra de um tênis, leve outro grátis",
      inicio: "01/02/2025 00:00",
      fim: "05/02/2025 23:59",
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
    },
    {
      id: 3,
      titulo: "Outlet - Últimas Peças",
      descricao: "Descontos progressivos nas últimas peças",
      inicio: "10/01/2025 00:00",
      fim: "Sem data final",
      imagem: "/placeholder.svg?height=300&width=300",
      status: "ativo",
    },
  ]

  // Funções para lidar com ações
  const handleAddItem = () => {
    switch (activeTab) {
      case "produtos":
        router.push("/vitrine/novo")
        break
      case "panfletos":
        router.push("/panfletos/criar")
        break
      case "cupons":
        // Implementar rota para criar cupom
        console.log("Criar novo cupom")
        break
      case "hotpromo":
        // Implementar rota para criar hotpromo
        console.log("Criar nova hotpromo")
        break
    }
  }

  // Nova função para selecionar itens para a vitrine
  const handleSelectForVitrine = () => {
    console.log(`Selecionar ${activeTab} para exibir na vitrine`)
    // Aqui você implementaria a lógica para selecionar itens para a vitrine
  }

  const handleEditItem = (id) => {
    switch (activeTab) {
      case "produtos":
        router.push(`/vitrine/${id}/configuracoes`)
        break
      case "panfletos":
        router.push(`/panfletos/${id}/editar`)
        break
      case "cupons":
        // Implementar rota para editar cupom
        console.log(`Editar cupom ${id}`)
        break
      case "hotpromo":
        // Implementar rota para editar hotpromo
        console.log(`Editar hotpromo ${id}`)
        break
    }
  }

  const handleDeleteItem = (id) => {
    console.log(`Excluir item ${id} da aba ${activeTab}`)
    // Implementar lógica de exclusão
  }

  const handleViewVitrine = () => {
    router.push("/vitrine-publica-nova")
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-1">Gerenciamento da Vitrine</h1>
          <p className="text-gray-500">Gerencie todos os elementos que aparecem na sua vitrine</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleViewVitrine} className="gap-2">
            <Eye className="h-4 w-4" />
            Ver Vitrine
          </Button>
          <Button
            variant="outline"
            onClick={handleSelectForVitrine}
            className="gap-2 bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700 hover:border-green-300"
          >
            <CheckSquare className="h-4 w-4" />
            Selecionar para Vitrine
          </Button>
        </div>
      </div>

      <Tabs defaultValue="produtos" onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <TabsList className="h-auto p-1">
            <TabsTrigger value="produtos" className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <span>Produtos</span>
            </TabsTrigger>
            <TabsTrigger value="panfletos" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span>Panfletos</span>
            </TabsTrigger>
            <TabsTrigger value="cupons" className="flex items-center gap-2">
              <Ticket className="h-4 w-4" />
              <span>Cupons</span>
            </TabsTrigger>
            <TabsTrigger value="hotpromo" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              <span>HotPromo</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Input placeholder={`Buscar ${activeTab}...`} className="pl-9" />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <TabsContent value="produtos" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {produtos.map((produto) => (
              <Card key={produto.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-100">
                  <Image src={produto.imagem || "/placeholder.svg"} alt={produto.nome} fill className="object-cover" />
                  <Badge className="absolute left-2 top-2 bg-blue-500">VITRINE</Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full shadow-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditItem(produto.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteItem(produto.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="p-3">
                  <div className="flex items-center gap-1 text-xs text-gray-500 mb-1">
                    <Badge variant="outline" className="text-xs font-normal">
                      {produto.categoria}
                    </Badge>
                  </div>
                  <h3 className="text-sm font-medium line-clamp-2 h-10 my-1">{produto.nome}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{produto.descricao}</p>
                  <div className="mt-1 mb-2">
                    <p className="text-xs text-gray-500 line-through">R$ {produto.precoOriginal.toFixed(2)}</p>
                    <p className="text-lg font-bold text-orange-500">R$ {produto.preco.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      <span>{produto.stats.views}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="h-3 w-3" />
                      <span>{produto.stats.likes}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      <span>{produto.stats.shares}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{produto.stats.comments}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="panfletos" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {panfletos.map((panfleto) => (
              <Card key={panfleto.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-square bg-gray-100">
                  <Image
                    src={panfleto.imagem || "/placeholder.svg"}
                    alt={panfleto.titulo}
                    fill
                    className="object-cover"
                  />
                  <Badge
                    className={`absolute left-2 top-2 ${panfleto.status === "ativo" ? "bg-green-500" : "bg-amber-500"}`}
                  >
                    {panfleto.status === "ativo" ? "ATIVO" : "AGENDADO"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full shadow-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditItem(panfleto.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteItem(panfleto.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 h-10 my-1">{panfleto.titulo}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{panfleto.descricao}</p>
                  <div className="mt-1 mb-2">
                    <p className="text-xs text-gray-500">Validade: {panfleto.validade}</p>
                  </div>
                  {panfleto.status === "ativo" && (
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
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="cupons" className="mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {cupons.map((cupom) => (
              <Card key={cupom.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-blue-500">{cupom.codigo}</Badge>
                        <Badge variant="outline" className="text-xs font-normal">
                          {cupom.desconto}
                        </Badge>
                      </div>
                      <h3 className="text-sm font-medium mb-1">{cupom.descricao}</h3>
                      <p className="text-xs text-gray-500">Validade: {cupom.validade}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEditItem(cupom.id)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDeleteItem(cupom.id)} className="text-red-500">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-xs text-gray-500">
                      Usos: {cupom.usos} / {cupom.limite}
                    </div>
                    <div className="w-1/2 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(cupom.usos / cupom.limite) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="hotpromo" className="mt-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {hotpromos.map((promo) => (
              <Card key={promo.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative aspect-video bg-gray-100">
                  <Image src={promo.imagem || "/placeholder.svg"} alt={promo.titulo} fill className="object-cover" />
                  <Badge
                    className={`absolute left-2 top-2 ${promo.status === "ativo" ? "bg-green-500" : "bg-amber-500"}`}
                  >
                    {promo.status === "ativo" ? "ATIVO" : "AGENDADO"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full shadow-sm"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditItem(promo.id)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteItem(promo.id)} className="text-red-500">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardContent className="p-3">
                  <h3 className="text-sm font-medium line-clamp-2 h-10 my-1">{promo.titulo}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2">{promo.descricao}</p>
                  <div className="mt-1 mb-2 space-y-1">
                    <p className="text-xs text-gray-500">Início: {promo.inicio}</p>
                    <p className="text-xs text-gray-500">Fim: {promo.fim}</p>
                  </div>
                  {promo.status === "ativo" && (
                    <Button variant="outline" size="sm" className="w-full mt-2 text-xs gap-1">
                      <ArrowUpRight className="h-3 w-3" />
                      Promover
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

