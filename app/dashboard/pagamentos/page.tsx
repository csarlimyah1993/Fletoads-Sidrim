"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CreditCard, Trash2, Edit, Copy, QrCode } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import StripeCardElement from "@/components/payment/stripe-card-element"

interface CartaoProps {
  id: string
  brand: string
  last4: string
  exp_month: number
  exp_year: number
}

interface PixProps {
  _id: string
  chave: string
  tipo: string
  nome: string
}

export default function PagamentosPage() {
  const { data: session } = useSession()
  const router = useRouter()

  const [cartoes, setCartoes] = useState<CartaoProps[]>([])
  const [pixKeys, setPixKeys] = useState<PixProps[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Estados para adicionar cartão
  const [addingCard, setAddingCard] = useState(false)
  const [isSubmittingCard, setIsSubmittingCard] = useState(false)

  // Estados para adicionar PIX
  const [addingPix, setAddingPix] = useState(false)
  const [pixChave, setPixChave] = useState("")
  const [pixTipo, setPixTipo] = useState("cpf")
  const [pixNome, setPixNome] = useState("")

  // Estados para editar PIX
  const [editingPix, setEditingPix] = useState<PixProps | null>(null)
  const [editPixChave, setEditPixChave] = useState("")
  const [editPixTipo, setEditPixTipo] = useState("")
  const [editPixNome, setEditPixNome] = useState("")

  useEffect(() => {
    if (session) {
      fetchPaymentMethods()
    }
  }, [session])

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/pagamentos/metodos")

      if (!response.ok) {
        throw new Error("Falha ao buscar métodos de pagamento")
      }

      const data = await response.json()
      setCartoes(data.cartoes || [])
      setPixKeys(data.pix || [])
      setError("")
    } catch (err) {
      console.error("Erro ao buscar métodos de pagamento:", err)
      setError("Não foi possível carregar seus métodos de pagamento")
    } finally {
      setLoading(false)
    }
  }

  const handleCardSuccess = async (paymentMethodId: string) => {
    try {
      setIsSubmittingCard(true)

      // Enviar para o servidor
      const response = await fetch("/api/pagamentos/metodos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "cartao",
          dados: {
            paymentMethodId,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao adicionar cartão")
      }

      // Atualizar lista
      fetchPaymentMethods()

      // Fechar modal
      setAddingCard(false)

      toast({
        title: "Cartão adicionado",
        description: "Seu cartão foi adicionado com sucesso",
      })
    } catch (err) {
      console.error("Erro ao adicionar cartão:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao adicionar cartão",
        variant: "destructive",
      })
    } finally {
      setIsSubmittingCard(false)
    }
  }

  const handleAddPix = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      // Validação básica
      if (!pixChave.trim()) {
        toast({
          title: "Erro",
          description: "A chave PIX é obrigatória",
          variant: "destructive",
        })
        return
      }

      if (!pixNome.trim()) {
        toast({
          title: "Erro",
          description: "O nome da chave é obrigatório",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/pagamentos/metodos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "pix",
          dados: {
            chave: pixChave,
            tipo: pixTipo,
            nome: pixNome,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao adicionar chave PIX")
      }

      // Limpar formulário
      setPixChave("")
      setPixTipo("cpf")
      setPixNome("")
      setAddingPix(false)

      // Atualizar lista
      fetchPaymentMethods()

      toast({
        title: "Chave PIX adicionada",
        description: "Sua chave PIX foi adicionada com sucesso",
      })
    } catch (err) {
      console.error("Erro ao adicionar PIX:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao adicionar chave PIX",
        variant: "destructive",
      })
    }
  }

  const handleEditPix = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingPix) return

    try {
      // Validação básica
      if (!editPixChave.trim()) {
        toast({
          title: "Erro",
          description: "A chave PIX é obrigatória",
          variant: "destructive",
        })
        return
      }

      if (!editPixNome.trim()) {
        toast({
          title: "Erro",
          description: "O nome da chave é obrigatório",
          variant: "destructive",
        })
        return
      }

      const response = await fetch("/api/pagamentos/metodos", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          tipo: "pix",
          id: editingPix._id,
          dados: {
            chave: editPixChave,
            tipo: editPixTipo,
            nome: editPixNome,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao atualizar chave PIX")
      }

      // Limpar formulário
      setEditingPix(null)

      // Atualizar lista
      fetchPaymentMethods()

      toast({
        title: "Chave PIX atualizada",
        description: "Sua chave PIX foi atualizada com sucesso",
      })
    } catch (err) {
      console.error("Erro ao atualizar PIX:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao atualizar chave PIX",
        variant: "destructive",
      })
    }
  }

  const handleRemoveCard = async (id: string) => {
    try {
      const response = await fetch(`/api/pagamentos/metodos?tipo=cartao&id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao remover cartão")
      }

      // Atualizar lista
      fetchPaymentMethods()

      toast({
        title: "Cartão removido",
        description: "Seu cartão foi removido com sucesso",
      })
    } catch (err) {
      console.error("Erro ao remover cartão:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao remover cartão",
        variant: "destructive",
      })
    }
  }

  const handleRemovePix = async (id: string) => {
    try {
      const response = await fetch(`/api/pagamentos/metodos?tipo=pix&id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Falha ao remover chave PIX")
      }

      // Atualizar lista
      fetchPaymentMethods()

      toast({
        title: "Chave PIX removida",
        description: "Sua chave PIX foi removida com sucesso",
      })
    } catch (err) {
      console.error("Erro ao remover PIX:", err)
      toast({
        title: "Erro",
        description: err instanceof Error ? err.message : "Falha ao remover chave PIX",
        variant: "destructive",
      })
    }
  }

  const startEditPix = (pix: PixProps) => {
    setEditingPix(pix)
    setEditPixChave(pix.chave)
    setEditPixTipo(pix.tipo)
    setEditPixNome(pix.nome)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copiado!",
      description: "Texto copiado para a área de transferência",
    })
  }

  const renderCartoes = () => {
    if (cartoes.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Você ainda não tem cartões cadastrados</p>
          <Button onClick={() => setAddingCard(true)} className="mt-4">
            Adicionar Cartão
          </Button>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {cartoes.map((cartao: any) => (
          <Card key={cartao.id} className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {cartao.card.brand.charAt(0).toUpperCase() + cartao.card.brand.slice(1)}
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveCard(cartao.id)}>
                  <Trash2 className="h-5 w-5 text-destructive" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Número</span>
                  <span className="font-medium">•••• {cartao.card.last4}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validade</span>
                  <span className="font-medium">
                    {cartao.card.exp_month.toString().padStart(2, "0")}/{cartao.card.exp_year.toString().slice(-2)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const renderPix = () => {
    if (pixKeys.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">Você ainda não tem chaves PIX cadastradas</p>
          <Button onClick={() => setAddingPix(true)} className="mt-4">
            Adicionar Chave PIX
          </Button>
        </div>
      )
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {pixKeys.map((pix: any) => (
          <Card key={pix._id} className="overflow-hidden">
            <CardHeader className="bg-primary/5 pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <QrCode className="h-5 w-5" />
                  {pix.nome}
                </CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEditPix(pix)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleRemovePix(pix._id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium">{pix.tipo.toUpperCase()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Chave</span>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">{pix.chave}</span>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyToClipboard(pix.chave)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-2xl font-bold mb-6">Métodos de Pagamento</h1>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-6">Métodos de Pagamento</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="cartoes">
        <TabsList className="mb-6">
          <TabsTrigger value="cartoes">Cartões</TabsTrigger>
          <TabsTrigger value="pix">PIX</TabsTrigger>
        </TabsList>

        <TabsContent value="cartoes" className="space-y-6">
          {renderCartoes()}

          <div className="flex justify-center mt-6">
            <Button onClick={() => setAddingCard(true)}>Adicionar Novo Cartão</Button>
          </div>
        </TabsContent>

        <TabsContent value="pix" className="space-y-6">
          {renderPix()}

          <div className="flex justify-center mt-6">
            <Button onClick={() => setAddingPix(true)}>Adicionar Nova Chave PIX</Button>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal para adicionar cartão */}
      <Dialog open={addingCard} onOpenChange={setAddingCard}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Cartão</DialogTitle>
            <DialogDescription>Adicione um novo cartão de crédito ou débito para pagamentos.</DialogDescription>
          </DialogHeader>

          <StripeCardElement
            onSuccess={handleCardSuccess}
            onCancel={() => setAddingCard(false)}
            isSubmitting={isSubmittingCard}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para adicionar PIX */}
      <Dialog open={addingPix} onOpenChange={setAddingPix}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Chave PIX</DialogTitle>
            <DialogDescription>Adicione uma nova chave PIX para recebimentos.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddPix}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="pixNome">Nome da Chave</Label>
                <Input
                  id="pixNome"
                  value={pixNome}
                  onChange={(e) => setPixNome(e.target.value)}
                  placeholder="Ex: PIX Pessoal"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pixTipo">Tipo de Chave</Label>
                <select
                  id="pixTipo"
                  value={pixTipo}
                  onChange={(e) => setPixTipo(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="pixChave">Chave PIX</Label>
                <Input
                  id="pixChave"
                  value={pixChave}
                  onChange={(e) => setPixChave(e.target.value)}
                  placeholder="Digite sua chave PIX"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddingPix(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar Chave PIX</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para editar PIX */}
      <Dialog open={!!editingPix} onOpenChange={(open) => !open && setEditingPix(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Chave PIX</DialogTitle>
            <DialogDescription>Atualize os dados da sua chave PIX.</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleEditPix}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editPixNome">Nome da Chave</Label>
                <Input
                  id="editPixNome"
                  value={editPixNome}
                  onChange={(e) => setEditPixNome(e.target.value)}
                  placeholder="Ex: PIX Pessoal"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPixTipo">Tipo de Chave</Label>
                <select
                  id="editPixTipo"
                  value={editPixTipo}
                  onChange={(e) => setEditPixTipo(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  required
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                  <option value="email">E-mail</option>
                  <option value="telefone">Telefone</option>
                  <option value="aleatoria">Chave Aleatória</option>
                </select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="editPixChave">Chave PIX</Label>
                <Input
                  id="editPixChave"
                  value={editPixChave}
                  onChange={(e) => setEditPixChave(e.target.value)}
                  placeholder="Digite sua chave PIX"
                  required
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditingPix(null)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar Alterações</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
