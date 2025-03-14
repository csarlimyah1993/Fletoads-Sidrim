"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import {
  Search,
  Filter,
  ShoppingCart,
  Star,
  ArrowLeft,
  Tag,
  TrendingUp,
  Share2,
  Heart,
  MapPin,
  Phone,
  Mail,
  Globe,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"

export function LojaDetalheContent({ id }: { id: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("produtos")
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Dados de exemplo para a loja
  const loja = {
    id: Number.parseInt(id),
    nome: "SportMax",
    descricao: "Loja especializada em artigos esportivos de alta performance",
    categoria: "Esportes e Fitness",
    avaliacao: 4.8,
    avaliacoes: 245,
    endereco: "Av. Paulista, 1000 - São Paulo, SP",
    telefone: "(11) 99999-9999",
    email: "contato@sportmax.com.br",
    website: "www.sportmax.com.br",
    imagem: "/placeholder.svg?height=300&width=300",
    banner: "/placeholder.svg?height=400&width=1200",
    tipo: "destaque",
    vendas: 1240,
    desde: 2018,
  }

  // Dados de exemplo para produtos da loja
  const produtos = [
    {
      id: 1,
      nome: "Tênis Esportivo Premium",
      descricao: "Tênis de alta performance para corrida e treinos intensos",
      categoria: "Calçados",
      avaliacao: 4.8,
      avaliacoes: 245,
      preco: 399.9,
      imagem: "/placeholder.svg?height=300&width=300",
      estoque: 25,
      vendas: 1240,
    },
    {
      id: 2,
      nome: "Camiseta Dry-Fit Tecnológica",
      descricao: "Camiseta com tecnologia de secagem rápida para atividades físicas",
      categoria: "Vestuário",
      avaliacao: 4.5,
      avaliacoes: 189,
      preco: 89.9,
      imagem: "/placeholder.svg?height=300&width=300",
      estoque: 42,
      vendas: 2150,
    },
    {
      id: 3,
      nome: "Smartwatch Fitness Tracker",
      descricao: "Relógio inteligente com monitoramento de atividades e saúde",
      categoria: "Eletrônicos",
      avaliacao: 4.7,
      avaliacoes: 312,
      preco: 599.9,
      imagem: "/placeholder.svg?height=300&width=300",
      estoque: 18,
      vendas: 780,
    },
    {
      id: 4,
      nome: "Mochila Esportiva Impermeável",
      descricao: "Mochila resistente à água com compartimentos especiais para equipamentos",
      categoria: "Acessórios",
      avaliacao: 4.6,
      avaliacoes: 156,
      preco: 199.9,
      imagem: "/placeholder.svg?height=300&width=300",
      estoque: 30,
      vendas: 950,
    },
    {
      id: 5,
      nome: "Fone de Ouvido Bluetooth Esportivo",
      descricao: "Fones sem fio resistentes ao suor para atividades físicas",
      categoria: "Eletrônicos",
      avaliacao: 4.4,
      avaliacoes: 278,
      preco: 249.9,
      imagem: "/placeholder.svg?height=300&width=300",
      estoque: 22,
      vendas: 1870,
    },
    {
      id: 6,
      nome: "Kit Suplementos Fitness",
      descricao: "Kit completo com proteínas e suplementos para ganho de massa muscular",
      categoria: "Nutrição",
      avaliacao: 4.9,
      avaliacoes: 203,
      preco: 349.9,
      imagem: "/placeholder.svg?height=300&width=300",
      estoque: 15,
      vendas: 620,
    },
  ]

  // Animações
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 },
    },
    hover: {
      y: -5,
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className="max-w-7xl mx-auto">
      <Button variant="ghost" className="mb-4 pl-0 flex items-center gap-2" onClick={() => router.back()}>
        <ArrowLeft className="h-4 w-4" />
        Voltar para Lojas Parceiras
      </Button>

      {/* Banner e informações da loja */}
      <div className="relative w-full h-48 md:h-64 lg:h-80 rounded-lg overflow-hidden mb-6">
        <Image src={loja.banner || "/placeholder.svg"} alt={`Banner da ${loja.nome}`} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6">
          <div className="flex items-end gap-4">
            <div className="relative h-20 w-20 md:h-24 md:w-24 bg-white rounded-lg overflow-hidden border-4 border-white">
              <Image src={loja.imagem || "/placeholder.svg"} alt={loja.nome} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">{loja.nome}</h1>
              <div className="flex items-center gap-2 text-white/80 text-sm">
                <Badge className="bg-blue-500/80">{loja.categoria}</Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {loja.avaliacao} ({loja.avaliacoes} avaliações)
                </div>
                <span>•</span>
                <span>Desde {loja.desde}</span>
              </div>
            </div>
            <div className="hidden md:flex gap-2">
              <Button
                variant="outline"
                className="bg-white/20 border-white/20 text-white hover:bg-white/30 hover:text-white"
              >
                <Heart className="h-4 w-4 mr-2" />
                Favoritar
              </Button>
              <Button
                variant="outline"
                className="bg-white/20 border-white/20 text-white hover:bg-white/30 hover:text-white"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Compartilhar
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Informações da loja */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-4 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Sobre a Loja</h3>
                <p className="text-sm text-gray-600 mb-4">{loja.descricao}</p>

                <div className="space-y-3">
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                    <span className="text-gray-600">{loja.endereco}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{loja.telefone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{loja.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Globe className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{loja.website}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Estatísticas</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total de Produtos:</span>
                    <span className="font-medium">{produtos.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Vendas Realizadas:</span>
                    <span className="font-medium">{loja.vendas}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avaliação Média:</span>
                    <span className="font-medium flex items-center">
                      {loja.avaliacao}
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 ml-1" />
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tempo de Parceria:</span>
                    <span className="font-medium">{new Date().getFullYear() - loja.desde} anos</span>
                  </div>
                </div>
              </div>

              <div className="md:hidden flex gap-2 pt-2">
                <Button variant="outline" className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Favoritar
                </Button>
                <Button variant="outline" className="flex-1">
                  <Share2 className="h-4 w-4 mr-2" />
                  Compartilhar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de produtos */}
        <div className="md:col-span-3">
          <Tabs defaultValue="produtos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3">
              <TabsTrigger value="produtos">Produtos</TabsTrigger>
              <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
            </TabsList>

            <TabsContent value="produtos" className="mt-0">
              <div className="flex justify-between items-center mb-6">
                <div className="relative w-full max-w-sm">
                  <Input placeholder="Buscar produtos..." className="pl-10" />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <div className="flex gap-2">
                  <Select defaultValue="relevancia">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Ordenar por" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relevancia">Relevância</SelectItem>
                      <SelectItem value="preco-asc">Menor preço</SelectItem>
                      <SelectItem value="preco-desc">Maior preço</SelectItem>
                      <SelectItem value="avaliacao">Melhor avaliação</SelectItem>
                      <SelectItem value="vendas">Mais vendidos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filtros
                  </Button>
                </div>
              </div>

              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {produtos.map((produto, index) => (
                  <motion.div
                    key={produto.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className="overflow-hidden h-full flex flex-col">
                      <div className="relative aspect-square bg-gray-100 overflow-hidden">
                        <Image
                          src={produto.imagem || "/placeholder.svg"}
                          alt={produto.nome}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                        />
                        {produto.estoque < 20 && (
                          <Badge className="absolute top-2 left-2 bg-orange-500">Estoque Baixo</Badge>
                        )}
                      </div>
                      <CardContent className="p-4 flex-grow">
                        <div className="flex items-center gap-1 mb-1">
                          <Badge variant="outline" className="text-xs font-normal">
                            {produto.categoria}
                          </Badge>
                          <div className="text-xs text-gray-500 ml-auto flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                            {produto.avaliacao} ({produto.avaliacoes})
                          </div>
                        </div>
                        <h3 className="font-medium line-clamp-2 h-12 mb-1">{produto.nome}</h3>
                        <p className="text-xs text-gray-500 line-clamp-2 mb-2">{produto.descricao}</p>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                          <Tag className="h-3 w-3" />
                          <span>Estoque: {produto.estoque} unidades</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <TrendingUp className="h-3 w-3" />
                          <span>{produto.vendas} vendas</span>
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0 flex justify-between items-center">
                        <div className="text-lg font-bold text-blue-600">R$ {produto.preco.toFixed(2)}</div>
                        <Button size="sm" className="gap-1">
                          <ShoppingCart className="h-4 w-4" />
                          Adicionar
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>

              {/* Paginação */}
              <div className="flex justify-center mt-8">
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Anterior
                  </Button>
                  <Button variant="default" size="sm" className="bg-blue-600">
                    1
                  </Button>
                  <Button variant="outline" size="sm">
                    2
                  </Button>
                  <Button variant="outline" size="sm">
                    Próxima
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="avaliacoes" className="mt-0">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Avaliações da Loja</h3>
                <p className="text-gray-500">As avaliações desta loja estarão disponíveis em breve.</p>
              </div>
            </TabsContent>

            <TabsContent value="informacoes" className="mt-0">
              <div className="bg-gray-50 p-6 rounded-lg text-center">
                <h3 className="text-lg font-medium mb-2">Informações Adicionais</h3>
                <p className="text-gray-500">Informações adicionais sobre esta loja estarão disponíveis em breve.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}

