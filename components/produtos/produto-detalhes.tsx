"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Settings, Tag, ShoppingCart, Package, Calendar } from "lucide-react"
import type { Produto } from "@/types/loja"

// Definir interfaces para as variações e opções
interface ProdutoVariacao {
  nome: string
  opcoes: ProdutoVariacaoOpcao[]
}

interface ProdutoVariacaoOpcao {
  nome: string
  preco?: number
  estoque?: number
}

interface ProdutoDetalhesProps {
  produto: Produto
}

export function ProdutoDetalhes({ produto }: ProdutoDetalhesProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("informacoes")

  const handleEdit = () => {
    router.push(`/produtos/${produto._id}/editar`)
  }

  const handleSettings = () => {
    router.push(`/produtos/${produto._id}/configuracoes`)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{produto.nome}</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" /> Editar
            </Button>
            <Button variant="outline" onClick={handleSettings}>
              <Settings className="h-4 w-4 mr-2" /> Configurações
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative aspect-square bg-muted rounded-md overflow-hidden">
              {produto.imagens && produto.imagens.length > 0 ? (
                <Image
                  src={produto.imagens[0] || "/placeholder.svg"}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted">
                  <ShoppingCart className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {produto.destaque && (
                  <Badge className="bg-amber-500 hover:bg-amber-600">
                    <Tag className="h-3 w-3 mr-1" /> Destaque
                  </Badge>
                )}

                {produto.ativo ? (
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                    Ativo
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
                    Inativo
                  </Badge>
                )}

                {produto.categoria && <Badge variant="secondary">{produto.categoria}</Badge>}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Preço</h3>
                {produto.precoPromocional ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm line-through text-muted-foreground">R$ {produto.preco.toFixed(2)}</span>
                    <span className="text-xl font-bold text-red-600">R$ {produto.precoPromocional.toFixed(2)}</span>
                  </div>
                ) : (
                  <span className="text-xl font-bold">R$ {produto.preco.toFixed(2)}</span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Estoque</h3>
                <span className="text-lg">{produto.estoque || 0} unidades</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">SKU: {produto.sku || "Não definido"}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Criado em: {new Date(produto.dataCriacao || produto.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="informacoes">Informações</TabsTrigger>
          <TabsTrigger value="imagens">Imagens</TabsTrigger>
          <TabsTrigger value="variacoes">Variações</TabsTrigger>
          <TabsTrigger value="estatisticas">Estatísticas</TabsTrigger>
        </TabsList>

        <TabsContent value="informacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Descrição do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              {produto.descricao || produto.descricaoCompleta ? (
                <div className="prose max-w-none dark:prose-invert">
                  <p>{produto.descricaoCompleta || produto.descricao}</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma descrição disponível.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imagens" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Imagens do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              {produto.imagens && produto.imagens.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {produto.imagens.map((imagem, index) => (
                    <div key={index} className="relative aspect-square rounded-md overflow-hidden border">
                      <Image
                        src={imagem || "/placeholder.svg"}
                        alt={`${produto.nome} - Imagem ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma imagem disponível.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variacoes" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Variações do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              {produto.variacoes && produto.variacoes.length > 0 ? (
                <div className="space-y-4">
                  {produto.variacoes.map((variacao: ProdutoVariacao, index: number) => (
                    <div key={index} className="border rounded-md p-4">
                      <h3 className="font-medium mb-2">{variacao.nome}</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {variacao.opcoes.map((opcao: ProdutoVariacaoOpcao, idx: number) => (
                          <div key={idx} className="border rounded p-2 text-sm">
                            <div className="font-medium">{opcao.nome}</div>
                            {opcao.preco && <div>Preço: R$ {opcao.preco.toFixed(2)}</div>}
                            {opcao.estoque !== undefined && <div>Estoque: {opcao.estoque}</div>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">Nenhuma variação disponível.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="estatisticas" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Estatísticas do Produto</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Estatísticas não disponíveis.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
