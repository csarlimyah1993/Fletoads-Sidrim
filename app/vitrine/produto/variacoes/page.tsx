"use client"

import { Header } from "@/components/header"
import { VitrineSidebar } from "@/components/vitrine-sidebar"
import { useSearchParams } from "next/navigation"
import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, Edit } from "lucide-react"
import { toast } from "@/components/ui/use-toast"

export default function ProdutoVariacoesPage() {
  const searchParams = useSearchParams()
  const produtoId = searchParams.get("produtoId")
  const [possuiVariacoes, setPossuiVariacoes] = useState(true)
  const [novoAtributo, setNovoAtributo] = useState("")
  const [novoValor, setNovoValor] = useState("")
  const [editandoIndex, setEditandoIndex] = useState(null)

  const [atributos, setAtributos] = useState([
    { nome: "Cor", valores: ["Preto", "Branco", "Marrom"] },
    { nome: "Tamanho", valores: ["38", "39", "40", "41", "42"] },
  ])

  const [variacoes, setVariacoes] = useState([
    { id: 1, cor: "Preto", tamanho: "38", preco: "299.90", estoque: 5, sku: "TN-CASUAL-001-P-38" },
    { id: 2, cor: "Preto", tamanho: "39", preco: "299.90", estoque: 8, sku: "TN-CASUAL-001-P-39" },
    { id: 3, cor: "Branco", tamanho: "40", preco: "309.90", estoque: 3, sku: "TN-CASUAL-001-B-40" },
    { id: 4, cor: "Marrom", tamanho: "42", preco: "319.90", estoque: 2, sku: "TN-CASUAL-001-M-42" },
  ])

  const adicionarAtributo = () => {
    if (novoAtributo.trim() === "") return

    setAtributos([...atributos, { nome: novoAtributo, valores: [] }])
    setNovoAtributo("")
  }

  const adicionarValor = (atributoIndex) => {
    if (novoValor.trim() === "") return

    const novosAtributos = [...atributos]
    novosAtributos[atributoIndex].valores.push(novoValor)
    setAtributos(novosAtributos)
    setNovoValor("")
  }

  const removerAtributo = (index) => {
    const novosAtributos = [...atributos]
    novosAtributos.splice(index, 1)
    setAtributos(novosAtributos)
  }

  const removerValor = (atributoIndex, valorIndex) => {
    const novosAtributos = [...atributos]
    novosAtributos[atributoIndex].valores.splice(valorIndex, 1)
    setAtributos(novosAtributos)
  }

  const gerarVariacoes = () => {
    // Lógica para gerar todas as combinações possíveis de variações
    toast({
      title: "Variações geradas",
      description: "Todas as combinações de variações foram geradas com sucesso.",
    })
  }

  const salvarVariacoes = () => {
    toast({
      title: "Variações salvas",
      description: "As variações do produto foram salvas com sucesso.",
    })
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
            <h1 className="text-2xl font-bold mb-6">Variações do Produto</h1>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Configuração de Variações</CardTitle>
                  <CardDescription>Configure se o produto possui variações como tamanho, cor, etc.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center space-x-2">
                    <Switch id="possuiVariacoes" checked={possuiVariacoes} onCheckedChange={setPossuiVariacoes} />
                    <Label htmlFor="possuiVariacoes">Este produto possui variações</Label>
                  </div>
                </CardContent>
              </Card>

              {possuiVariacoes && (
                <>
                  <Card>
                    <CardHeader>
                      <CardTitle>Atributos</CardTitle>
                      <CardDescription>Adicione atributos como cor, tamanho, etc.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nome do atributo (ex: Cor)"
                          value={novoAtributo}
                          onChange={(e) => setNovoAtributo(e.target.value)}
                        />
                        <Button onClick={adicionarAtributo}>
                          <Plus className="h-4 w-4 mr-2" />
                          Adicionar
                        </Button>
                      </div>

                      {atributos.map((atributo, atributoIndex) => (
                        <Card key={atributoIndex} className="border-dashed">
                          <CardHeader className="py-3">
                            <div className="flex items-center justify-between">
                              <CardTitle className="text-base">{atributo.nome}</CardTitle>
                              <Button variant="ghost" size="sm" onClick={() => removerAtributo(atributoIndex)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </CardHeader>
                          <CardContent className="py-2 space-y-3">
                            <div className="flex gap-2">
                              <Input
                                placeholder={`Valor para ${atributo.nome}`}
                                value={editandoIndex === atributoIndex ? novoValor : ""}
                                onChange={(e) => {
                                  setNovoValor(e.target.value)
                                  setEditandoIndex(atributoIndex)
                                }}
                              />
                              <Button onClick={() => adicionarValor(atributoIndex)}>Adicionar</Button>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {atributo.valores.map((valor, valorIndex) => (
                                <div key={valorIndex} className="flex items-center bg-gray-100 rounded-md px-3 py-1">
                                  <span className="mr-2">{valor}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-5 w-5 p-0"
                                    onClick={() => removerValor(atributoIndex, valorIndex)}
                                  >
                                    <Trash2 className="h-3 w-3 text-red-500" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}

                      <Button onClick={gerarVariacoes} className="w-full">
                        Gerar Todas as Variações
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Lista de Variações</CardTitle>
                      <CardDescription>Gerencie as variações do produto, seus preços e estoques</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            {atributos.map((atributo) => (
                              <TableHead key={atributo.nome}>{atributo.nome}</TableHead>
                            ))}
                            <TableHead>Preço (R$)</TableHead>
                            <TableHead>Estoque</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead className="w-[100px]">Ações</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {variacoes.map((variacao) => (
                            <TableRow key={variacao.id}>
                              {atributos.map((atributo) => (
                                <TableCell key={atributo.nome}>{variacao[atributo.nome.toLowerCase()]}</TableCell>
                              ))}
                              <TableCell>
                                <Input type="number" step="0.01" value={variacao.preco} className="w-20 h-8" />
                              </TableCell>
                              <TableCell>
                                <Input type="number" value={variacao.estoque} className="w-16 h-8" />
                              </TableCell>
                              <TableCell>{variacao.sku}</TableCell>
                              <TableCell>
                                <div className="flex gap-1">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}

              <div className="flex justify-end gap-2">
                <Button variant="outline">Cancelar</Button>
                <Button onClick={salvarVariacoes}>Salvar Variações</Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

