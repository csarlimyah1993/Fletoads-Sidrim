"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

export default function ProdutoSeoPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")

  const [seo, setSeo] = useState({
    metaTitulo: "Tênis Casual Masculino em Couro | CalçaMais",
    metaDescricao:
      "Tênis casual em couro legítimo com solado em borracha. Conforto e estilo para o dia a dia. Compre agora com frete grátis!",
    palavrasChave: "tênis casual, tênis masculino, tênis em couro, calçados masculinos",
    urlAmigavel: "tenis-casual-masculino-couro",
    altImagens: "Tênis casual masculino em couro legítimo na cor preta",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setSeo({
      ...seo,
      [name]: value,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: "SEO atualizado",
        description: "As informações de SEO foram atualizadas com sucesso.",
      })
    }, 1000)
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
          <div className="max-w-3xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">SEO do Produto</h1>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Otimização para Mecanismos de Busca</CardTitle>
                    <CardDescription>
                      Configure as informações de SEO para melhorar o posicionamento do seu produto nos resultados de
                      busca.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="metaTitulo">Meta Título</Label>
                      <Input id="metaTitulo" name="metaTitulo" value={seo.metaTitulo} onChange={handleChange} />
                      <p className="text-xs text-gray-500">
                        Recomendado: 50-60 caracteres. Atual: {seo.metaTitulo.length} caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="metaDescricao">Meta Descrição</Label>
                      <Textarea
                        id="metaDescricao"
                        name="metaDescricao"
                        rows={3}
                        value={seo.metaDescricao}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-gray-500">
                        Recomendado: 150-160 caracteres. Atual: {seo.metaDescricao.length} caracteres
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="palavrasChave">Palavras-chave</Label>
                      <Input
                        id="palavrasChave"
                        name="palavrasChave"
                        value={seo.palavrasChave}
                        onChange={handleChange}
                      />
                      <p className="text-xs text-gray-500">Separe as palavras-chave por vírgulas</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="urlAmigavel">URL Amigável</Label>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                          seusite.com.br/produto/
                        </span>
                        <Input
                          id="urlAmigavel"
                          name="urlAmigavel"
                          className="rounded-l-none"
                          value={seo.urlAmigavel}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="altImagens">Texto Alternativo para Imagens</Label>
                      <Input id="altImagens" name="altImagens" value={seo.altImagens} onChange={handleChange} />
                      <p className="text-xs text-gray-500">Descrição das imagens para acessibilidade e SEO</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Prévia nos Resultados de Busca</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-4 bg-white">
                      <div className="text-blue-600 text-lg font-medium line-clamp-1">{seo.metaTitulo}</div>
                      <div className="text-green-700 text-sm line-clamp-1">
                        seusite.com.br/produto/{seo.urlAmigavel}
                      </div>
                      <div className="text-gray-600 text-sm mt-1 line-clamp-2">{seo.metaDescricao}</div>
                    </div>
                  </CardContent>
                </Card>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline">
                    Cancelar
                  </Button>
                  <Button type="submit">Salvar Alterações</Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
}

