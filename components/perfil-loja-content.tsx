"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  ChevronLeft,
  Instagram,
  Facebook,
  Mail,
  Phone,
  MapPin,
  Globe,
  Star,
  Calendar,
  Heart,
  Share2,
  MessageSquare,
  ShoppingCart,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"

export function PerfilLojaContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("sobre")
  const [currentSlide, setCurrentSlide] = useState(0)

  // Dados da loja
  const loja = {
    nome: "Loja De Calçados",
    descricao:
      "Nossa loja física é um lugar acolhedor, onde você pode explorar uma ampla variedade de produtos em um ambiente confortável e com atendimento atencioso para lhe instruir. Agora, você pode explorar nossos produtos e fazer compras online a qualquer momento e de qualquer lugar.",
    categoria: "Calçados e Acessórios",
    avaliacao: 4.8,
    avaliacoes: 245,
    endereco: "Rua Nossa Senhora de Lourdes, nº 111, Cidade de Deus, 69099325, Manaus - AM",
    telefone: "(92) 99999-9999",
    email: "loja@calcados.com.br",
    website: "www.lojadecalcados.com.br",
    cnpj: "12.345.678/0001-90",
    horarios: {
      segundaASexta: "08:00 às 18:00",
      sabado: "08:00 às 12:00",
      domingo: "Fechado",
    },
    desde: 2018,
    panfletosAtivos: 6,
    produtos: 8,
    cupons: 0,
    vendas: 1240,
  }

  // Imagens do carrossel da loja
  const imagensLoja = [
    "/placeholder.svg?height=600&width=1200",
    "/placeholder.svg?height=600&width=1200",
    "/placeholder.svg?height=600&width=1200",
    "/placeholder.svg?height=600&width=1200",
  ]

  // Produtos em destaque
  const produtosDestaque = [
    {
      id: 1,
      titulo: "Scarpin Branco Fino Couro, Salto Alto",
      preco: 159.9,
      precoOriginal: 189.9,
      imagem: "/placeholder.svg?height=300&width=300",
      avaliacao: 4.8,
      avaliacoes: 42,
      curtidas: 173,
      visualizacoes: 807,
      compartilhamentos: 56,
      comentarios: 116,
    },
    {
      id: 2,
      titulo: "Sapatilha Creme Em Couro Com Lacinho",
      preco: 129.9,
      precoOriginal: 149.9,
      imagem: "/placeholder.svg?height=300&width=300",
      avaliacao: 4.6,
      avaliacoes: 38,
      curtidas: 145,
      visualizacoes: 652,
      compartilhamentos: 42,
      comentarios: 98,
    },
    {
      id: 3,
      titulo: "Tênis Terracota Com Solado Em Borracha",
      preco: 179.9,
      precoOriginal: 219.9,
      imagem: "/placeholder.svg?height=300&width=300",
      avaliacao: 4.9,
      avaliacoes: 56,
      curtidas: 189,
      visualizacoes: 723,
      compartilhamentos: 63,
      comentarios: 105,
    },
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image src="/placeholder.svg?height=40&width=40" alt="Panfletex" width={40} height={40} />
              <span className="ml-2 text-xl font-bold">panfletex</span>
            </Link>
          </div>
          <nav className="hidden md:flex items-center space-x-6">
            <div className="relative group">
              <button className="flex items-center text-gray-700 font-medium">
                Panfletos
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 font-medium">
                Lojas
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
            <div className="relative group">
              <button className="flex items-center text-gray-700 font-medium">
                Produtos
                <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </nav>
          <div className="flex items-center">
            <Button variant="outline" className="flex items-center gap-2 text-blue-600 border-blue-600">
              Baixar App
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
            </Button>
          </div>
        </div>
      </header>

      {/* Banner */}
      <div className="relative w-full h-72 bg-gray-200">
        <Image
          src={imagensLoja[currentSlide] || "/placeholder.svg"}
          alt="Loja de Calçados"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end">
          <div className="absolute top-4 left-4">
            <Link href="/vitrine-publica-nova">
              <Button variant="outline" size="sm" className="bg-white/80 rounded-full gap-1">
                <ChevronLeft className="h-4 w-4" />
                Voltar
              </Button>
            </Link>
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Cabeçalho da loja */}
        <div className="bg-white rounded-lg shadow-sm p-6 -mt-16 relative z-10 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="bg-yellow-200 rounded-lg p-2 mr-4">
              <Image
                src="/placeholder.svg?height=80&width=80"
                alt="Logo da Loja"
                width={80}
                height={80}
                className="rounded-lg"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold">{loja.nome}</h1>
                <Badge className="bg-blue-500">{loja.categoria}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                <div className="flex items-center">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                  {loja.avaliacao} ({loja.avaliacoes} avaliações)
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Desde {loja.desde}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 max-w-2xl">{loja.descricao}</p>
            </div>
            <div className="flex space-x-2 ml-auto">
              <Button variant="outline" size="sm" className="gap-1">
                <Heart className="h-4 w-4" />
                <span className="hidden md:inline">Favoritar</span>
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Share2 className="h-4 w-4" />
                <span className="hidden md:inline">Compartilhar</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Tabs e conteúdo principal */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Coluna da esquerda */}
          <div className="md:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-4 space-y-6">
                <div>
                  <h3 className="font-medium mb-3">Informações de Contato</h3>
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
                  <h3 className="font-medium mb-3">Horários De Atendimento</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Segunda à sexta</span>
                      <span className="font-medium">{loja.horarios.segundaASexta}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sábado</span>
                      <span className="font-medium">{loja.horarios.sabado}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Domingo</span>
                      <span className="font-medium">{loja.horarios.domingo}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-3">Estatísticas</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Panfletos Ativos:</span>
                      <span className="font-medium">{loja.panfletosAtivos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Produtos:</span>
                      <span className="font-medium">{loja.produtos}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vendas Realizadas:</span>
                      <span className="font-medium">{loja.vendas}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cupons:</span>
                      <span className="font-medium">{loja.cupons}</span>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Instagram className="h-4 w-4" />
                    Instagram
                  </Button>
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Facebook className="h-4 w-4" />
                    Facebook
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna da direita */}
          <div className="md:col-span-2">
            <Tabs defaultValue="sobre" value={activeTab} onValueChange={setActiveTab} className="mb-6">
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="sobre">Sobre</TabsTrigger>
                <TabsTrigger value="produtos">Produtos</TabsTrigger>
                <TabsTrigger value="avaliacoes">Avaliações</TabsTrigger>
              </TabsList>

              <TabsContent value="sobre" className="mt-6">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <h2 className="text-lg font-semibold">Informações Gerais</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm text-gray-500">Nome Fantasia</h3>
                      <p className="font-medium">{loja.nome}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">CNPJ</h3>
                      <p className="font-medium">{loja.cnpj}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">E-Mail</h3>
                      <p className="font-medium">{loja.email}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">Site</h3>
                      <p className="font-medium">{loja.website}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">Endereço</h3>
                      <p className="font-medium">{loja.endereco}</p>
                    </div>

                    <div>
                      <h3 className="text-sm text-gray-500">Categoria</h3>
                      <p className="font-medium">{loja.categoria}</p>
                    </div>
                  </div>
                </div>

                {/* Canal de Atendimento */}
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center mb-4">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                      />
                    </svg>
                    <h2 className="text-lg font-semibold">Canal de Atendimento</h2>
                  </div>

                  <p className="text-gray-600 mb-4">
                    Tire suas dúvidas, faça pedidos ou entre em contato com a loja através do nosso assistente virtual.
                  </p>

                  <Button className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
                    <MessageSquare className="h-5 w-5" />
                    Conversar com Pan AI
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="produtos" className="mt-6">
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                  <h2 className="text-lg font-semibold mb-4">Produtos em Destaque</h2>

                  <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    {produtosDestaque.map((produto, index) => (
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
                              alt={produto.titulo}
                              fill
                              className="object-cover transition-transform duration-300 hover:scale-105"
                            />
                          </div>
                          <CardContent className="p-4 flex-grow">
                            <div className="flex items-center gap-1 mb-1">
                              <div className="text-xs text-gray-500 ml-auto flex items-center">
                                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 mr-1" />
                                {produto.avaliacao} ({produto.avaliacoes})
                              </div>
                            </div>
                            <h3 className="font-medium line-clamp-2 h-12 mb-1">{produto.titulo}</h3>
                            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
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
                              <div className="text-xs text-gray-500 line-through">
                                R$ {produto.precoOriginal.toFixed(2)}
                              </div>
                              <div className="text-lg font-bold text-orange-500">R$ {produto.preco.toFixed(2)}</div>
                            </div>
                            <Button size="sm" className="gap-1">
                              <ShoppingCart className="h-4 w-4" />
                              Comprar
                            </Button>
                          </CardFooter>
                        </Card>
                      </motion.div>
                    ))}
                  </motion.div>

                  <div className="mt-4 text-center">
                    <Link href="/vitrine-publica-nova">
                      <Button variant="outline">Ver todos os produtos</Button>
                    </Link>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="avaliacoes" className="mt-6">
                <div className="bg-white rounded-lg shadow p-6 text-center">
                  <h2 className="text-lg font-semibold mb-4">Avaliações da Loja</h2>
                  <div className="flex justify-center items-center mb-4">
                    <div className="text-5xl font-bold text-blue-600 mr-4">{loja.avaliacao}</div>
                    <div className="text-left">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${i < Math.floor(loja.avaliacao) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                          />
                        ))}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">Baseado em {loja.avaliacoes} avaliações</div>
                    </div>
                  </div>
                  <p className="text-gray-500">As avaliações detalhadas desta loja estarão disponíveis em breve.</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-6 mt-12 border-t">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          <p>Designed by REZZON</p>
        </div>
      </footer>
    </div>
  )
}

