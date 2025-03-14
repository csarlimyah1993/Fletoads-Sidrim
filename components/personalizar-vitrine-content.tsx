"use client"

import { Textarea } from "@/components/ui/textarea"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Palette, Layout, ImageIcon, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export function PersonalizarVitrineContent() {
  const router = useRouter()
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#f59e0b")
  const [fontFamily, setFontFamily] = useState("Inter")
  const [layout, setLayout] = useState("grid")
  const [logoImage, setLogoImage] = useState("/placeholder.svg?height=80&width=80")
  const [coverImage, setCoverImage] = useState("/placeholder.svg?height=300&width=800")
  const [showSearch, setShowSearch] = useState(true)
  const [showFilters, setShowFilters] = useState(true)

  const handleBack = () => {
    router.back()
  }

  const handleSave = () => {
    // Aqui você implementaria a lógica para salvar as configurações
    router.push("/vitrine-web")
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={handleBack}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold mb-1">Personalizar Vitrine</h1>
          <p className="text-gray-500">Personalize a aparência e o comportamento da sua vitrine web</p>
        </div>
      </div>

      <Tabs defaultValue="appearance" className="mb-8">
        <TabsList className="mb-6">
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Aparência
          </TabsTrigger>
          <TabsTrigger value="layout" className="gap-2">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger value="content" className="gap-2">
            <ImageIcon className="h-4 w-4" />
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Cores</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <Label htmlFor="primary-color">Cor Primária</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-10 h-10 rounded border" style={{ backgroundColor: primaryColor }} />
                      <Input
                        id="primary-color"
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Usada para botões, links e elementos de destaque</p>
                  </div>

                  <div>
                    <Label htmlFor="secondary-color">Cor Secundária</Label>
                    <div className="flex gap-2 mt-1">
                      <div className="w-10 h-10 rounded border" style={{ backgroundColor: secondaryColor }} />
                      <Input
                        id="secondary-color"
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Usada para elementos de destaque secundários</p>
                  </div>
                </div>

                <h3 className="font-medium mb-2">Temas Pré-definidos</h3>
                <div className="grid grid-cols-4 gap-4">
                  <div className="h-20 rounded-lg cursor-pointer border-2 border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-blue-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                  <div className="h-20 rounded-lg cursor-pointer border hover:border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-green-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                  <div className="h-20 rounded-lg cursor-pointer border hover:border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-purple-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                  <div className="h-20 rounded-lg cursor-pointer border hover:border-blue-500 flex flex-col overflow-hidden">
                    <div className="h-1/2 bg-orange-500"></div>
                    <div className="h-1/2 bg-white"></div>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Tipografia</h2>

                <div className="mb-4">
                  <Label htmlFor="font-family">Família de Fonte</Label>
                  <Select defaultValue={fontFamily} onValueChange={setFontFamily}>
                    <SelectTrigger id="font-family" className="mt-1">
                      <SelectValue placeholder="Selecione uma fonte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter">Inter</SelectItem>
                      <SelectItem value="Roboto">Roboto</SelectItem>
                      <SelectItem value="Poppins">Poppins</SelectItem>
                      <SelectItem value="Montserrat">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Visualização</Label>
                  <div className="mt-2 p-4 border rounded-lg" style={{ fontFamily }}>
                    <h3 className="text-xl font-bold mb-2">Título de Exemplo</h3>
                    <p>Este é um texto de exemplo para visualizar a fonte selecionada. A fonte atual é {fontFamily}.</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Visualização</h2>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[9/16] mb-4">
                  <Image src="/placeholder.svg?height=400&width=225" alt="Preview" fill className="object-cover" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Visualização da sua vitrine com as configurações atuais
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Layout de Produtos</h2>

                <RadioGroup value={layout} onValueChange={setLayout} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${layout === "grid" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <RadioGroupItem value="grid" id="grid" className="sr-only" />
                    <Label htmlFor="grid" className="cursor-pointer">
                      <div className="flex justify-center mb-2">
                        <div className="grid grid-cols-2 gap-2 w-24">
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">Grade</p>
                    </Label>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${layout === "list" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <RadioGroupItem value="list" id="list" className="sr-only" />
                    <Label htmlFor="list" className="cursor-pointer">
                      <div className="flex justify-center mb-2">
                        <div className="flex flex-col gap-2 w-24">
                          <div className="h-6 bg-gray-200 rounded w-full"></div>
                          <div className="h-6 bg-gray-200 rounded w-full"></div>
                          <div className="h-6 bg-gray-200 rounded w-full"></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">Lista</p>
                    </Label>
                  </div>

                  <div
                    className={`border rounded-lg p-4 cursor-pointer ${layout === "masonry" ? "border-blue-500 bg-blue-50" : ""}`}
                  >
                    <RadioGroupItem value="masonry" id="masonry" className="sr-only" />
                    <Label htmlFor="masonry" className="cursor-pointer">
                      <div className="flex justify-center mb-2">
                        <div className="grid grid-cols-2 gap-2 w-24">
                          <div className="aspect-square bg-gray-200 rounded"></div>
                          <div className="aspect-[1/1.5] bg-gray-200 rounded"></div>
                          <div className="aspect-[1/1.2] bg-gray-200 rounded"></div>
                          <div className="aspect-square bg-gray-200 rounded"></div>
                        </div>
                      </div>
                      <p className="font-medium text-center">Mosaico</p>
                    </Label>
                  </div>
                </RadioGroup>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Elementos da Interface</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-search" className="font-medium">
                        Barra de Pesquisa
                      </Label>
                      <p className="text-sm text-gray-500">Exibir barra de pesquisa no topo da vitrine</p>
                    </div>
                    <Switch id="show-search" checked={showSearch} onCheckedChange={setShowSearch} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-filters" className="font-medium">
                        Filtros
                      </Label>
                      <p className="text-sm text-gray-500">Exibir opções de filtro para os produtos</p>
                    </div>
                    <Switch id="show-filters" checked={showFilters} onCheckedChange={setShowFilters} />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="products-per-row" className="font-medium">
                        Produtos por Linha
                      </Label>
                      <p className="text-sm text-gray-500">Número de produtos exibidos por linha</p>
                    </div>
                    <Select defaultValue="3">
                      <SelectTrigger id="products-per-row" className="w-24">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2</SelectItem>
                        <SelectItem value="3">3</SelectItem>
                        <SelectItem value="4">4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Visualização</h2>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[9/16] mb-4">
                  <Image src="/placeholder.svg?height=400&width=225" alt="Preview" fill className="object-cover" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Visualização da sua vitrine com as configurações atuais
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Imagens</h2>

                <div className="space-y-6">
                  <div>
                    <Label className="mb-2 block">Logo da Loja</Label>
                    <div className="flex items-center gap-4">
                      <div className="relative h-20 w-20 bg-gray-100 rounded-lg overflow-hidden">
                        <Image src={logoImage || "/placeholder.svg"} alt="Logo" fill className="object-cover" />
                      </div>
                      <Button variant="outline">Alterar Logo</Button>
                    </div>
                  </div>

                  <div>
                    <Label className="mb-2 block">Imagem de Capa</Label>
                    <div className="relative h-40 w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
                      <Image src={coverImage || "/placeholder.svg"} alt="Cover" fill className="object-cover" />
                    </div>
                    <Button variant="outline">Alterar Imagem de Capa</Button>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Textos</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="store-name">Nome da Loja</Label>
                    <Input id="store-name" defaultValue="Loja de Calçados" />
                  </div>

                  <div>
                    <Label htmlFor="store-description">Descrição da Loja</Label>
                    <Textarea
                      id="store-description"
                      defaultValue="Nossa loja física é um lugar acolhedor, onde você pode explorar uma ampla variedade de produtos em um ambiente confortável."
                      className="h-24"
                    />
                  </div>

                  <div>
                    <Label htmlFor="welcome-message">Mensagem de Boas-vindas</Label>
                    <Input id="welcome-message" defaultValue="Bem-vindo à Loja de Calçados!" />
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Visualização</h2>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[9/16] mb-4">
                  <Image src="/placeholder.svg?height=400&width=225" alt="Preview" fill className="object-cover" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Visualização da sua vitrine com as configurações atuais
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Configurações Gerais</h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-prices" className="font-medium">
                        Exibir Preços
                      </Label>
                      <p className="text-sm text-gray-500">Mostrar preços dos produtos na vitrine</p>
                    </div>
                    <Switch id="show-prices" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="show-stock" className="font-medium">
                        Exibir Estoque
                      </Label>
                      <p className="text-sm text-gray-500">Mostrar quantidade em estoque dos produtos</p>
                    </div>
                    <Switch id="show-stock" defaultChecked />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="enable-cart" className="font-medium">
                        Carrinho de Compras
                      </Label>
                      <p className="text-sm text-gray-500">Habilitar funcionalidade de carrinho de compras</p>
                    </div>
                    <Switch id="enable-cart" defaultChecked />
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Domínio e SEO</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="domain">Domínio Personalizado</Label>
                    <div className="flex gap-2">
                      <Input id="domain" defaultValue="lojadecalcados.com.br" />
                      <Button variant="outline">Verificar</Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Você precisa configurar os registros DNS para apontar para nossa plataforma
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="meta-title">Título da Página (SEO)</Label>
                    <Input id="meta-title" defaultValue="Loja de Calçados - Qualidade e Conforto" />
                  </div>

                  <div>
                    <Label htmlFor="meta-description">Descrição da Página (SEO)</Label>
                    <Textarea
                      id="meta-description"
                      defaultValue="Encontre os melhores calçados com qualidade e conforto na Loja de Calçados. Variedade de modelos para todos os gostos e ocasiões."
                      className="h-24"
                    />
                  </div>
                </div>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Visualização</h2>
                <div className="relative bg-gray-100 rounded-lg overflow-hidden aspect-[9/16] mb-4">
                  <Image src="/placeholder.svg?height=400&width=225" alt="Preview" fill className="object-cover" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Visualização da sua vitrine com as configurações atuais
                </p>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={handleBack}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>Salvar Alterações</Button>
      </div>
    </div>
  )
}

