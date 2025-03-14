"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Upload, Search, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function CriarPanfletoV7Content() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const eventoId = searchParams.get("evento")

  const [selectedType, setSelectedType] = useState(eventoId ? "eventos" : "ativo")
  const [addPromotionalValue, setAddPromotionalValue] = useState(false)
  const [tags, setTags] = useState(["Tag 1", "Tag 2", "Tag 3", "Tag 4"])
  const [newTag, setNewTag] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [title, setTitle] = useState("")
  const [code, setCode] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [promoPrice, setPromoPrice] = useState("")
  const [buttonAction, setButtonAction] = useState("comprar")
  const [buttonLink, setButtonLink] = useState("")
  const [showProductsList, setShowProductsList] = useState(false)
  const [searchProduct, setSearchProduct] = useState("")
  const [selectedProducts, setSelectedProducts] = useState([])

  // Produtos de exemplo
  const [products, setProducts] = useState([
    {
      id: 1,
      name: "Smartphone Galaxy S23",
      price: "R$ 3.999,00",
      code: "SMGS23",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 2,
      name: "Notebook Dell Inspiron",
      price: "R$ 4.599,00",
      code: "NTDI15",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 3,
      name: 'Smart TV 55" 4K',
      price: "R$ 2.799,00",
      code: "TV55SK",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 4,
      name: "Fone de Ouvido Bluetooth",
      price: "R$ 299,00",
      code: "FNEBT1",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 5,
      name: "Câmera DSLR Canon",
      price: "R$ 3.299,00",
      code: "CMCN60",
      image: "/placeholder.svg?height=80&width=80",
    },
    {
      id: 6,
      name: "Relógio Smartwatch",
      price: "R$ 899,00",
      code: "RLGSW1",
      image: "/placeholder.svg?height=80&width=80",
    },
  ])

  // Efeito para selecionar o evento automaticamente se vier da URL
  useEffect(() => {
    if (eventoId) {
      setSelectedType("eventos")
    }
  }, [eventoId])

  const handleCancel = () => {
    router.back()
  }

  const handleRemoveTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleAddTag = () => {
    if (newTag.trim() !== "") {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  // Função para obter o texto de data de início com base no tipo selecionado
  const getStartDateText = () => {
    if (selectedType === "ativo") {
      return "Panfletos Ativos são criados instantaneamente."
    } else if (selectedType === "hotpromo") {
      return "Hotpromos são criadas instantaneamente."
    } else if (selectedType === "eventos") {
      return "Panfletos de eventos são ativados durante evento."
    }
    return ""
  }

  // Função para obter o texto de data de término com base no tipo selecionado
  const getEndDateText = () => {
    if (selectedType === "ativo") {
      return "Panfletos ativos possuem duração de 24 horas."
    } else if (selectedType === "hotpromo") {
      return "Hotpromos possuem duração de 24 horas."
    } else if (selectedType === "eventos") {
      return "Panfletos de eventos se encerram junto ao evento."
    }
    return ""
  }

  // Verificar se o campo de data deve ser somente leitura
  const isDateReadOnly = selectedType === "ativo" || selectedType === "hotpromo" || selectedType === "eventos"

  // Filtrar produtos com base na pesquisa
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
      product.code.toLowerCase().includes(searchProduct.toLowerCase()),
  )

  // Função para selecionar um produto
  const handleSelectProduct = (product) => {
    if (selectedProducts.some((p) => p.id === product.id)) {
      setSelectedProducts(selectedProducts.filter((p) => p.id !== product.id))
    } else {
      setSelectedProducts([...selectedProducts, product])
    }
  }

  // Função para usar um produto selecionado como base para o panfleto
  const handleUseProduct = (product) => {
    setTitle(product.name)
    setCode(product.code)
    setPrice(product.price.replace("R$ ", ""))
    setShowProductsList(false)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Criar Panfleto</h1>
      </div>
      <p className="text-gray-600 mb-6">Crie panfletos instantaneamente ou programe uma data para ativação.</p>

      {/* Produtos Existentes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Produtos Existentes</h2>
          <Button
            variant="outline"
            onClick={() => setShowProductsList(!showProductsList)}
            className="flex items-center gap-2"
          >
            {showProductsList ? "Ocultar Produtos" : "Mostrar Produtos"}
            <ChevronDown className={`h-4 w-4 transition-transform ${showProductsList ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {showProductsList && (
          <div className="border rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-4">
              <Search className="h-5 w-5 text-gray-400" />
              <Input
                placeholder="Buscar produtos por nome ou código..."
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                className="flex-1"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {filteredProducts.map((product) => (
                <Card
                  key={product.id}
                  className={`overflow-hidden ${selectedProducts.some((p) => p.id === product.id) ? "border-2 border-emerald-500" : ""}`}
                >
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                        {selectedProducts.some((p) => p.id === product.id) && (
                          <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-sm">{product.name}</h3>
                        <p className="text-gray-500 text-xs">Código: {product.code}</p>
                        <p className="text-emerald-600 font-medium">{product.price}</p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Checkbox
                          checked={selectedProducts.some((p) => p.id === product.id)}
                          onCheckedChange={() => handleSelectProduct(product)}
                        />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuGroup>
                              <DropdownMenuItem onClick={() => handleUseProduct(product)}>
                                Usar como panfleto
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  handleUseProduct(product)
                                  setSelectedType("hotpromo")
                                }}
                              >
                                Criar como hotpromo
                              </DropdownMenuItem>
                            </DropdownMenuGroup>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedProducts.length > 0 && (
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm">{selectedProducts.length} produto(s) selecionado(s)</p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setSelectedProducts([])}>
                    Limpar seleção
                  </Button>
                  <Button
                    onClick={() => {
                      if (selectedProducts.length === 1) {
                        handleUseProduct(selectedProducts[0])
                      }
                    }}
                  >
                    Usar selecionado
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Panfleto Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <PanfletoTypeCard
          id="ativo"
          title="Panfleto Ativo"
          count={0}
          total={10}
          description="Disponível para os clientes assim que criado. Pode ser visualizado em até 1km de raio da loja."
          selected={selectedType === "ativo"}
          onClick={() => setSelectedType("ativo")}
        />
        <PanfletoTypeCard
          id="programados"
          title="Programados"
          count={0}
          total={10}
          description="Permite que você agende a data que o panfleto se torna ativo e visível para os clientes."
          selected={selectedType === "programados"}
          onClick={() => setSelectedType("programados")}
        />
        <PanfletoTypeCard
          id="hotpromo"
          title="Hotpromo"
          count={0}
          total={10}
          description="Duração de 24 horas, ativo imediatamente. Pode ser visualizado por todo o mapa."
          selected={selectedType === "hotpromo"}
          onClick={() => setSelectedType("hotpromo")}
        />
        <PanfletoTypeCard
          id="eventos"
          title="Eventos"
          count={0}
          total={0}
          description="Concedidos como bônus ao se cadastrar em eventos, área delimitada ao evento."
          selected={selectedType === "eventos"}
          onClick={() => setSelectedType("eventos")}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Images Section */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Imagens do Panfleto</h2>
          <p className="text-gray-500 text-sm mb-4">Faça o envio de suas imagens aqui.</p>

          <div className="grid grid-cols-2 gap-4">
            <ImageUploadBox />
            <ImageUploadBox />
            <ImageUploadBox />
            <ImageUploadBox />
          </div>
        </div>

        {/* Information Section */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Informações do Panfleto</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Título do Panfleto
              </label>
              <Input
                id="title"
                placeholder="Nome do item vendido..."
                className="w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
                Código do Produto
              </label>
              <Input
                id="code"
                placeholder="Identificação do produto no estoque..."
                className="w-full"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Descrição do Panfleto
              </label>
              <Textarea
                id="description"
                placeholder="Uma descrição resumida facilitará aos clientes acessarem seus produtos."
                className="w-full min-h-[150px]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Validity Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Validade do Panfleto</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Início</label>
            {isDateReadOnly ? (
              <Input type="text" className="w-full bg-gray-50" value={getStartDateText()} readOnly />
            ) : (
              <Input
                type="text"
                placeholder="dd/mm/aaaa..."
                className="w-full"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data de Término</label>
            {isDateReadOnly ? (
              <Input type="text" className="w-full bg-gray-50" value={getEndDateText()} readOnly />
            ) : (
              <Input
                type="text"
                placeholder="dd/mm/aaaa..."
                className="w-full"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            )}
          </div>
        </div>
      </div>

      {/* Price Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Preço e Descontos</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm">Adicionar valor promocional</span>
            <Switch checked={addPromotionalValue} onCheckedChange={setAddPromotionalValue} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço do Produto</label>
            <Input
              type="text"
              placeholder="Valor do Produto..."
              className="w-full"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Preço Promocional</label>
            <Input
              type="text"
              placeholder="Valor do Produto com desconto..."
              className="w-full"
              disabled={!addPromotionalValue}
              value={promoPrice}
              onChange={(e) => setPromoPrice(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Button Action Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Adicionar Botão</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ações do Botão</label>
            <Select value={buttonAction} onValueChange={setButtonAction}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="comprar">"Comprar"</SelectItem>
                <SelectItem value="reservar">"Reservar"</SelectItem>
                <SelectItem value="saibamais">"Saiba Mais"</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Link Para a Ação</label>
            <Input
              type="text"
              placeholder="Insira o link de direcionamento do botão..."
              className="w-full"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Tags Section */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Tags do Produto</h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {tags.map((tag, index) => (
            <Badge key={index} variant="outline" className="px-3 py-1 flex items-center gap-1">
              {tag}
              <button onClick={() => handleRemoveTag(tag)} className="ml-1 text-gray-500 hover:text-gray-700">
                ×
              </button>
            </Badge>
          ))}
        </div>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Como marcar o seu produto?"
            className="flex-1"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault()
                handleAddTag()
              }
            }}
          />
          <Button variant="outline" onClick={handleAddTag}>
            Adicionar Tags
          </Button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mb-8">
        <Button variant="outline" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button>Criar Panfleto</Button>
      </div>
    </div>
  )
}

// Components
function PanfletoTypeCard({ id, title, count, total, description, selected = false, onClick }) {
  return (
    <div
      className={`p-4 rounded-lg border ${selected ? "border-2 border-blue-600" : "border-gray-200"} cursor-pointer hover:shadow-md transition-shadow bg-white`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{title}</h3>
        <div className="text-lg font-bold">
          {count}
          <span className="text-sm text-gray-400">/{total}</span>
        </div>
      </div>
      <p className="text-xs text-gray-500">{description}</p>
    </div>
  )
}

function ImageUploadBox() {
  return (
    <div className="border border-gray-200 rounded-lg aspect-square flex items-center justify-center cursor-pointer hover:bg-gray-50">
      <Upload className="h-6 w-6 text-gray-400" />
    </div>
  )
}

