"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Truck, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function NovoProdutoContent() {
  const router = useRouter()
  const [fazEntrega, setFazEntrega] = useState(false)
  const [integracaoUber, setIntegracaoUber] = useState(false)

  const categorias = ["Calçados", "Roupas", "Acessórios", "Eletrônicos", "Serviços", "Outros"]

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Formulário enviado")
    // Implementar lógica de salvar
    router.push("/vitrine")
  }

  const handleCancel = () => {
    console.log("Cancelando e voltando para vitrine")
    router.push("/vitrine")
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center gap-2 mb-6">
        <Button variant="ghost" size="icon" onClick={handleCancel}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold mb-1">Novo Produto</h1>
          <p className="text-gray-500">Preencha as informações do seu produto ou serviço</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Básicas</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome do produto</Label>
              <Input id="nome" placeholder="Ex: Tênis Casual Masculino" />
            </div>

            <div>
              <Label htmlFor="descricao">Descrição breve</Label>
              <Textarea id="descricao" placeholder="Descreva seu produto em poucas palavras..." className="h-24" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoria">Categoria</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((categoria) => (
                      <SelectItem key={categoria} value={categoria.toLowerCase()}>
                        {categoria}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="preco">Preço (R$)</Label>
                <Input id="preco" type="number" step="0.01" placeholder="0,00" />
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Informações Complementares</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="informacoes">Informações adicionais</Label>
              <Textarea
                id="informacoes"
                placeholder="Adicione informações importantes sobre seu produto..."
                className="h-32"
              />
            </div>

            <div>
              <Label htmlFor="pagina">Página de vendas</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input id="pagina" placeholder="URL da sua oferta" className="pl-9" />
                  <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                </div>
                <Button variant="outline" type="button">
                  Verificar
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Entrega</h2>

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
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            )}
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" onClick={handleCancel}>
            Cancelar
          </Button>
          <Button type="submit">Salvar Produto</Button>
        </div>
      </form>
    </div>
  )
}

