"use client"

import { useState } from "react"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function PersonalizacaoContent() {
  const [primaryColor, setPrimaryColor] = useState("#3b82f6")
  const [secondaryColor, setSecondaryColor] = useState("#f59e0b")
  const [fontFamily, setFontFamily] = useState("Inter")
  // Add state for sidebar open/close functionality
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true)

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Personalização</h1>
          <p className="text-gray-500 mb-6">Personalize a aparência da sua loja e produtos.</p>

          <Tabs defaultValue="tema">
            <TabsList className="mb-6">
              <TabsTrigger value="tema">Tema</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
              <TabsTrigger value="fontes">Fontes</TabsTrigger>
            </TabsList>

            <TabsContent value="tema">
              <Card className="p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Cores do Tema</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  </div>
                </div>

                <div className="mt-6">
                  <Label>Temas Pré-definidos</Label>
                  <div className="grid grid-cols-4 gap-4 mt-2">
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
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Estilo dos Botões</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="button-style">Estilo dos Botões</Label>
                    <Select defaultValue="rounded">
                      <SelectTrigger id="button-style" className="mt-1">
                        <SelectValue placeholder="Selecione um estilo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rounded">Arredondado</SelectItem>
                        <SelectItem value="pill">Pílula</SelectItem>
                        <SelectItem value="square">Quadrado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Visualização</Label>
                    <div className="flex gap-4 mt-2">
                      <Button>Botão Primário</Button>
                      <Button variant="outline">Botão Secundário</Button>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="layout">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Layout da Loja</h2>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="product-layout">Layout de Produtos</Label>
                    <Select defaultValue="grid">
                      <SelectTrigger id="product-layout" className="mt-1">
                        <SelectValue placeholder="Selecione um layout" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="grid">Grade</SelectItem>
                        <SelectItem value="list">Lista</SelectItem>
                        <SelectItem value="masonry">Mosaico</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="products-per-row">Produtos por Linha</Label>
                    <Select defaultValue="3">
                      <SelectTrigger id="products-per-row" className="mt-1">
                        <SelectValue placeholder="Selecione a quantidade" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2">2 Produtos</SelectItem>
                        <SelectItem value="3">3 Produtos</SelectItem>
                        <SelectItem value="4">4 Produtos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="fontes">
              <Card className="p-6">
                <h2 className="text-lg font-semibold mb-4">Fontes</h2>

                <div className="space-y-4">
                  <div>
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
                      <p>
                        Este é um texto de exemplo para visualizar a fonte selecionada. A fonte atual é {fontFamily}.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end mt-6">
            <Button variant="outline" className="mr-2">
              Cancelar
            </Button>
            <Button>Salvar Alterações</Button>
          </div>
        </div>
      </div>
    </div>
  )
}
