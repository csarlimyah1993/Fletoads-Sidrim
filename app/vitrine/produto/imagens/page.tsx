"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, X, ImageIcon, Move } from "lucide-react"
import Image from "next/image"
import { toast } from "@/components/ui/use-toast"

export default function ProdutoImagensPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")

  const [imagens, setImagens] = useState([
    { id: "img1", url: "/placeholder.svg?height=300&width=300", principal: true },
    { id: "img2", url: "/placeholder.svg?height=300&width=300", principal: false },
    { id: "img3", url: "/placeholder.svg?height=300&width=300", principal: false },
  ])

  const definirImagemPrincipal = (id) => {
    setImagens(
      imagens.map((img) => ({
        ...img,
        principal: img.id === id,
      })),
    )
  }

  const removerImagem = (id) => {
    setImagens(imagens.filter((img) => img.id !== id))
  }

  const moverImagem = (fromIndex, toIndex) => {
    const result = Array.from(imagens)
    const [removed] = result.splice(fromIndex, 1)
    result.splice(toIndex, 0, removed)
    setImagens(result)
  }

  const adicionarImagens = (e) => {
    // Simulação de upload
    toast({
      title: "Upload iniciado",
      description: "As imagens estão sendo enviadas...",
    })

    setTimeout(() => {
      toast({
        title: "Upload concluído",
        description: "As imagens foram adicionadas com sucesso.",
      })
    }, 2000)
  }

  if (!produtoId) {
    return <div className="p-4">Nenhum produto selecionado</div>
  }

  return (
    <>
      <Header />
      <div className="flex flex-col lg:flex-row h-auto lg:h-[calc(100vh-4rem)]">
        <VitrineSidebar />
        <div className="flex-1 overflow-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Imagens do Produto</h1>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload de Imagens</CardTitle>
                  <CardDescription>
                    Adicione imagens para o seu produto. A primeira imagem será usada como imagem principal.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Input
                      type="file"
                      id="imagens"
                      className="hidden"
                      multiple
                      accept="image/*"
                      onChange={adicionarImagens}
                    />
                    <Label htmlFor="imagens" className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <Upload className="h-10 w-10 text-gray-400 mb-2" />
                        <p className="text-sm font-medium mb-1">Arraste e solte as imagens aqui</p>
                        <p className="text-xs text-gray-500 mb-3">Ou clique para selecionar arquivos</p>
                        <Button type="button" variant="outline" size="sm">
                          Selecionar Imagens
                        </Button>
                      </div>
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gerenciar Imagens</CardTitle>
                  <CardDescription>Organize as imagens do produto. Arraste para reordenar.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {imagens.map((imagem, index) => (
                      <div
                        key={imagem.id}
                        className={`relative border rounded-lg overflow-hidden group ${
                          imagem.principal ? "ring-2 ring-blue-500" : ""
                        }`}
                      >
                        <div className="aspect-square relative">
                          <Image
                            src={imagem.url || "/placeholder.svg"}
                            alt="Imagem do produto"
                            fill
                            className="object-cover"
                          />
                        </div>

                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-1">
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => definirImagemPrincipal(imagem.id)}
                            >
                              <ImageIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => removerImagem(imagem.id)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="secondary"
                              size="sm"
                              className="h-8 w-8 p-0 cursor-move"
                              onClick={() => {
                                // Mover para a esquerda se não for o primeiro
                                if (index > 0) {
                                  moverImagem(index, index - 1)
                                }
                              }}
                            >
                              <Move className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        {imagem.principal && (
                          <div className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                            Principal
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button>Salvar Alterações</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

