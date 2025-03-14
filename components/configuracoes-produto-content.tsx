"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { ArrowLeft, Upload, Mail, Phone, Globe, Truck, Tag, Percent } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { VitrineSidebar } from "@/components/vitrine-sidebar"

export function ConfiguracoesProdutoContent({ id }) {
  const router = useRouter()
  const [imagem, setImagem] = useState<string | null>("/placeholder.svg?height=300&width=300")
  const [activeTab, setActiveTab] = useState("informacoes")
  const [fazEntrega, setFazEntrega] = useState(true)
  const [integracaoUber, setIntegracaoUber] = useState(false)

  // Dados simulados do produto
  const produto = {
    nome: "Tênis Casual Masculino",
    descricao:
      "Tênis casual em couro legítimo com solado em borracha antiderrapante. Disponível em várias cores e tamanhos.",
    categoria: "Calçados",
    precoOriginal: 349.9,
    preco: 299.9,
    vendedor: "Loja de Calçados",
    email: "contato@lojadecalcados.com",
    telefone: "(92) 98888-7777",
    paginaVendas: "https://www.lojadecalcados.com/tenis-casual",
    informacoesComplementares: "Produto importado. Garantia de 30 dias contra defeitos de fabricação.",
  }

  const handleImagemChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Aqui você implementaria o upload da imagem
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagem(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <VitrineSidebar />
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold">Configurações do Produto</h1>
          </div>

          {/* Preview do produto */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="relative w-full md:w-1/3 aspect-square rounded-lg overflow-hidden">
                <Image src={imagem || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-bold mb-2">{produto.nome}</h2>
                <p className="text-gray-600 mb-4">{produto.descricao}</p>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-sm text-gray-500 line-through">R$ {produto.precoOriginal.toFixed(2)}</span>
                  <span className="text-2xl font-bold text-orange-500">R$ {produto.preco.toFixed(2)}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="px-3 py-1">
                    {produto.categoria}
                  </Badge>
                  <Badge className="bg-green-500 px-3 py-1">ATIVO</Badge>
                </div>
              </div>
            </div>
          </Card>

          {/* Tabs de configuração */}
          <Tabs defaultValue="informacoes" onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="informacoes">Informações</TabsTrigger>
              <TabsTrigger value="precos">Preços e Vendas</TabsTrigger>
              <TabsTrigger value="entrega">Entrega</TabsTrigger>
            </TabsList>

            {/* Tab de Informações Básicas */}
            <TabsContent value="informacoes">
              <Card className="p-6">
                {/* Upload de imagem */}
                <div className="mb-6">
                  <Label className="mb-2 block">Imagem do produto</Label>
                  <div className="relative h-[240px] w-full bg-gray-100 rounded-lg overflow-hidden mb-2">
                    {imagem ? (
                      <Image src={imagem || "/placeholder.svg"} alt="Preview" fill className="object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full">
                        <Upload className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Clique para fazer upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={handleImagemChange}
                    />
                  </div>
                  <p className="text-xs text-gray-500">
                    Aceitamos os formatos jpg e png com menos de 500kb. Sugestão de tamanho: 750 x 750px
                  </p>
                </div>

                {/* Nome */}
                <div className="mb-4">
                  <Label htmlFor="nome">Nome do produto</Label>
                  <Input id="nome" defaultValue={produto.nome} />
                  <p className="text-xs text-gray-500 mt-1">
                    Esse nome será exibido em todos os locais da vitrine (0/60 caracteres)
                  </p>
                </div>

                {/* Categoria */}
                <div className="mb-4">
                  <Label htmlFor="categoria">Categoria</Label>
                  <Input id="categoria" defaultValue={produto.categoria} />
                </div>

                {/* Descrição */}
                <div className="mb-4">
                  <Label htmlFor="descricao">Descrição</Label>
                  <Textarea id="descricao" defaultValue={produto.descricao} className="h-32" />
                  <p className="text-xs text-gray-500 mt-1">177/200 caracteres</p>
                </div>

                {/* Informações complementares */}
                <div>
                  <Label htmlFor="informacoesComplementares">Informações complementares</Label>
                  <Textarea
                    id="informacoesComplementares"
                    defaultValue={produto.informacoesComplementares}
                    className="h-32"
                  />
                </div>
              </Card>
            </TabsContent>

            {/* Tab de Preços e Vendas */}
            <TabsContent value="precos">
              <Card className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="precoOriginal" className="flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Preço original
                    </Label>
                    <div className="relative">
                      <Input
                        id="precoOriginal"
                        type="number"
                        step="0.01"
                        defaultValue={produto.precoOriginal}
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="precoPromocional" className="flex items-center gap-2">
                      <Percent className="h-4 w-4" />
                      Preço promocional
                    </Label>
                    <div className="relative">
                      <Input
                        id="precoPromocional"
                        type="number"
                        step="0.01"
                        defaultValue={produto.preco}
                        className="pl-8"
                      />
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">R$</span>
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <Label htmlFor="paginaVendas" className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Página de vendas
                  </Label>
                  <Input id="paginaVendas" defaultValue={produto.paginaVendas} placeholder="URL da sua oferta" />
                  <p className="text-xs text-gray-500 mt-1">
                    Link para onde o cliente será direcionado ao clicar no produto
                  </p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Suporte ao comprador</h3>

                  {/* Nome do vendedor */}
                  <div className="mb-4">
                    <Label htmlFor="vendedor">Nome do vendedor</Label>
                    <Input id="vendedor" defaultValue={produto.vendedor} />
                  </div>

                  {/* Email */}
                  <div className="mb-4">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <Input id="email" defaultValue={produto.email} className="pl-10" />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Telefone */}
                  <div>
                    <Label htmlFor="telefone">
                      Telefone <span className="text-gray-400 text-sm">(opcional)</span>
                    </Label>
                    <div className="relative">
                      <Input id="telefone" defaultValue={produto.telefone} className="pl-10" />
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            {/* Tab de Entrega */}
            <TabsContent value="entrega">
              <Card className="p-6">
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Truck className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="font-medium">Entrega do produto</p>
                        <p className="text-sm text-gray-500">Você realiza a entrega deste produto?</p>
                      </div>
                    </div>
                    <Switch checked={fazEntrega} onCheckedChange={setFazEntrega} />
                  </div>

                  {fazEntrega && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <svg
                              width="20"
                              height="20"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                                stroke="#475569"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                              <path
                                d="M16.2398 7.76001L14.1198 14.12L7.75977 16.24L9.87977 9.88001L16.2398 7.76001Z"
                                stroke="#475569"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Integração com Uber</p>
                            <p className="text-sm text-gray-500">Permitir entregas via Uber Direct</p>
                          </div>
                        </div>
                        <Switch checked={integracaoUber} onCheckedChange={setIntegracaoUber} />
                      </div>

                      {integracaoUber && (
                        <div className="bg-gray-50 p-4 rounded-lg">
                          <p className="text-sm text-gray-600 mb-4">Configure as opções de entrega via Uber Direct:</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="raioEntrega">Raio de entrega (km)</Label>
                              <Input id="raioEntrega" type="number" defaultValue={10} />
                            </div>
                            <div>
                              <Label htmlFor="tempoEstimado">Tempo estimado (minutos)</Label>
                              <Input id="tempoEstimado" type="number" defaultValue={45} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Botões de ação */}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancelar
            </Button>
            <Button>Salvar alterações</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

