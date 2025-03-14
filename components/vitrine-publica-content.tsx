"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search } from "lucide-react"
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

  const handleDotClick = (index) => {
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

      {/* Informações da Loja */}
      <div className="bg-white p-4 shadow-sm">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-yellow-400 rounded-lg flex items-center justify-center">
              <Image src="/placeholder.svg?height=40&width=40" alt="Logo" width={40} height={40} />
            </div>
            <div>
              <h1 className="text-xl font-bold">{loja.nome}</h1>
              <div className="flex flex-wrap gap-x-4 text-sm text-gray-600">
                <div>
                  <span>Segunda - Sexta</span>
                  <span className="ml-1 font-medium">{loja.horarios.segundaASexta}</span>
                </div>
                <div>
                  <span>Sábado</span>
                  <span className="ml-1 font-medium">{loja.horarios.sabado}</span>
                </div>
                <div>
                  <span>Domingo</span>
                  <span className="ml-1 font-medium">{loja.horarios.domingo}</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">{loja.endereco}</p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto">
              Ver Perfil Da Loja
            </Button>
          </div>
        </div>
      </div>

      {/* Barra de Pesquisa */}
      <div className="container mx-auto px-4 py-4">
        <div className="relative">
          <Input placeholder="Procurar em panfletos..." className="pl-10 pr-4 py-2 w-full" />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        </div>
        <div className="flex mt-4 gap-2">
          <Button variant="default" size="sm" className="rounded-full">
            6 <span className="ml-1">Panfletos Ativos</span>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full">
            6 <span className="ml-1">Produtos Expostos</span>
          </Button>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {produtos.map((produto) => (
            <div key={produto.id} className="bg-white rounded-lg overflow-hidden shadow-sm">
              <div className="relative aspect-square">
                <Image src={produto.imagem || "/placeholder.svg"} alt={produto.titulo} fill className="object-cover" />
                <Badge className="absolute left-2 top-2 bg-blue-500">{produto.tipo}</Badge>
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-500">{produto.periodo}</p>
                <h3 className="font-medium text-sm line-clamp-2 h-10 my-1">{produto.titulo}</h3>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-500 line-through">R$ {produto.precoOriginal}</p>
                  <p className="text-lg font-bold text-orange-500">R$ {produto.preco}</p>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M2.45825 12C3.73253 7.94288 7.52281 5 12.0004 5C16.4781 5 20.2684 7.94291 21.5426 12C20.2684 16.0571 16.4781 19 12.0005 19C7.52281 19 3.73251 16.0571 2.45825 12Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{produto.visualizacoes}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19.5 12.5719L12 19.9999L4.5 12.5719C3.33795 11.4281 2.47782 10.0265 2.01731 8.48736C1.55679 6.94824 1.51108 5.31159 1.88459 3.75124C2.2581 2.1909 3.03719 0.760021 4.13202 0.628978C5.22685 0.497935 6.0268 1.1655 7.28487 1.66544C8.54294 2.16537 9.75631 2.49994 11 2.49994H13C14.2437 2.49994 15.4571 2.16537 16.7151 1.66544C17.9732 1.1655 18.7732 0.497935 19.868 0.628978C20.9628 0.760021 21.7419 2.1909 22.1154 3.75124C22.4889 5.31159 22.4432 6.94824 21.9827 8.48736C21.5222 10.0265 20.662 11.4281 19.5 12.5719Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{produto.curtidas}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4 12V20.4C4 20.7314 4.26863 21 4.6 21H19.4C19.7314 21 20 20.7314 20 20.4V12"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M16 7L12 3L8 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M12 3V15"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{produto.compartilhamentos}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2.5 21.5L7 20.6622C8.47087 21.513 10.1786 22 12 22Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    <span>{produto.comentarios}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Paginação */}
      <div className="container mx-auto px-4 py-6 flex justify-center">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
          <Button variant="default" size="sm" className="h-8 w-8 p-0">
            1
          </Button>
          <Button variant="outline" size="sm" className="h-8 w-8 p-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 18L15 12L9 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white py-4 text-center text-xs text-gray-500 mt-8">
        <div className="container mx-auto">Designed by REZZON</div>
      </footer>
    </div>
  )
}

