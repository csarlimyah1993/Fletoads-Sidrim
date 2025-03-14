"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Search, Filter, ShoppingCart, Star, ArrowRight, Tag, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { useRouter } from "next/navigation"

export function MarketplaceContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("todos")
  const [priceRange, setPriceRange] = useState([0, 1000])

  // Dados de exemplo para produtos do marketplace
  const produtos = [
    {
      id: 1,
      nome: "SportMax",
      descricao: "Loja de artigos esportivos de alta performance",
      categoria: "Calçados",
      vendedor: "SportMax",
      avaliacao: 4.8,
      avaliacoes: 245,
      preco: 399.9,
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "destaque",
      vendas: 1240,
    },
    {
      id: 2,
      nome: "FitWear",
      descricao: "Roupas e acessórios fitness para todos os estilos",
      categoria: "Vestuário",
      vendedor: "FitWear",
      avaliacao: 4.5,
      avaliacoes: 189,
      preco: 89.9,
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "popular",
      vendas: 2150,
    },
    {
      id: 3,
      nome: "TechGear",
      descricao: "Gadgets e eletrônicos para otimizar seus treinos",
      categoria: "Eletrônicos",
      vendedor: "TechGear",
      avaliacao: 4.7,
      avaliacoes: 312,
      preco: 599.9,
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "novo",
      vendas: 780,
    },
    {
      id: 4,
      nome: "OutdoorPro",
      descricao: "Equipamentos para esportes ao ar livre e aventura",
      categoria: "Acessórios",
      vendedor: "OutdoorPro",
      avaliacao: 4.6,
      avaliacoes: 156,
      preco: 199.9,
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "destaque",
      vendas: 950,
    },
    {
      id: 5,
      nome: "SoundSport",
      descricao: "Áudio de alta qualidade para te motivar nos treinos",
      categoria: "Eletrônicos",
      vendedor: "SoundSport",
      avaliacao: 4.4,
      avaliacoes: 278,
      preco: 249.9,
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "popular",
      vendas: 1870,
    },
    {
      id: 6,
      nome: "NutriPower",
      descricao: "Suplementos e vitaminas para impulsionar seus resultados",
      categoria: "Nutrição",
      vendedor: "NutriPower",
      avaliacao: 4.9,
      avaliacoes: 203,
      preco: 349.9,
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "novo",
      vendas: 620,
    },
  ]

  // Filtrar produtos com base na aba ativa
  const filteredProducts = activeTab === "todos" ? produtos : produtos.filter((produto) => produto.tipo === activeTab)

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">Lojas Parceiras</h1>
          <p className="text-gray-500">Explore perfis de lojas parceiras do Fletoads e seus produtos para revenda</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
          </Button>
          <Button className="gap-2">
            <ShoppingCart className="h-4 w-4" />
            Meu Carrinho (0)
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Filtros laterais */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardContent className="p-4 space-y-6">
              <div>
                <h3 className="font-medium mb-3">Buscar</h3>
                <div className="relative">
                  <Input placeholder="Buscar produtos..." className="pl-10" />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Categorias</h3>
                <div className="space-y-2">
                  {["Todos", "Calçados", "Vestuário", "Eletrônicos", "Acessórios", "Nutrição"].map((categoria) => (
                    <div key={categoria} className="flex items-center">
                      <input type="checkbox" id={categoria} className="mr-2" />
                      <label htmlFor={categoria} className="text-sm">
                        {categoria}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Faixa de Preço</h3>
                <Slider
                  defaultValue={[0, 1000]}
                  max={1000}
                  step={10}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="mb-2"
                />
                <div className="flex justify-between text-sm text-gray-500">
                  <span>R$ {priceRange[0]}</span>
                  <span>R$ {priceRange[1]}</span>
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Avaliação</h3>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((stars) => (
                    <div key={stars} className="flex items-center">
                      <input type="checkbox" id={`star-${stars}`} className="mr-2" />
                      <label htmlFor={`star-${stars}`} className="text-sm flex items-center">
                        {Array(stars)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          ))}
                        {Array(5 - stars)
                          .fill(0)
                          .map((_, i) => (
                            <Star key={i} className="h-3 w-3 text-gray-300" />
                          ))}
                        <span className="ml-1">e acima</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-medium mb-3">Ordenar por</h3>
                <Select defaultValue="relevancia">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma opção" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevancia">Relevância</SelectItem>
                    <SelectItem value="recentes">Mais recentes</SelectItem>
                    <SelectItem value="preco-asc">Menor preço</SelectItem>
                    <SelectItem value="preco-desc">Maior preço</SelectItem>
                    <SelectItem value="avaliacao">Melhor avaliação</SelectItem>
                    <SelectItem value="vendas">Mais vendidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button className="w-full">Aplicar Filtros</Button>
            </CardContent>
          </Card>
        </div>

        {/* Lista de produtos */}
        <div className="md:col-span-3">
          <Tabs defaultValue="todos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="todos">Todas Lojas</TabsTrigger>
              <TabsTrigger value="destaque">Parceiros Premium</TabsTrigger>
              <TabsTrigger value="popular">Mais Populares</TabsTrigger>
              <TabsTrigger value="novo">Novos Parceiros</TabsTrigger>
            </TabsList>
          </Tabs>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {filteredProducts.map((produto, index) => (
              <motion.div
                key={produto.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                whileHover="hover"
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="overflow-hidden h-full flex flex-col cursor-pointer"
                  onClick={() => router.push(`/marketplace/loja/${produto.id}`)}
                >
                  <div className="relative aspect-square bg-gray-100 overflow-hidden">
                    <Image
                      src={produto.imagem || "/placeholder.svg"}
                      alt={produto.nome}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                    {produto.tipo === "destaque" && (
                      <Badge className="absolute top-2 left-2 bg-blue-500">Parceiro Premium</Badge>
                    )}
                    {produto.tipo === "popular" && (
                      <Badge className="absolute top-2 left-2 bg-orange-500">Popular</Badge>
                    )}
                    {produto.tipo === "novo" && (
                      <Badge className="absolute top-2 left-2 bg-green-500">Novo Parceiro</Badge>
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
                      <span>Produtos: {Math.floor(Math.random() * 50) + 10}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <TrendingUp className="h-3 w-3" />
                      <span>{produto.vendas} vendas</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-600">
                      Desde {new Date().getFullYear() - Math.floor(Math.random() * 5)}
                    </div>
                    <Button size="sm" className="gap-1">
                      <ArrowRight className="h-4 w-4" />
                      Ver Loja
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
                3
              </Button>
              <span>...</span>
              <Button variant="outline" size="sm">
                10
              </Button>
              <Button variant="outline" size="sm">
                Próxima
              </Button>
            </div>
          </div>

          {/* Seção de produtos recomendados */}
          <div className="mt-12">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Lojas em Destaque</h2>
              <Button variant="link" className="gap-1 text-blue-600">
                Ver todas <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              {produtos.slice(0, 4).map((produto, index) => (
                <motion.div
                  key={`rec-${produto.id}`}
                  variants={itemVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <div className="relative aspect-square bg-gray-100 overflow-hidden">
                      <Image
                        src={produto.imagem || "/placeholder.svg"}
                        alt={produto.nome}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-3">
                      <h3 className="font-medium text-sm line-clamp-1">{produto.nome}</h3>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-sm font-bold text-blue-600">R$ {produto.preco.toFixed(2)}</div>
                        <div className="text-xs flex items-center">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                          {produto.avaliacao}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

