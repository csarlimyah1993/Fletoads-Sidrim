"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, ArrowLeft } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

interface Cliente {
  _id: string
  nome: string
  email: string
  telefone: string
}

interface Produto {
  _id: string
  nome: string
  preco: number
  estoque: number
  imagem?: string
}

interface ItemVenda {
  produtoId: string
  produto: Produto
  quantidade: number
  precoUnitario: number
  subtotal: number
}

export default function NovaVendaPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [clienteSelecionado, setClienteSelecionado] = useState<string>("")
  const [itens, setItens] = useState<ItemVenda[]>([])
  const [produtoSelecionado, setProdutoSelecionado] = useState<string>("")
  const [quantidade, setQuantidade] = useState<number>(1)
  const [desconto, setDesconto] = useState<number>(0)
  const [formaPagamento, setFormaPagamento] = useState<string>("dinheiro")
  const [observacao, setObservacao] = useState<string>("")
  const [isLoading, setIsLoading] = useState({
    clientes: true,
    produtos: true,
    submit: false,
  })
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()

  useEffect(() => {
    fetchClientes()
    fetchProdutos()
  }, [])

  const fetchClientes = async () => {
    try {
      const response = await fetch("/api/dashboard/clientes")
      if (response.ok) {
        const data = await response.json()
        setClientes(data.clientes || [])
      } else {
        console.error("Erro ao buscar clientes:", response.status)
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, clientes: false }))
    }
  }

  const fetchProdutos = async () => {
    try {
      const response = await fetch("/api/dashboard/produtos")
      if (response.ok) {
        const data = await response.json()
        setProdutos(data.produtos || [])
      } else {
        console.error("Erro ao buscar produtos:", response.status)
      }
    } catch (error) {
      console.error("Erro ao buscar produtos:", error)
    } finally {
      setIsLoading((prev) => ({ ...prev, produtos: false }))
    }
  }

  const handleAddItem = () => {
    if (!produtoSelecionado || quantidade <= 0) return

    const produto = produtos.find((p) => p._id === produtoSelecionado)
    if (!produto) return

    // Verificar se o produto já está na lista
    const itemExistente = itens.find((item) => item.produtoId === produtoSelecionado)

    if (itemExistente) {
      // Atualizar quantidade do item existente
      const novaQuantidade = itemExistente.quantidade + quantidade

      if (novaQuantidade > produto.estoque) {
        alert(`Estoque insuficiente. Disponível: ${produto.estoque}`)
        return
      }

      const novosItens = itens.map((item) => {
        if (item.produtoId === produtoSelecionado) {
          return {
            ...item,
            quantidade: novaQuantidade,
            subtotal: produto.preco * novaQuantidade,
          }
        }
        return item
      })

      setItens(novosItens)
    } else {
      // Adicionar novo item
      if (quantidade > produto.estoque) {
        alert(`Estoque insuficiente. Disponível: ${produto.estoque}`)
        return
      }

      const novoItem: ItemVenda = {
        produtoId: produto._id,
        produto,
        quantidade,
        precoUnitario: produto.preco,
        subtotal: produto.preco * quantidade,
      }

      setItens([...itens, novoItem])
    }

    // Limpar seleção
    setProdutoSelecionado("")
    setQuantidade(1)
  }

  const handleRemoveItem = (produtoId: string) => {
    setItens(itens.filter((item) => item.produtoId !== produtoId))
  }

  const calcularTotal = () => {
    return itens.reduce((total, item) => total + item.subtotal, 0)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!clienteSelecionado) {
      setError("Selecione um cliente")
      return
    }

    if (itens.length === 0) {
      setError("Adicione pelo menos um produto")
      return
    }

    try {
      setIsLoading((prev) => ({ ...prev, submit: true }))
      setError(null)

      const total = calcularTotal()

      if (desconto > total) {
        setError("O desconto não pode ser maior que o total")
        return
      }

      const vendaData = {
        clienteId: clienteSelecionado,
        itens: itens.map((item) => ({
          produtoId: item.produtoId,
          quantidade: item.quantidade,
          precoUnitario: item.precoUnitario,
          subtotal: item.subtotal,
        })),
        desconto,
        total: total - desconto,
        formaPagamento,
        observacao,
      }

      const response = await fetch("/api/dashboard/vendas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vendaData),
      })

      if (response.ok) {
        router.push("/dashboard/vendas")
      } else {
        const errorData = await response.json()
        setError(errorData.message || "Erro ao criar venda")
      }
    } catch (error) {
      console.error("Erro ao criar venda:", error)
      setError("Erro ao criar venda")
    } finally {
      setIsLoading((prev) => ({ ...prev, submit: false }))
    }
  }

  return (
    <div className="container py-10">
      <Button variant="ghost" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar
      </Button>
      <Card>
        <CardHeader>
          <CardTitle>Nova Venda</CardTitle>
          <CardDescription>Registar uma nova venda no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md border border-destructive/50 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div>
              <Label htmlFor="cliente">Cliente</Label>
              <Select value={clienteSelecionado} onValueChange={setClienteSelecionado}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {isLoading.clientes ? (
                    <SelectItem value="loading" disabled>
                      <Skeleton className="h-9 w-full" />
                    </SelectItem>
                  ) : (
                    clientes.map((cliente) => (
                      <SelectItem key={cliente._id} value={cliente._id}>
                        {cliente.nome}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="produto">Produto</Label>
              <div className="flex gap-2">
                <Select value={produtoSelecionado} onValueChange={setProdutoSelecionado}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um produto" />
                  </SelectTrigger>
                  <SelectContent>
                    {isLoading.produtos ? (
                      <SelectItem value="loading" disabled>
                        <Skeleton className="h-9 w-full" />
                      </SelectItem>
                    ) : (
                      produtos.map((produto) => (
                        <SelectItem key={produto._id} value={produto._id}>
                          {produto.nome} - {produto.preco.toFixed(2)} - Estoque: {produto.estoque}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min="1"
                  value={quantidade}
                  onChange={(e) => setQuantidade(Number(e.target.value))}
                  className="w-24"
                />
                <Button type="button" onClick={handleAddItem}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar
                </Button>
              </div>
            </div>

            <div>
              <Label>Itens da Venda</Label>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead>Subtotal</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {itens.map((item) => (
                    <TableRow key={item.produtoId}>
                      <TableCell>{item.produto.nome}</TableCell>
                      <TableCell>{item.quantidade}</TableCell>
                      <TableCell>{item.precoUnitario.toFixed(2)}</TableCell>
                      <TableCell>{item.subtotal.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.produtoId)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {itens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">
                        Nenhum item adicionado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="desconto">Desconto</Label>
                <Input
                  type="number"
                  id="desconto"
                  value={desconto}
                  onChange={(e) => setDesconto(Number(e.target.value))}
                />
              </div>

              <div>
                <Label htmlFor="formaPagamento">Forma de Pagamento</Label>
                <Select value={formaPagamento} onValueChange={setFormaPagamento}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dinheiro">Dinheiro</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="debito">Débito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="observacao">Observação</Label>
              <Textarea id="observacao" value={observacao} onChange={(e) => setObservacao(e.target.value)} />
            </div>

            <div className="flex justify-between">
              <div>
                Total: R$ {calcularTotal().toFixed(2)}
                {desconto > 0 && (
                  <>
                    <br />
                    Desconto: R$ {desconto.toFixed(2)}
                    <br />
                    Total com Desconto: R$ {(calcularTotal() - desconto).toFixed(2)}
                  </>
                )}
              </div>
              <Button type="submit" disabled={isLoading.submit}>
                {isLoading.submit ? "Criando..." : "Criar Venda"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
