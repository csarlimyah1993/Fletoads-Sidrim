"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function VitrinePublicaContent() {
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Dados da loja
  const loja = {
    nome: "Loja De Calçados",
    horarios: {
      segundaASexta: "08:00 às 18:00",
      sabado: "08:00 às 12:00",
      domingo: "Fechado",
    },
    endereco: "Rua Nossa Senhora de Lourdes, nº 11, Cidade de Deus, 69099325, Manaus - AM",
  }

  // Dados dos produtos
  const produtos = [
    {
      id: 1,
      titulo: "Scarpin Branco Fino Couro, Salto Alto, Solado De Borracha",
      preco: "159,90",
      precoOriginal: "189,90",
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "PANFLETO",
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
    },
    {
      id: 2,
      titulo: "Sapatilha Creme Em Couro Com Lacinho",
      preco: "159,90",
      precoOriginal: "189,90",
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "HOT PROMO",
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
    },
    {
      id: 3,
      titulo: "Tênis Terracota Com Solado Em Borracha",
      preco: "159,90",
      precoOriginal: "189,90",
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "BLACK FRIDAY",
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
    },
    {
      id: 4,
      titulo: "Sapato Branco Em Couro Com Fivela Dourada",
      preco: "159,90",
      precoOriginal: "189,90",
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "PANFLETO DO",
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
    },
    {
      id: 5,
      titulo: "Chinelos Com Alça Branca Em Tecido",
      preco: "159,90",
      precoOriginal: "189,90",
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "PANFLETO",
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
    },
    {
      id: 6,
      titulo: "Sapato Em Camurça Marrom Com Fivela",
      preco: "159,90",
      precoOriginal: "189,90",
      periodo: "18/11/21 - 25/11/21",
      imagem: "/placeholder.svg?height=300&width=300",
      tipo: "HOT PROMO",
      visualizacoes: 807,
      curtidas: 173,
      compartilhamentos: 56,
      comentarios: 116,
    },
  ]

  // Imagens do carrossel da loja
  const imagensLoja = [
    "/placeholder.svg?height=400&width=1200",
    "/placeholder.svg?height=400&width=1200",
    "/placeholder.svg?height=400&width=1200",
    "/placeholder.svg?height=400&width=1200",
  ]

  const handleVoltar = () => {
    router.back()
  }

  const handleDotClick = (index: number) => {
    setCurrentSlide(index)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-2 flex items-center justify-between">
          <div className="flex items-center">
            <Button variant="ghost" size="sm" onClick={handleVoltar} className="mr-2">
              <ArrowLeft className="h-5 w-5" />
              <span className="ml-1">Voltar</span>
            </Button>
            <Image src="/placeholder.svg?height=40&width=120" alt="Panfletex" width={120} height={40} />
          </div>
          <div className="flex items-center space-x-2">
            <a href="#" className="p-2 rounded-full hover:bg-gray-100">
              <Image src="/placeholder.svg?height=24&width=24" alt="Instagram" width={24} height={24} />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-gray-100">
              <Image src="/placeholder.svg?height=24&width=24" alt="WhatsApp" width={24} height={24} />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-gray-100">
              <Image src="/placeholder.svg?height=24&width=24" alt="Facebook" width={24} height={24} />
            </a>
            <a href="#" className="p-2 rounded-full hover:bg-gray-100">
              <Image src="/placeholder.svg?height=24&width=24" alt="Email" width={24} height={24} />
            </a>
          </div>
        </div>
      </header>

      {/* Carrossel da Loja */}
      <div className="relative h-[300px] w-full">
        <Image
          src={imagensLoja[currentSlide] || "/placeholder.svg"}
          alt="Loja de Calçados"
          fill
          className="object-cover"
        />
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

      {/* Rest of the component remains unchanged */}
      <div className="container mx-auto px-4 py-8">
        {/* Barra de Busca */}
        <div className="mb-6">
          <Input type="search" placeholder="Buscar produtos..." className="rounded-full" />
        </div>

        {/* Informações da Loja */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold mb-4">{loja.nome}</h2>
          <p className="text-gray-700 mb-2">
            <strong>Horários:</strong>
          </p>
          <p className="text-gray-700">Segunda a Sexta: {loja.horarios.segundaASexta}</p>
          <p className="text-gray-700">Sábado: {loja.horarios.sabado}</p>
          <p className="text-gray-700">Domingo: {loja.horarios.domingo}</p>
          <p className="text-gray-700 mt-2">
            <strong>Endereço:</strong> {loja.endereco}
          </p>
        </div>

        {/* Lista de Produtos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative">
                <Image
                  src={produto.imagem || "/placeholder.svg"}
                  alt={produto.titulo}
                  width={300}
                  height={300}
                  className="w-full h-60 object-cover"
                />
                <Badge className="absolute top-2 left-2">{produto.tipo}</Badge>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{produto.titulo}</h3>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="text-gray-500 line-through mr-2">R$ {produto.precoOriginal}</span>
                    <span className="text-green-500 font-bold">R$ {produto.preco}</span>
                  </div>
                  <span className="text-sm text-gray-600">{produto.periodo}</span>
                </div>
                <div className="flex items-center justify-between text-gray-500">
                  <span>
                    <Image
                      src="/placeholder.svg?height=16&width=16"
                      alt="Visualizações"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    {produto.visualizacoes}
                  </span>
                  <span>
                    <Image
                      src="/placeholder.svg?height=16&width=16"
                      alt="Curtidas"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    {produto.curtidas}
                  </span>
                  <span>
                    <Image
                      src="/placeholder.svg?height=16&width=16"
                      alt="Compartilhamentos"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    {produto.compartilhamentos}
                  </span>
                  <span>
                    <Image
                      src="/placeholder.svg?height=16&width=16"
                      alt="Comentários"
                      width={16}
                      height={16}
                      className="inline mr-1"
                    />
                    {produto.comentarios}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default VitrinePublicaContent
