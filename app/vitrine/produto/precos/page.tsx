"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"

export default function ProdutoPrecosPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")
  const [precos, setPrecos] = useState({
    precoOriginal: "349.90",
    precoPromocional: "299.90",
    promocaoAtiva: true,
    custoAquisicao: "180.00",
    margemLucro: "40",
    estoque: "25",
    estoqueMinimo: "5",
    gerenciarEstoque: true,
    permitirVendaSemEstoque: false,
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setPrecos({
      ...precos,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSwitchChange = (name, checked) => {
    setPrecos({
      ...precos,
      [name]: checked,
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Simulação de salvamento
    setTimeout(() => {
      toast({
        title: "Preços e estoque atualizados",
        description: "As informações foram salvas com sucesso.",
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
            <h1 className="text-2xl font-bold mb-6">Preços e Estoque</h1>

            <form onSubmit={handleSubmit}>
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Preços</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="precoOriginal">Preço Original (R$)</Label>
                        <Input
                          id="precoOriginal"
                          name="precoOriginal"
                          type="number"
                          step="0.01"
                          value={precos.precoOriginal}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="precoPromocional">Preço Promocional (R$)</Label>
                        <Input
                          id="precoPromocional"
                          name="precoPromocional"
                          type="number"
                          step="0.01"
                          value={precos.precoPromocional}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="promocaoAtiva"
                        checked={precos.promocaoAtiva}
                        onCheckedChange={(checked) => handleSwitchChange("promocaoAtiva", checked)}
                      />
                      <Label htmlFor="promocaoAtiva">Promoção ativa</Label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="custoAquisicao">Custo de Aquisição (R$)</Label>
                        <Input
                          id="custoAquisicao"
                          name="custoAquisicao"
                          type="number"
                          step="0.01"
                          value={precos.custoAquisicao}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="margemLucro">Margem de Lucro (%)</Label>
                        <Input
                          id="margemLucro"
                          name="margemLucro"
                          type="number"
                          value={precos.margemLucro}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Estoque</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="gerenciarEstoque"
                        checked={precos.gerenciarEstoque}
                        onCheckedChange={(checked) => handleSwitchChange("gerenciarEstoque", checked)}
                      />
                      <Label htmlFor="gerenciarEstoque">Gerenciar estoque</Label>
                    </div>

                    {precos.gerenciarEstoque && (
                      <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="estoque">Quantidade em Estoque</Label>
                            <Input
                              id="estoque"
                              name="estoque"
                              type="number"
                              value={precos.estoque}
                              onChange={handleChange}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
                            <Input
                              id="estoqueMinimo"
                              name="estoqueMinimo"
                              type="number"
                              value={precos.estoqueMinimo}
                              onChange={handleChange}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Switch
                            id="permitirVendaSemEstoque"
                            checked={precos.permitirVendaSemEstoque}
                            onCheckedChange={(checked) => handleSwitchChange("permitirVendaSemEstoque", checked)}
                          />
                          <Label htmlFor="permitirVendaSemEstoque">Permitir venda sem estoque</Label>
                        </div>
                      </>
                    )}
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

