"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/components/ui/use-toast"

export default function ProdutoDetalhesPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")
  const [produto, setProduto] = useState({
    nome: "Tênis Casual Masculino",
    descricao: "Tênis casual em couro legítimo com solado em borracha",
    categoria: "Calçados",
    marca: "CalçaMais",
    sku: "TN-CASUAL-001",
    codigoBarras: "7891234567890",
    peso: "0.8",
    dimensoes: {
      altura: "12",
      largura: "30",
      comprimento: "20",
    },
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.includes(".")) {
      const [parent, child] = name.split(".")
      setProduto({
        ...produto,
        [parent]: {
          ...produto[parent],
          [child]: value,
        },
      })
    } else {
      setProduto({
        ...produto,
        [name]: value,
      })
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: "Detalhes atualizados",
        description: "As informações do produto foram atualizadas com sucesso.",
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
            <h1 className="text-2xl font-bold mb-6">Detalhes do Produto</h1>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações Básicas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="nome">Nome do Produto</Label>
                        <Input id="nome" name="nome" value={produto.nome} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="categoria">Categoria</Label>
                        <Select defaultValue={produto.categoria}>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Calçados">Calçados</SelectItem>
                            <SelectItem value="Roupas">Roupas</SelectItem>
                            <SelectItem value="Acessórios">Acessórios</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="descricao">Descrição</Label>
                      <Textarea
                        id="descricao"
                        name="descricao"
                        rows={4}
                        value={produto.descricao}
                        onChange={handleChange}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="marca">Marca</Label>
                        <Input id="marca" name="marca" value={produto.marca} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="sku">SKU</Label>
                        <Input id="sku" name="sku" value={produto.sku} onChange={handleChange} />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="codigoBarras">Código de Barras</Label>
                      <Input
                        id="codigoBarras"
                        name="codigoBarras"
                        value={produto.codigoBarras}
                        onChange={handleChange}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões e Peso</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="peso">Peso (kg)</Label>
                        <Input
                          id="peso"
                          name="peso"
                          type="number"
                          step="0.01"
                          value={produto.peso}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensoes.altura">Altura (cm)</Label>
                        <Input
                          id="dimensoes.altura"
                          name="dimensoes.altura"
                          type="number"
                          value={produto.dimensoes.altura}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensoes.largura">Largura (cm)</Label>
                        <Input
                          id="dimensoes.largura"
                          name="dimensoes.largura"
                          type="number"
                          value={produto.dimensoes.largura}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensoes.comprimento">Comprimento (cm)</Label>
                        <Input
                          id="dimensoes.comprimento"
                          name="dimensoes.comprimento"
                          type="number"
                          value={produto.dimensoes.comprimento}
                          onChange={handleChange}
                        />
                      </div>
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

