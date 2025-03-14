"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Search,
  ChevronLeft,
  Instagram,
  PhoneIcon as WhatsApp,
  Facebook,
  Mail,
  MoreHorizontal,
  Heart,
  Eye,
  Share2,
  MessageSquare,
  Star,
  Tag,
  ShoppingCart,
  MapPin,
  Filter,
  ArrowRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function VitrinePublicaNova() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("produtos")
  const [currentSlide, setCurrentSlide] = useState(0)

  // Dados da loja
  const loja = {
    nome: "Loja De Calçados",
    descricao:
      "Loja especializada em calçados de alta qualidade para todos os estilos e ocasiões. Trabalhamos com as melhores marcas e modelos do mercado.",
    categoria: "Calçados e Acessórios",
    avaliacao: 4.8,
    avaliacoes: 245,
    endereco: "Rua Nossa Senhora de Lourdes, nº 111, Cidade de Deus, 69099325, Manaus - AM",
    telefone: "(92) 99999-9999",
    email: "contato@lojadecalcados.com.br",
    website: "www.lojadecalcados.com.br",
    horarios: {
      segundaASexta: "08:00 às 18:00",
      sabado: "08:00 às 12:00",
      domingo: "Fechado",
    },
    desde: 2018,
    panfletosAtivos: 6,
    produtos: 8,
    cupons: 0,
  }

  // Dados dos produtos
  const produtos = [
    {
      id: 1,
      titulo: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      descricao:
        "Scarpin elegante em couro branco com salto alto fino e solado de borracha para maior conforto e durabilidade.",
      preco: 159.9,
      precoOriginal: 189.9,
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "PANFLETO",
      categoria: "Feminino",
      estoque: 25,
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
      avaliacao: 4.8,
      avaliacoes: 42,
    },
    {
      id: 2,
      titulo: "Sapatilha Creme Em Couro Com Lacinho",
      descricao: "Sapatilha feminina em couro creme com detalhe de laço, confortável e versátil para o dia a dia.",
      preco: 129.9,
      precoOriginal: 149.9,
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "HOT PROMO",
      categoria: "Feminino",
      estoque: 18,
      visualizacoes: 652,
      curtidas: 145,
      compartilhamentos: 42,
      comentarios: 98,
      avaliacao: 4.6,
      avaliacoes: 38,
    },
    {
      id: 3,
      titulo: "Tênis Terracota Com Solado Em Borracha",
      descricao: "Tênis casual na cor terracota com solado em borracha, ideal para caminhadas e uso diário.",
      preco: 179.9,
      precoOriginal: 219.9,
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "BLACK FRIDAY",
      categoria: "Unissex",
      estoque: 12,
      visualizacoes: 723,
      curtidas: 189,
      compartilhamentos: 63,
      comentarios: 105,
      avaliacao: 4.9,
      avaliacoes: 56,
    },
    {
      id: 4,
      titulo: "Sapato Branco Em Couro Com Fivela Dourada",
      descricao: "Sapato social branco em couro legítimo com fivela dourada, perfeito para ocasiões especiais.",
      preco: 199.9,
      precoOriginal: 249.9,
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "PANFLETO",
      categoria: "Masculino",
      estoque: 20,
      visualizacoes: 542,
      curtidas: 112,
      compartilhamentos: 38,
      comentarios: 87,
      avaliacao: 4.7,
      avaliacoes: 29,
    },
    {
      id: 5,
      titulo: "Chinelos Com Alça Branca Em Tecido",
      descricao: "Chinelos confortáveis com alça branca em tecido, ideais para uso casual e praia.",
      preco: 89.9,
      precoOriginal: 109.9,
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "PANFLETO",
      categoria: "Unissex",
      estoque: 35,
      visualizacoes: 486,
      curtidas: 98,
      compartilhamentos: 32,
      comentarios: 76,
      avaliacao: 4.5,
      avaliacoes: 34,
    },
    {
      id: 6,
      titulo: "Sapato Em Camurça Marrom Com Fivela",
      descricao: "Sapato elegante em camurça marrom com fivela metálica, ideal para eventos formais.",
      preco: 169.9,
      precoOriginal: 199.9,
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "HOT PROMO",
      categoria: "Masculino",
      estoque: 15,
      visualizacoes: 612,
      curtidas: 132,
      compartilhamentos: 45,
      comentarios: 94,
      avaliacao: 4.7,
      avaliacoes: 41,
    },
  ]

  // Imagens do carrossel da loja
  const imagensLoja = [
    "/placeholder.svg?height=400&width=1200",
    "/placeholder.svg?height=400&width=1200",
    "/placeholder.svg?height=400&width=1200",
    "/placeholder.svg?height=400&width=1200",
  ]

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

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
    <div className="bg-[#fdfeff] min-h-screen">
      {/* Header */}
      <header className="bg-white py-4 px-6 flex items-center justify-between shadow-sm">
        <div className="flex items-center">
          <Image src="/placeholder.svg?height=32&width=32" alt="Panfletex Logo" width={32} height={32} />
          <span className="ml-2 font-semibold text-[#162537]">panfletex</span>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <div className="relative group">
            <button className="flex items-center text-[#162537] font-medium">
              Panfletos
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="relative group">
            <button className="flex items-center text-[#162537] font-medium">
              Lojas
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          <div className="relative group">
            <button className="flex items-center text-[#162537] font-medium">
              Produtos
              <svg
                className="ml-1 w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        </nav>

        <div className="flex items-center">
          <Button variant="outline" className="flex items-center gap-2 text-[#1d72b8] border-[#1d72b8]">
            Baixar App
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </Button>
        </div>
      </header>

      {/* Banner */}
      <div className="relative h-[200px] md:h-[300px] w-full">
        <Image
          src={imagensLoja[currentSlide] || "/placeholder.svg"}
          alt="Loja de Calçados"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end">
          <div className="absolute top-4 left-4">
            <Button variant="outline" size="sm" className="bg-white/80 rounded-full">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Voltar
            </Button>
          </div>
          <div className="absolute bottom-4 right-4 flex gap-2">
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
              <Instagram className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
              <WhatsApp className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
              <Facebook className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8 rounded-full bg-white/80">
              <Mail className="h-4 w-4" />
            </Button>
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1">
            {imagensLoja.map((_, index) => (
              <button
                key={index}
                className={`h-2 w-2 rounded-full ${index === currentSlide ? "bg-white" : "bg-white/50"}`}
                onClick={() => handleDotClick(index)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Store Info */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-yellow-400 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Loja De Calçados"
                width={40}
                height={40}
                className="object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold text-[#162537]">{loja.nome}</h1>
                <div className="flex items-center text-sm text-gray-500">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {loja.avaliacao} ({loja.avaliacoes})
                </div>
              </div>
              <div className="flex flex-wrap gap-x-6 text-sm text-[#718295]">
                <div className="flex items-center gap-1">
                  <span>Segunda - Sexta</span>
                  <span className="font-medium">{loja.horarios.segundaASexta}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Sábado</span>
                  <span className="font-medium">{loja.horarios.sabado}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Domingo</span>
                  <span className="font-medium">{loja.horarios.domingo}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 text-sm text-[#718295]">
                <MapPin className="h-4 w-4" />
                <span>{loja.endereco}</span>
              </div>
            </div>
          </div>
          <div className="ml-auto flex gap-2">
            <Button variant="outline" size="sm" className="gap-1">
              <Heart className="h-4 w-4" />
              Favoritar
            </Button>
            <Button variant="outline" size="sm" className="gap-1">
              <Share2 className="h-4 w-4" />
              Compartilhar
            </Button>
            <Link href="/perfil-loja">
              <Button variant="outline" className="text-[#1d72b8]">
                Ver Perfil Da Loja
              </Button>
            </Link>
          </div>
        </div>

        <div className="mb-8">
          {/* Conteúdo principal */}
          <div>
            <Tabs defaultValue="produtos" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="panfletos">Panfletos</TabsTrigger>
                <TabsTrigger value="informacoes">Informações</TabsTrigger>
              </TabsList>

              <TabsContent value="produtos" className="mt-0">
                {/* Search and Filters */}
                <div className="flex justify-between items-center mb-6">
                  <div className="relative w-full max-w-sm">
                    <Input placeholder="Procurar em produtos..." className="pl-10 bg-white border-[#e6ebf2]" />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#718295]" />
                  </div>
                  <div className="flex gap-2">
                    <Select defaultValue="relevancia">
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Ordenar por" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="relevancia">Mais procurados</SelectItem>
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

                {/* Products Grid */}
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {produtos.map((produto, index) => (
                    <ProductCard key={produto.id} produto={produto} index={index} />
                  ))}
                </motion.div>

                {/* Pagination */}
                <div className="flex justify-center mt-8">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" disabled>
                      Anterior
                    </Button>
                    <Button variant="default" size="sm" className="bg-[#1d72b8]">
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

              <TabsContent value="panfletos" className="mt-0">
                <div className="bg-gray-50 p-6 rounded-lg text-center">
                  <h3 className="text-lg font-medium mb-2">Panfletos da Loja</h3>
                  <p className="text-gray-500">Os panfletos desta loja estarão disponíveis em breve.</p>
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

        {/* Produtos Recomendados */}
        <div className="mt-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Produtos Recomendados</h2>
            <Button variant="link" className="gap-1 text-[#1d72b8]">
              Ver todos <ArrowRight className="h-4 w-4" />
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
                      alt={produto.titulo}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-1">{produto.titulo}</h3>
                    <div className="flex items-center justify-between mt-2">
                      <div className="text-sm font-bold text-[#1d72b8]">R$ {produto.preco.toFixed(2)}</div>
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

        {/* Footer */}
        <div className="text-center text-xs text-[#718295] py-4 border-t border-[#e6ebf2] mt-12">
          Designed by REZZON
        </div>
      </div>
    </div>
  )
}

interface ProdutoProps {
  id: number
  titulo: string
  descricao: string
  preco: number
  precoOriginal: number
  periodo: string
  imagem: string
  tipo: string
  categoria: string
  estoque?: number
  visualizacoes: number
  curtidas: number
  compartilhamentos: number
  comentarios: number
  avaliacao: number
  avaliacoes: number
}

function ProductCard({ produto, index }: { produto: ProdutoProps; index: number }) {
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
    <motion.div
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
            alt={produto.titulo}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
          />
          <Button variant="ghost" size="icon" className="absolute top-2 right-2 h-8 w-8 bg-white/80 rounded-full">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {produto.tipo === "HOT PROMO" && (
            <Badge className="absolute top-2 left-2 bg-orange-500 text-white">HOT PROMO</Badge>
          )}
          {produto.tipo === "PANFLETO" && (
            <Badge className="absolute top-2 left-2 bg-blue-500 text-white">PANFLETO</Badge>
          )}
          {produto.tipo === "BLACK FRIDAY" && (
            <Badge className="absolute top-2 left-2 bg-black text-white">BLACK FRIDAY</Badge>
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
          <div className="text-xs text-[#718295] mb-1">{produto.periodo}</div>
          <h3 className="font-medium line-clamp-2 h-12 mb-1">{produto.titulo}</h3>
          <p className="text-xs text-gray-500 line-clamp-2 mb-2">{produto.descricao}</p>
          {produto.estoque && (
            <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
              <Tag className="h-3 w-3" />
              <span>Estoque: {produto.estoque} unidades</span>
            </div>
          )}
          <div className="flex items-center justify-between text-xs text-[#718295]">
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{produto.visualizacoes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{produto.curtidas}</span>
            </div>
            <div className="flex items-center gap-1">
              <Share2 className="h-3 w-3" />
              <span>{produto.compartilhamentos}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              <span>{produto.comentarios}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <div>
            <div className="text-xs text-[#718295] line-through">R$ {produto.precoOriginal.toFixed(2)}</div>
            <div className="text-lg font-bold text-orange-500">R$ {produto.preco.toFixed(2)}</div>
          </div>
          <Button size="sm" className="gap-1">
            <ShoppingCart className="h-4 w-4" />
            Adicionar
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  )
}

